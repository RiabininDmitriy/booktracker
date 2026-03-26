import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { Review } from '../entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Book])],
  providers: [ReviewsService, ReviewsRepository],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
