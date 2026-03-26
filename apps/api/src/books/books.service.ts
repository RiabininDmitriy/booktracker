import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BookSearchResultDto } from './dto/book-search-result.dto';
import { BooksCatalogItemDto } from './dto/books-catalog-item.dto';
import { BooksCatalogResponseDto } from './dto/books-catalog-response.dto';
import { ListBooksDto } from './dto/list-books.dto';
import { BooksRepository } from './books.repository';

type OpenLibrarySearchDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

type OpenLibrarySearchResponse = {
  docs?: OpenLibrarySearchDoc[];
};

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  private static readonly OPEN_LIBRARY_SEARCH_URL =
    'https://openlibrary.org/search.json';

  constructor(
    private readonly httpService: HttpService,
    private readonly booksCatalogRepository: BooksRepository,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async list(query: ListBooksDto): Promise<BooksCatalogResponseDto> {
    const { page, limit, query: searchQuery, author } = query;
    const offset = (page - 1) * limit;
    const [books, total] = await this.booksCatalogRepository.findCatalogBooks({
      searchQuery,
      author,
      sort: query.sort ?? 'createdAt',
      order: query.order ?? 'desc',
      offset,
      limit,
    });

    return {
      items: books.map((book) => new BooksCatalogItemDto(book)),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async search(query: string): Promise<BookSearchResultDto[]> {
    let results: BookSearchResultDto[];

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<OpenLibrarySearchResponse>(
          BooksService.OPEN_LIBRARY_SEARCH_URL,
          {
            params: {
              q: query,
              limit: 20,
            },
          },
        ),
      );

      results = (data.docs ?? [])
        .filter((doc) => doc.key && doc.title)
        .map((doc) => this.mapOpenLibraryDoc(doc));
    } catch (error) {
      const axiosError = error as AxiosError<unknown>;
      this.logger.error('OpenLibrary request failed', axiosError.message);
      throw new BadGatewayException('Failed to fetch books from OpenLibrary');
    }

    try {
      await this.cacheBooks(results);
    } catch (error) {
      const persistError = error as Error;
      this.logger.warn(
        `Failed to persist OpenLibrary books to local database: ${persistError.message}`,
      );
    }

    return results;
  }

  private mapOpenLibraryDoc(doc: OpenLibrarySearchDoc): BookSearchResultDto {
    return {
      externalId: this.normalizeExternalId(doc.key),
      title: doc.title ?? 'Unknown title',
      author: doc.author_name?.[0] ?? null,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null,
      firstPublishYear: doc.first_publish_year ?? null,
    };
  }

  private normalizeExternalId(key: string | undefined): string {
    if (!key) return '';
    return key.replace('/works/', '');
  }

  private async cacheBooks(books: BookSearchResultDto[]): Promise<void> {
    const payload = books
      .filter((book) => book.externalId?.trim())
      .map((book) => ({
        externalId: book.externalId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        description: null,
      }));
    if (payload.length === 0) return;

    await this.booksRepository.upsert(payload, {
      conflictPaths: ['externalId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
