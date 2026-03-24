export class RatingResponseDto {
  userId: string;
  bookId: string;
  value: number;
  avgRating: number | null;
}
