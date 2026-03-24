import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, UserRole } from '../entities';
import { Review } from '../entities/review.entity';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async create(
    userId: string,
    bookId: string,
    text: string,
  ): Promise<ReviewResponseDto> {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found`);
    }

    const existing = await this.reviewsRepository.findOne({
      where: { userId, bookId },
    });
    if (existing) {
      throw new ConflictException('Review for this book already exists');
    }

    const review = await this.reviewsRepository.save(
      this.reviewsRepository.create({
        userId,
        bookId,
        text,
      }),
    );

    return this.toDto(review);
  }

  async listByBook(bookId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsRepository.find({
      where: { bookId },
      order: { createdAt: 'DESC' },
    });
    return reviews.map((review) => this.toDto(review));
  }

  async update(
    reviewId: string,
    userId: string,
    userRole: UserRole,
    text: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with id "${reviewId}" not found`);
    }

    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can update only your own review');
    }

    review.text = text;
    const saved = await this.reviewsRepository.save(review);
    return this.toDto(saved);
  }

  async remove(
    reviewId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with id "${reviewId}" not found`);
    }

    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can delete only your own review');
    }

    await this.reviewsRepository.delete({ id: reviewId });
  }

  private toDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      userId: review.userId,
      bookId: review.bookId,
      text: review.text,
      createdAt: review.createdAt,
    };
  }
}
