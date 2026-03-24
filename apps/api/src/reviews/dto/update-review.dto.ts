import { IsString, MinLength } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @MinLength(1)
  text: string;
}
