import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Favorite } from '../entities/favorite.entity';
import { FavoriteToggleResponseDto } from './dto/favorite-toggle-response.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async toggle(
    userId: string,
    bookId: string,
  ): Promise<FavoriteToggleResponseDto> {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    const existing = await this.favoritesRepository.findOne({
      where: { userId, bookId },
    });

    if (existing) {
      await this.favoritesRepository.delete({ id: existing.id });
      return { userId, bookId, isFavorite: false };
    }

    await this.favoritesRepository.save(
      this.favoritesRepository.create({
        userId,
        bookId,
      }),
    );

    return { userId, bookId, isFavorite: true };
  }
}
