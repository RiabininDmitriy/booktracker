import { IsEnum, IsOptional } from 'class-validator';
import { ReadingStatusEnum } from '../../entities/reading-status.entity';

export class ListReadingStatusesDto {
  @IsOptional()
  @IsEnum(ReadingStatusEnum)
  status?: ReadingStatusEnum;
}
