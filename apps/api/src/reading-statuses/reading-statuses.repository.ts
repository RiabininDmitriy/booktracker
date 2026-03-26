import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import {
  ReadingStatus,
  ReadingStatusEnum,
} from '../entities/reading-status.entity';

@Injectable()
export class ReadingStatusesRepository {
  constructor(
    @InjectRepository(ReadingStatus)
    private readonly readingStatusesRepository: Repository<ReadingStatus>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  findBookById(bookId: string): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id: bookId } });
  }

  upsertForUserBook(
    userId: string,
    bookId: string,
    status: ReadingStatusEnum,
  ): Promise<void> {
    return this.readingStatusesRepository
      .upsert(
        {
          userId,
          bookId,
          status,
        },
        {
          conflictPaths: ['userId', 'bookId'],
        },
      )
      .then(() => undefined);
  }

  findByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<ReadingStatus | null> {
    return this.readingStatusesRepository.findOne({
      where: { userId, bookId },
    });
  }
}
