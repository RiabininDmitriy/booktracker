import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { BooksController } from './books.controller';
import { BooksRepository } from './books.repository';
import { BooksService } from './books.service';

const defaultOpenLibraryTimeoutMs = 5000;
const openLibraryTimeoutMs = Number(process.env.OPEN_LIBRARY_TIMEOUT_MS ?? defaultOpenLibraryTimeoutMs);

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    HttpModule.register({
      timeout:
        Number.isFinite(openLibraryTimeoutMs) && openLibraryTimeoutMs > 0
          ? openLibraryTimeoutMs
          : defaultOpenLibraryTimeoutMs,
      maxRedirects: 5,
    }),
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
})
export class BooksModule {}
