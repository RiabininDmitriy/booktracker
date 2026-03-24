import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReadingStatusResponseDto } from './dto/reading-status-response.dto';
import { UpsertReadingStatusDto } from './dto/upsert-reading-status.dto';
import { ReadingStatusesService } from './reading-statuses.service';

@Controller('reading-statuses')
@UseGuards(JwtAuthGuard)
export class ReadingStatusesController {
  constructor(
    private readonly readingStatusesService: ReadingStatusesService,
  ) {}

  @Put(':bookId')
  upsert(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Body() dto: UpsertReadingStatusDto,
    @CurrentUser() user: RequestUser | undefined,
  ): Promise<ReadingStatusResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    return this.readingStatusesService.upsert(user.id, bookId, dto.status);
  }
}
