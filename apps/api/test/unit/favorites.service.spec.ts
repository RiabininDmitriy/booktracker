import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesRepository } from '../../src/favorites/favorites.repository';
import { FavoritesService } from '../../src/favorites/favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoritesRepository: {
    findBookById: jest.Mock;
    toggleForUserBook: jest.Mock;
  };

  beforeEach(async () => {
    favoritesRepository = {
      findBookById: jest.fn(),
      toggleForUserBook: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: FavoritesRepository,
          useValue: favoritesRepository,
        },
      ],
    }).compile();

    service = testingModule.get<FavoritesService>(FavoritesService);
  });

  it('turns favorite on when not exists', async () => {
    favoritesRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    favoritesRepository.toggleForUserBook.mockResolvedValue(true);

    const result = await service.toggle('user-1', 'book-1');
    expect(result).toEqual({
      userId: 'user-1',
      bookId: 'book-1',
      isFavorite: true,
    });
  });

  it('turns favorite off when exists', async () => {
    favoritesRepository.findBookById.mockResolvedValue({ id: 'book-1' });
    favoritesRepository.toggleForUserBook.mockResolvedValue(false);

    const result = await service.toggle('user-1', 'book-1');
    expect(result).toEqual({
      userId: 'user-1',
      bookId: 'book-1',
      isFavorite: false,
    });
    expect(favoritesRepository.toggleForUserBook).toHaveBeenCalledWith(
      'user-1',
      'book-1',
    );
  });

  it('throws when book does not exist', async () => {
    favoritesRepository.findBookById.mockResolvedValue(null);

    await expect(
      service.toggle('user-1', 'missing-book'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
