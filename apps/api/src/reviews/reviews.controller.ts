import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('book/:bookId')
  listByBook(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewsService.listByBook(bookId);
  }

  @Post(':bookId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<ReviewResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.reviewsService.create(user.id, bookId, dto.text);
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<ReviewResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.reviewsService.update(reviewId, user.id, user.role, dto.text);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.reviewsService.remove(reviewId, user.id, user.role);
  }
}
