import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RatingsRepository } from '../../src/ratings/ratings.repository';
import { RatingsService } from '../../src/ratings/ratings.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingsRepository: {
    findBookById: jest.Mock;
    setRatingAndRecalculateAverage: jest.Mock;
  };

  beforeEach(async () => {
    ratingsRepository = {
      findBookById: jest.fn(),
      setRatingAndRecalculateAverage: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: RatingsRepository, useValue: ratingsRepository },
      ],
    }).compile();

    service = testingModule.get<RatingsService>(RatingsService);
  });

  it('sets rating and updates avg rating', async () => {
    ratingsRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    ratingsRepository.setRatingAndRecalculateAverage.mockResolvedValue(4.5);

    const result = await service.setRating('user-1', 'book-1', 5);

    expect(result).toMatchObject({
      userId: 'user-1',
      bookId: 'book-1',
      value: 5,
      avgRating: 4.5,
    });
    expect(
      ratingsRepository.setRatingAndRecalculateAverage,
    ).toHaveBeenCalledWith('user-1', 'book-1', 5);
  });

  it('throws when book does not exist', async () => {
    ratingsRepository.findBookById.mockResolvedValue(null);

    await expect(
      service.setRating('user-1', 'missing-book', 5),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
