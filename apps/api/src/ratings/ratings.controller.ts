import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RatingResponseDto } from './dto/rating-response.dto';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@ApiBearerAuth()
@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Put(':bookId')
  setRating(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Body() dto: UpsertRatingDto,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<RatingResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.ratingsService.setRating(user.id, bookId, dto.value);
  }
}
