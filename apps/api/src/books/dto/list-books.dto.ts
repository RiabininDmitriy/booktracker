import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class ListBooksDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 20;

  @IsIn(['rating', 'createdAt', 'title'])
  @IsOptional()
  sort: 'rating' | 'createdAt' | 'title' = 'createdAt';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  order: 'asc' | 'desc' = 'desc';

  @IsString()
  @MinLength(2)
  @IsOptional()
  q?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  author?: string;
}
