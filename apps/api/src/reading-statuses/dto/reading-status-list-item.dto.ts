import { ReadingStatusEnum } from '../../entities/reading-status.entity';
import { ReadingStatus } from '../../entities/reading-status.entity';

export class ReadingStatusListItemDto {
  userId: string;
  bookId: string;
  status: ReadingStatusEnum;
  updatedAt: Date;
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
  };

  constructor(readingStatus: ReadingStatus) {
    this.userId = readingStatus.userId;
    this.bookId = readingStatus.bookId;
    this.status = readingStatus.status;
    this.updatedAt = readingStatus.updatedAt;
    this.book = {
      id: readingStatus.book.id,
      title: readingStatus.book.title,
      author: readingStatus.book.author,
      coverUrl: readingStatus.book.coverUrl,
      avgRating: readingStatus.book.avgRating,
      reviewCount: readingStatus.book.reviewCount,
    };
  }
}
