import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book, UserRole } from '../entities';
import { Review } from '../entities/review.entity';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };
  let booksRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    reviewsRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    booksRepository = {
      findOne: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewsRepository },
        { provide: getRepositoryToken(Book), useValue: booksRepository },
      ],
    }).compile();

    service = testingModule.get<ReviewsService>(ReviewsService);
  });

  it('creates review for existing book', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    reviewsRepository.findOne.mockResolvedValue(null);
    reviewsRepository.save.mockResolvedValue({
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
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    reviewsRepository.findOne.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create('user-1', 'book-1', 'dup'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbids non-owner update when not admin', async () => {
    reviewsRepository.findOne.mockResolvedValue({
      id: 'review-1',
      userId: 'owner-1',
      text: 'old',
    });

    await expect(
      service.update('review-1', 'other-user', UserRole.USER, 'new'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to delete any review', async () => {
    reviewsRepository.findOne.mockResolvedValue({
      id: 'review-1',
      userId: 'owner-1',
    });
    reviewsRepository.delete.mockResolvedValue(undefined);

    await service.remove('review-1', 'admin-user', UserRole.ADMIN);
    expect(reviewsRepository.delete).toHaveBeenCalledWith({ id: 'review-1' });
  });

  it('throws not found when updating missing review', async () => {
    reviewsRepository.findOne.mockResolvedValue(null);
    await expect(
      service.update('missing', 'user-1', UserRole.USER, 'new'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
