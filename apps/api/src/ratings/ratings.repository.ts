import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class RatingsRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  findBookById(bookId: string): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id: bookId } });
  }

  async setRatingAndRecalculateAverage(userId: string, bookId: string, value: number): Promise<number | null> {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Rating).upsert(
        {
          userId,
          bookId,
          value,
        },
        {
          conflictPaths: ['userId', 'bookId'],
        },
      );

      const avgRowsUnknown: unknown = await manager.query(
        `SELECT AVG(value)::numeric(3,2) AS avg FROM ratings WHERE book_id = $1`,
        [bookId],
      );
      const avgRows = this.parseAvgRows(avgRowsUnknown);
      const avg = avgRows[0]?.avg ?? null;
      const avgRating = avg != null ? Number(avg) : null;

      await manager.getRepository(Book).update({ id: bookId }, { avgRating });

      return avgRating;
    });
  }

  private parseAvgRows(value: unknown): Array<{ avg: string | null }> {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((row): row is { avg?: unknown } => typeof row === 'object' && row !== null && 'avg' in row)
      .map((row) => ({
        avg: typeof row.avg === 'string' || row.avg === null ? row.avg : null,
      }));
  }
}
