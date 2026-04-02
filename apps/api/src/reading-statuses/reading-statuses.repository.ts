import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReadingStatus,
  ReadingStatusEnum,
} from '../entities/reading-status.entity';

@Injectable()
export class ReadingStatusesRepository {
  constructor(
    @InjectRepository(ReadingStatus)
    private readonly readingStatusesRepository: Repository<ReadingStatus>,
  ) {}

  async setForUserBook(
    userId: string,
    bookId: string,
    status: ReadingStatusEnum,
  ): Promise<ReadingStatus> {
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

    const result = await this.readingStatusesRepository.findOne({
      where: { userId, bookId },
    });

    return result!;
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
