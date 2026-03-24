import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { Favorite } from '../entities/favorite.entity';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoritesRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let booksRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    favoritesRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
      delete: jest.fn(),
    };
    booksRepository = {
      findOne: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: favoritesRepository,
        },
        { provide: getRepositoryToken(Book), useValue: booksRepository },
      ],
    }).compile();

    service = testingModule.get<FavoritesService>(FavoritesService);
  });

  it('turns favorite on when not exists', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    favoritesRepository.findOne.mockResolvedValue(null);
    favoritesRepository.save.mockResolvedValue(undefined);

    const result = await service.toggle('user-1', 'book-1');
    expect(result).toEqual({
      userId: 'user-1',
      bookId: 'book-1',
      isFavorite: true,
    });
  });

  it('turns favorite off when exists', async () => {
    booksRepository.findOne.mockResolvedValue({ id: 'book-1' });
    favoritesRepository.findOne.mockResolvedValue({ id: 'fav-1' });
    favoritesRepository.delete.mockResolvedValue(undefined);

    const result = await service.toggle('user-1', 'book-1');
    expect(result).toEqual({
      userId: 'user-1',
      bookId: 'book-1',
      isFavorite: false,
    });
    expect(favoritesRepository.delete).toHaveBeenCalledWith({ id: 'fav-1' });
  });

  it('throws when book does not exist', async () => {
    booksRepository.findOne.mockResolvedValue(null);

    await expect(
      service.toggle('user-1', 'missing-book'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
