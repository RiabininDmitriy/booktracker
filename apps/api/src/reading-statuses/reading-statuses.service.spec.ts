import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import {
  ReadingStatus,
  ReadingStatusEnum,
} from '../entities/reading-status.entity';
import { ReadingStatusesService } from './reading-statuses.service';

describe('ReadingStatusesService', () => {
  let service: ReadingStatusesService;
  let readingStatusesRepository: {
    upsert: jest.Mock;
    findOne: jest.Mock;
  };
  let booksRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    readingStatusesRepository = {
      upsert: jest.fn(),
      findOne: jest.fn(),
    };
    booksRepository = {
      findOne: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingStatusesService,
        {
          provide: getRepositoryToken(ReadingStatus),
          useValue: readingStatusesRepository,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: booksRepository,
        },
      ],
    }).compile();

    service = testingModule.get<ReadingStatusesService>(ReadingStatusesService);
  });

  it('upserts and returns saved reading status', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    readingStatusesRepository.upsert.mockResolvedValue(undefined);
    readingStatusesRepository.findOne.mockResolvedValue({
      userId: 'user-1',
      bookId: 'book-1',
      status: ReadingStatusEnum.PLANNED,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.upsert(
      'user-1',
      'book-1',
      ReadingStatusEnum.PLANNED,
    );

    expect(result).toMatchObject({
      userId: 'user-1',
      bookId: 'book-1',
      status: ReadingStatusEnum.PLANNED,
    });
    expect(readingStatusesRepository.upsert).toHaveBeenCalledTimes(1);
  });

  it('throws when book does not exist', async () => {
    booksRepository.findOne.mockResolvedValue(null);

    await expect(
      service.upsert('user-1', 'missing-book', ReadingStatusEnum.PLANNED),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when row not found after upsert', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    readingStatusesRepository.upsert.mockResolvedValue(undefined);
    readingStatusesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.upsert('user-1', 'book-1', ReadingStatusEnum.READING),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
