import {
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
import { FavoriteToggleResponseDto } from './dto/favorite-toggle-response.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Put(':bookId/toggle')
  toggle(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<FavoriteToggleResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.favoritesService.toggle(user.id, bookId);
  }
}
