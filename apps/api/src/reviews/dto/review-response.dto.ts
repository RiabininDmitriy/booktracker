export class ReviewResponseDto {
  id: string;
  userId: string;
  bookId: string;
  text: string;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}
