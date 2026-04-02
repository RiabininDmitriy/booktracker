import { Book } from '../../entities/book.entity';

export class ReadingStatusBookDto {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  avgRating: number | null;
  reviewCount: number;

  constructor(book: Book) {
    this.id = book.id;
    this.title = book.title;
    this.author = book.author;
    this.coverUrl = book.coverUrl;
    this.avgRating = book.avgRating;
    this.reviewCount = book.reviewCount;
  }
}
