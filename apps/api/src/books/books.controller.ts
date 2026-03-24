import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { BookSearchResultDto } from './dto/book-search-result.dto';
import { BooksCatalogResponseDto } from './dto/books-catalog-item.dto';
import { ListBooksDto } from './dto/list-books.dto';
import { SearchBooksDto } from './dto/search-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  list(@Query() query: ListBooksDto): Promise<BooksCatalogResponseDto> {
    return this.booksService.list(query);
  }

  @Get('search')
  search(@Query() query: SearchBooksDto): Promise<BookSearchResultDto[]> {
    return this.booksService.search(query.q);
  }
}
