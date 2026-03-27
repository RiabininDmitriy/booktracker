import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import {
  ReadingStatus,
  ReadingStatusEnum,
} from '../entities/reading-status.entity';

@Injectable()
export class ReadingStatusesRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReadingStatus)
    private readonly readingStatusesRepository: Repository<ReadingStatus>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  setForUserBook(
    userId: string,
    bookId: string,
    status: ReadingStatusEnum,
  ): Promise<ReadingStatus | null> {
    return this.dataSource.transaction(async (manager) => {
      const booksRepository = manager.getRepository(Book);
      const readingStatusesRepository = manager.getRepository(ReadingStatus);

      const bookExists = await booksRepository.exist({ where: { id: bookId } });
      if (!bookExists) {
        return null;
      }

      await readingStatusesRepository.upsert(
        {
          userId,
          bookId,
          status,
        },
        {
          conflictPaths: ['userId', 'bookId'],
        },
      );

      return readingStatusesRepository.findOne({
        where: { userId, bookId },
      });
    });
  }

  findByUser(
    userId: string,
    status?: ReadingStatusEnum,
  ): Promise<ReadingStatus[]> {
    const qb = this.readingStatusesRepository
      .createQueryBuilder('rs')
      .leftJoinAndSelect('rs.book', 'book')
      .where('rs.userId = :userId', { userId });

    if (status) {
      qb.andWhere('rs.status = :status', { status });
    }

    return qb
      .orderBy('rs.updatedAt', 'DESC')
      .addOrderBy('book.title', 'ASC')
      .getMany();
  }
}
