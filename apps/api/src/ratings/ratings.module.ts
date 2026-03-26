import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { Rating } from '../entities/rating.entity';
import { RatingsController } from './ratings.controller';
import { RatingsRepository } from './ratings.repository';
import { RatingsService } from './ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Book])],
  providers: [RatingsService, RatingsRepository],
  controllers: [RatingsController],
})
export class RatingsModule {}
