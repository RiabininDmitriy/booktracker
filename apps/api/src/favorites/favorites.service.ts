import { Injectable, NotFoundException } from '@nestjs/common';
import { FavoriteToggleResponseDto } from './dto/favorite-toggle-response.dto';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async toggle(
    userId: string,
    bookId: string,
  ): Promise<FavoriteToggleResponseDto> {
    const book = await this.favoritesRepository.findBookById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    const isFavorite = await this.favoritesRepository.toggleForUserBook(
      userId,
      bookId,
    );

    return { userId, bookId, isFavorite };
  }
}
