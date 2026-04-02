import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListReadingStatusesDto } from './dto/list-reading-statuses.dto';
import { ReadingStatusListItemDto } from './dto/reading-status-list-item.dto';
import { ReadingStatusResponseDto } from './dto/reading-status-response.dto';
import { UpsertReadingStatusDto } from './dto/upsert-reading-status.dto';
import { ReadingStatusesService } from './reading-statuses.service';

@ApiTags('reading-statuses')
@ApiBearerAuth()
@Controller('reading-statuses')
@UseGuards(JwtAuthGuard)
export class ReadingStatusesController {
  constructor(private readonly readingStatusesService: ReadingStatusesService) {}

  @Get('me')
  listMyReadingStatuses(
    @CurrentUser() user: RequestUser | undefined,
    @Query() query: ListReadingStatusesDto,
  ): Promise<ReadingStatusListItemDto[]> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.readingStatusesService.listForUser(user.id, query.status);
  }

  @Put(':bookId')
  setReadingStatus(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Body() dto: UpsertReadingStatusDto,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<ReadingStatusResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.readingStatusesService.setReadingStatus(user.id, bookId, dto.status);
  }
}
