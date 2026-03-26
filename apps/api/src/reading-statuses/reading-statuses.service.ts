import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingStatusEnum } from '../entities/reading-status.entity';
import { ReadingStatusResponseDto } from './dto/reading-status-response.dto';
import { ReadingStatusesRepository } from './reading-statuses.repository';

@Injectable()
export class ReadingStatusesService {
  constructor(
    private readonly readingStatusesRepository: ReadingStatusesRepository,
  ) {}

  async setReadingStatus(
    userId: string,
    bookId: string,
    status: ReadingStatusEnum,
  ): Promise<ReadingStatusResponseDto> {
    const book = await this.readingStatusesRepository.findBookById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    await this.readingStatusesRepository.upsertForUserBook(
      userId,
      bookId,
      status,
    );

    const saved = await this.readingStatusesRepository.findByUserAndBook(
      userId,
      bookId,
    );
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
