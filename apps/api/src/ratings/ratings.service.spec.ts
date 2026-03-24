import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { Rating } from '../entities/rating.entity';
import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingsRepository: {
    upsert: jest.Mock;
    query: jest.Mock;
  };
  let booksRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    ratingsRepository = {
      upsert: jest.fn(),
      query: jest.fn(),
    };
    booksRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: getRepositoryToken(Rating), useValue: ratingsRepository },
        { provide: getRepositoryToken(Book), useValue: booksRepository },
      ],
    }).compile();

    service = testingModule.get<RatingsService>(RatingsService);
  });

  it('upserts rating and updates avg rating', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    ratingsRepository.upsert.mockResolvedValue(undefined);
    ratingsRepository.query.mockResolvedValue([{ avg: '4.50' }]);
    booksRepository.update.mockResolvedValue(undefined);

    const result = await service.upsert('user-1', 'book-1', 5);

    expect(result).toMatchObject({
      userId: 'user-1',
      bookId: 'book-1',
      value: 5,
      avgRating: 4.5,
    });
    expect(booksRepository.update).toHaveBeenCalledWith(
      { id: 'book-1' },
      { avgRating: 4.5 },
    );
  });

  it('throws when book does not exist', async () => {
    booksRepository.findOne.mockResolvedValue(null);

    await expect(
      service.upsert('user-1', 'missing-book', 5),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
