import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { ReadingStatus } from '../entities/reading-status.entity';
import { ReadingStatusesController } from './reading-statuses.controller';
import { ReadingStatusesRepository } from './reading-statuses.repository';
import { ReadingStatusesService } from './reading-statuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingStatus, Book])],
  providers: [ReadingStatusesService, ReadingStatusesRepository],
  controllers: [ReadingStatusesController],
})
export class ReadingStatusesModule {}
