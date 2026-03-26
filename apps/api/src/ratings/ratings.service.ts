import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingResponseDto } from './dto/rating-response.dto';
import { RatingsRepository } from './ratings.repository';

@Injectable()
export class RatingsService {
  constructor(private readonly ratingsRepository: RatingsRepository) {}

  async setRating(
    userId: string,
    bookId: string,
    value: number,
  ): Promise<RatingResponseDto> {
    const book = await this.ratingsRepository.findBookById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    const avgRating =
      await this.ratingsRepository.setRatingAndRecalculateAverage(
        userId,
        bookId,
        value,
      );

    return {
      userId,
      bookId,
      value,
      avgRating,
    };
  }
}
