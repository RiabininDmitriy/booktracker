import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchBooksDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  q: string;
}
