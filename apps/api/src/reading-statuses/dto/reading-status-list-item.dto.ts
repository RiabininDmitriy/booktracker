import { ReadingStatusEnum } from '../../entities/reading-status.entity';
import { ReadingStatus } from '../../entities/reading-status.entity';
import { ReadingStatusBookDto } from './reading-status-book.dto';

export class ReadingStatusListItemDto {
  userId: string;
  bookId: string;
  status: ReadingStatusEnum;
  updatedAt: Date;
  book: ReadingStatusBookDto;

  constructor(readingStatus: ReadingStatus) {
    this.userId = readingStatus.userId;
    this.bookId = readingStatus.bookId;
    this.status = readingStatus.status;
    this.updatedAt = readingStatus.updatedAt;
    this.book = new ReadingStatusBookDto(readingStatus.book);
  }
}
