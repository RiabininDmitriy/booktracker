import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BooksRepository } from './books.repository';
import { BookSearchResultDto } from './dto/book-search-result.dto';
import { BooksCatalogItemDto } from './dto/books-catalog-item.dto';
import { BooksCatalogResponseDto } from './dto/books-catalog-response.dto';
import { ListBooksDto } from './dto/list-books.dto';

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

type GutendexAuthor = {
  name?: string;
};

type GutendexFormats = {
  'image/jpeg'?: string;
};

type GutendexBook = {
  id?: number;
  title?: string;
  authors?: GutendexAuthor[];
  formats?: GutendexFormats;
};

type GutendexResponse = {
  results?: GutendexBook[];
};

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  private static readonly OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
  private static readonly GUTENDEX_SEARCH_URL = 'https://gutendex.com/books/';
  private static readonly OPEN_LIBRARY_USER_AGENT =
    process.env.OPEN_LIBRARY_USER_AGENT ?? 'Booktracker/1.0 (+https://github.com/DmytroRiabinin/booktracker)';

  constructor(
    private readonly httpService: HttpService,
    private readonly booksCatalogRepository: BooksRepository,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async list(query: ListBooksDto): Promise<BooksCatalogResponseDto> {
    const { page, limit, query: searchQuery, author } = query;
    const offset = (page - 1) * limit;
    let [books, total] = await this.booksCatalogRepository.findCatalogBooks({
      searchQuery,
      author,
      sort: query.sort ?? 'createdAt',
      order: query.order ?? 'desc',
      offset,
      limit,
    });

    // If the first page has too few local matches for a text query, hydrate cache from
    // OpenLibrary and retry once so search isn't limited to pre-seeded local data.
    const normalizedQuery = searchQuery?.trim();
    const shouldHydrateFromOpenLibrary = Boolean(normalizedQuery) && page === 1 && total < limit;

    if (shouldHydrateFromOpenLibrary && normalizedQuery) {
      try {
        await this.search(normalizedQuery);
        [books, total] = await this.booksCatalogRepository.findCatalogBooks({
          searchQuery: normalizedQuery,
          author,
          sort: query.sort ?? 'createdAt',
          order: query.order ?? 'desc',
          offset,
          limit,
        });
      } catch (error) {
        const openLibraryError = error as Error;
        this.logger.warn(`Catalog fallback search failed: ${openLibraryError.message}`);
      }
    }

    return {
      items: books.map((book) => new BooksCatalogItemDto(book)),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async findById(bookId: string): Promise<BooksCatalogItemDto> {
    const book = await this.booksCatalogRepository.findById(bookId);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return new BooksCatalogItemDto(book);
  }

  async search(query: string): Promise<BookSearchResultDto[]> {
    let results: BookSearchResultDto[];

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<OpenLibrarySearchResponse>(BooksService.OPEN_LIBRARY_SEARCH_URL, {
          params: {
            q: query,
            limit: 20,
          },
          headers: {
            'User-Agent': BooksService.OPEN_LIBRARY_USER_AGENT,
            Accept: 'application/json',
          },
        }),
      );

      results = (data.docs ?? []).filter((doc) => doc.key && doc.title).map((doc) => this.mapOpenLibraryDoc(doc));
    } catch (error) {
      const axiosError = error as AxiosError<unknown>;
      this.logger.warn(`OpenLibrary request failed, trying Gutendex fallback: ${axiosError.message}`);

      try {
        const { data } = await firstValueFrom(
          this.httpService.get<GutendexResponse>(BooksService.GUTENDEX_SEARCH_URL, {
            params: {
              search: query,
            },
            headers: {
              Accept: 'application/json',
            },
          }),
        );

        results = (data.results ?? [])
          .filter((book) => Boolean(book.id && book.title))
          .map((book) => this.mapGutendexBook(book));
      } catch (fallbackError) {
        const fallbackAxiosError = fallbackError as AxiosError<unknown>;
        this.logger.error('Gutendex fallback request failed', fallbackAxiosError.message);
        throw new BadGatewayException('Failed to fetch books from external providers');
      }
    }

    try {
      await this.cacheBooks(results);
    } catch (error) {
      const persistError = error as Error;
      this.logger.warn(`Failed to persist OpenLibrary books to local database: ${persistError.message}`);
    }

    return results;
  }

  private mapOpenLibraryDoc(doc: OpenLibrarySearchDoc): BookSearchResultDto {
    return {
      externalId: this.normalizeExternalId(doc.key),
      title: doc.title ?? 'Unknown title',
      author: doc.author_name?.[0] ?? null,
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
      firstPublishYear: doc.first_publish_year ?? null,
    };
  }

  private mapGutendexBook(book: GutendexBook): BookSearchResultDto {
    return {
      externalId: `gutendex:${String(book.id)}`,
      title: book.title ?? 'Unknown title',
      author: book.authors?.[0]?.name ?? null,
      coverUrl: book.formats?.['image/jpeg'] ?? null,
      firstPublishYear: null,
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
