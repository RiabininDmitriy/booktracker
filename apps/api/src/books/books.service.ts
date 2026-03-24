import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BookSearchResultDto } from './dto/book-search-result.dto';

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
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async search(query: string): Promise<BookSearchResultDto[]> {
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

      const results = (data.docs ?? [])
        .filter((doc) => doc.key && doc.title)
        .map((doc) => this.mapOpenLibraryDoc(doc));

      await this.cacheBooks(results);

      return results;
    } catch (error) {
      const axiosError = error as AxiosError<unknown>;
      this.logger.error('OpenLibrary request failed', axiosError.message);
      throw new BadGatewayException('Failed to fetch books from OpenLibrary');
    }
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
    const externalIds = [...new Set(books.map((book) => book.externalId))];
    if (externalIds.length === 0) return;

    const existingBooks = await this.booksRepository.findBy({
      externalId: In(externalIds),
    });
    const existingExternalIds = new Set(
      existingBooks.map((book) => book.externalId),
    );

    const missingBooks = books.filter(
      (book) => !existingExternalIds.has(book.externalId),
    );
    if (missingBooks.length === 0) return;

    const entities = missingBooks.map((book) =>
      this.booksRepository.create({
        externalId: book.externalId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        description: null,
      }),
    );

    await this.booksRepository.save(entities);
  }
}
