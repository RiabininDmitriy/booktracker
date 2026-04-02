import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  findBookById(bookId: string): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id: bookId } });
  }

  findByUserAndBook(userId: string, bookId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({ where: { userId, bookId } });
  }

  createReview(userId: string, bookId: string, text: string): Promise<Review> {
    return this.reviewsRepository.save(
      this.reviewsRepository.create({
        userId,
        bookId,
        text,
      }),
    );
  }

  findByBookOrdered(bookId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { bookId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  findById(reviewId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({ where: { id: reviewId } });
  }

  save(review: Review): Promise<Review> {
    return this.reviewsRepository.save(review);
  }

  deleteById(reviewId: string): Promise<void> {
    return this.reviewsRepository.delete({ id: reviewId }).then(() => undefined);
  }
}
