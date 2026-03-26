import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  findBookById(bookId: string): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id: bookId } });
  }

  async toggleForUserBook(userId: string, bookId: string): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const favoritesRepo = manager.getRepository(Favorite);
      const existing = await favoritesRepo.findOne({
        where: { userId, bookId },
      });

      if (existing) {
        await favoritesRepo.delete({ id: existing.id });
        return false;
      }

      await favoritesRepo.save(
        favoritesRepo.create({
          userId,
          bookId,
        }),
      );
      return true;
    });
  }
}
