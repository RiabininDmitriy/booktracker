import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';

type CatalogQueryOptions = {
  searchQuery?: string;
  author?: string;
  sort: 'rating' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
  offset: number;
  limit: number;
};

@Injectable()
export class BooksRepository {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  findById(bookId: string): Promise<Book | null> {
    return this.repository.findOne({ where: { id: bookId } });
  }

  findCatalogBooks(options: CatalogQueryOptions): Promise<[Book[], number]> {
    const sortMap = {
      rating: 'book.avgRating',
      createdAt: 'book.createdAt',
      title: 'book.title',
    } as const;
    const sortField = sortMap[options.sort];
    const sortOrder = options.order.toUpperCase() as 'ASC' | 'DESC';

    const qb = this.repository.createQueryBuilder('book');

    if (options.searchQuery) {
      qb.andWhere('(book.title ILIKE :query OR book.author ILIKE :query)', {
        query: `%${options.searchQuery}%`,
      });
    }

    if (options.author) {
      qb.andWhere('book.author ILIKE :author', {
        author: `%${options.author}%`,
      });
    }

    if (sortField === 'book.avgRating') {
      qb.orderBy(sortField, sortOrder, 'NULLS LAST');
    } else {
      qb.orderBy(sortField, sortOrder);
    }
    // Deterministic tie-breakers keep pagination stable across calls.
    qb.addOrderBy('book.createdAt', 'DESC').addOrderBy('book.id', 'ASC');

    qb.skip(options.offset).take(options.limit);

    return qb.getManyAndCount();
  }
}
