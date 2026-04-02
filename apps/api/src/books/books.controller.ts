import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { BookSearchResultDto } from './dto/book-search-result.dto';
import { BooksCatalogResponseDto } from './dto/books-catalog-response.dto';
import { BooksCatalogItemDto } from './dto/books-catalog-item.dto';
import { ListBooksDto } from './dto/list-books.dto';
import { SearchBooksDto } from './dto/search-books.dto';

@ApiTags('books')
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

  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BooksCatalogItemDto> {
    return this.booksService.findById(id);
  }
}
