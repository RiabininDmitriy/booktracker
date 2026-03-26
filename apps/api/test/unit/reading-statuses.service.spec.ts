import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReadingStatusEnum } from '../../src/entities/reading-status.entity';
import { ReadingStatusesRepository } from '../../src/reading-statuses/reading-statuses.repository';
import { ReadingStatusesService } from '../../src/reading-statuses/reading-statuses.service';

describe('ReadingStatusesService', () => {
  let service: ReadingStatusesService;
  let readingStatusesRepository: {
    findBookById: jest.Mock;
    upsertForUserBook: jest.Mock;
    findByUserAndBook: jest.Mock;
  };

  beforeEach(async () => {
    readingStatusesRepository = {
      findBookById: jest.fn(),
      upsertForUserBook: jest.fn(),
      findByUserAndBook: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingStatusesService,
        {
          provide: ReadingStatusesRepository,
          useValue: readingStatusesRepository,
        },
      ],
    }).compile();

    service = testingModule.get<ReadingStatusesService>(ReadingStatusesService);
  });

  it('sets and returns saved reading status', async () => {
    readingStatusesRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    readingStatusesRepository.upsertForUserBook.mockResolvedValue(undefined);
    readingStatusesRepository.findByUserAndBook.mockResolvedValue({
      userId: 'user-1',
      bookId: 'book-1',
      status: ReadingStatusEnum.PLANNED,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.setReadingStatus(
      'user-1',
      'book-1',
      ReadingStatusEnum.PLANNED,
    );

    expect(result).toMatchObject({
      userId: 'user-1',
      bookId: 'book-1',
      status: ReadingStatusEnum.PLANNED,
    });
    expect(readingStatusesRepository.upsertForUserBook).toHaveBeenCalledTimes(
      1,
    );
  });

  it('throws when book does not exist', async () => {
    readingStatusesRepository.findBookById.mockResolvedValue(null);

    await expect(
      service.setReadingStatus(
        'user-1',
        'missing-book',
        ReadingStatusEnum.PLANNED,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when row not found after upsert', async () => {
    readingStatusesRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    readingStatusesRepository.upsertForUserBook.mockResolvedValue(undefined);
    readingStatusesRepository.findByUserAndBook.mockResolvedValue(null);

    await expect(
      service.setReadingStatus('user-1', 'book-1', ReadingStatusEnum.READING),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
