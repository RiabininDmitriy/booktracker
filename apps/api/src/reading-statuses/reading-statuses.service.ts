import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingStatusEnum } from '../entities/reading-status.entity';
import { ReadingStatusListItemDto } from './dto/reading-status-list-item.dto';
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
    const saved = await this.readingStatusesRepository.setForUserBook(
      userId,
      bookId,
      status,
    );
    if (!saved) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    return {
      userId: saved.userId,
      bookId: saved.bookId,
      status: saved.status,
      updatedAt: saved.updatedAt,
    };
  }

  async listForUser(
    userId: string,
    status?: ReadingStatusEnum,
  ): Promise<ReadingStatusListItemDto[]> {
    const readingStatuses = await this.readingStatusesRepository.findByUser(
      userId,
      status,
    );

    return readingStatuses.map((item) => new ReadingStatusListItemDto(item));
  }
}
