import { ReadingStatusEnum } from '../../entities/reading-status.entity';

export class ReadingStatusResponseDto {
  userId: string;
  bookId: string;
  status: ReadingStatusEnum;
  updatedAt: Date;
}
