import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../src/entities';
import { ReviewsRepository } from '../../src/reviews/reviews.repository';
import { ReviewsService } from '../../src/reviews/reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: {
    findBookById: jest.Mock;
    findByUserAndBook: jest.Mock;
    createReview: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
    deleteById: jest.Mock;
    findByBookOrdered: jest.Mock;
  };

  beforeEach(async () => {
    reviewsRepository = {
      findBookById: jest.fn(),
      findByUserAndBook: jest.fn(),
      createReview: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      findByBookOrdered: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: reviewsRepository },
      ],
    }).compile();

    service = testingModule.get<ReviewsService>(ReviewsService);
  });

  it('creates review for existing book', async () => {
    reviewsRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    reviewsRepository.findByUserAndBook.mockResolvedValue(null);
    reviewsRepository.createReview.mockResolvedValue({
      id: 'review-1',
      userId: 'user-1',
      bookId: 'book-1',
      text: 'hello',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.create('user-1', 'book-1', 'hello');
    expect(result).toMatchObject({ id: 'review-1', text: 'hello' });
  });

  it('throws conflict for duplicate review', async () => {
    reviewsRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    reviewsRepository.findByUserAndBook.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create('user-1', 'book-1', 'dup'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbids non-owner update when not admin', async () => {
    reviewsRepository.findById.mockResolvedValue({
      id: 'review-1',
      userId: 'owner-1',
      text: 'old',
    });

    await expect(
      service.update('review-1', 'other-user', UserRole.USER, 'new'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to delete any review', async () => {
    reviewsRepository.findById.mockResolvedValue({
      id: 'review-1',
      userId: 'owner-1',
    });
    reviewsRepository.deleteById.mockResolvedValue(undefined);

    await service.remove('review-1', 'admin-user', UserRole.ADMIN);
    expect(reviewsRepository.deleteById).toHaveBeenCalledWith('review-1');
  });

  it('throws not found when updating missing review', async () => {
    reviewsRepository.findById.mockResolvedValue(null);
    await expect(
      service.update('missing', 'user-1', UserRole.USER, 'new'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
