import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { BookSearchResultDto } from './dto/book-search-result.dto';
import { SearchBooksDto } from './dto/search-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  search(@Query() query: SearchBooksDto): Promise<BookSearchResultDto[]> {
    return this.booksService.search(query.q);
  }
}
