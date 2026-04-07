import { IsString, Length } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  @Length(10, 255)
  token: string;
}
