import { IsEnum } from 'class-validator';
import { ReadingStatusEnum } from '../../entities/reading-status.entity';

export class UpsertReadingStatusDto {
  @IsEnum(ReadingStatusEnum)
  status: ReadingStatusEnum;
}
