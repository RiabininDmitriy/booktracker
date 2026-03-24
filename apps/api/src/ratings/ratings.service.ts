import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Rating } from '../entities/rating.entity';
import { RatingResponseDto } from './dto/rating-response.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async upsert(
    userId: string,
    bookId: string,
    value: number,
  ): Promise<RatingResponseDto> {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    await this.ratingsRepository.upsert(
      {
        userId,
        bookId,
        value,
      },
      {
        conflictPaths: ['userId', 'bookId'],
      },
    );

    const avgRowsUnknown: unknown = await this.ratingsRepository.query(
      `SELECT AVG(value)::numeric(3,2) AS avg FROM ratings WHERE book_id = $1`,
      [bookId],
    );
    const avgRows = this.parseAvgRows(avgRowsUnknown);
    const avg = avgRows[0]?.avg ?? null;
    const avgRating = avg != null ? Number(avg) : null;

    await this.booksRepository.update({ id: bookId }, { avgRating });

    return {
      userId,
      bookId,
      value,
      avgRating,
    };
  }

  private parseAvgRows(value: unknown): Array<{ avg: string | null }> {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (row): row is { avg?: unknown } =>
          typeof row === 'object' && row !== null && 'avg' in row,
      )
      .map((row) => ({
        avg: typeof row.avg === 'string' || row.avg === null ? row.avg : null,
      }));
  }
}
