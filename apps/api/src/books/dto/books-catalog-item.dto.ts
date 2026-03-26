import { Book } from '../../entities/book.entity';

export class BooksCatalogItemDto {
  id: string;
  externalId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  createdAt: Date;

  constructor(book: Book) {
    this.id = book.id;
    this.externalId = book.externalId;
    this.title = book.title;
    this.author = book.author;
    this.coverUrl = book.coverUrl;
    this.avgRating = book.avgRating;
    this.reviewCount = book.reviewCount;
    this.createdAt = book.createdAt;
  }
}
