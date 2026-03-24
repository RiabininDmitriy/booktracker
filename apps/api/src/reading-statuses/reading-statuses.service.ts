import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { ReadingStatus } from '../entities/reading-status.entity';
import { ReadingStatusEnum } from '../entities/reading-status.entity';
import { ReadingStatusResponseDto } from './dto/reading-status-response.dto';

@Injectable()
export class ReadingStatusesService {
  constructor(
    @InjectRepository(ReadingStatus)
    private readonly readingStatusesRepository: Repository<ReadingStatus>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async upsert(
    userId: string,
    bookId: string,
    status: ReadingStatusEnum,
  ): Promise<ReadingStatusResponseDto> {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    await this.readingStatusesRepository.upsert(
      {
        userId,
        bookId,
        status,
      },
      {
        conflictPaths: ['userId', 'bookId'],
      },
    );

    const saved = await this.readingStatusesRepository.findOne({
      where: { userId, bookId },
    });
    if (!saved) {
      throw new NotFoundException('Reading status was not found after upsert');
    }

    return {
      userId: saved.userId,
      bookId: saved.bookId,
      status: saved.status,
      updatedAt: saved.updatedAt,
    };
  }
}
