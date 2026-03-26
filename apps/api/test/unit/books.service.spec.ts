import { BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { Book } from '../../src/entities/book.entity';
import { BooksRepository } from '../../src/books/books.repository';
import { BooksService } from '../../src/books/books.service';

describe('BooksService', () => {
  let service: BooksService;
  let httpService: { get: jest.Mock };
  let booksCatalogRepository: { findCatalogBooks: jest.Mock };
  let booksRepository: {
    upsert: jest.Mock;
  };

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };
    booksCatalogRepository = {
      findCatalogBooks: jest.fn(),
    };
    booksRepository = {
      upsert: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: BooksRepository,
          useValue: booksCatalogRepository,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: booksRepository,
        },
      ],
    }).compile();

    service = testingModule.get<BooksService>(BooksService);
  });

  it('maps OpenLibrary docs to API DTO shape', async () => {
    const axiosResponse: AxiosResponse = {
      data: {
        docs: [
          {
            key: '/works/OL82563W',
            title: "Harry Potter and the Philosopher's Stone",
            author_name: ['J. K. Rowling'],
            cover_i: 15155833,
            first_publish_year: 1997,
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: undefined as never },
    };

    httpService.get.mockReturnValue(of(axiosResponse));
    booksRepository.upsert.mockResolvedValue(undefined);

    const result = await service.search('harry potter');

    expect(result).toEqual([
      {
        externalId: 'OL82563W',
        title: "Harry Potter and the Philosopher's Stone",
        author: 'J. K. Rowling',
        coverUrl: 'https://covers.openlibrary.org/b/id/15155833-L.jpg',
        firstPublishYear: 1997,
      },
    ]);
    expect(booksRepository.upsert).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when docs are missing', async () => {
    const axiosResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: undefined as never },
    };

    httpService.get.mockReturnValue(of(axiosResponse));

    const result = await service.search('harry potter');

    expect(result).toEqual([]);
    expect(booksRepository.upsert).not.toHaveBeenCalled();
  });

  it('throws BadGatewayException when OpenLibrary fails', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('network error')),
    );

    await expect(service.search('harry potter')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('upserts books by externalId for idempotent local persistence', async () => {
    const axiosResponse: AxiosResponse = {
      data: {
        docs: [
          {
            key: '/works/OL82563W',
            title: "Harry Potter and the Philosopher's Stone",
            author_name: ['J. K. Rowling'],
            cover_i: 15155833,
            first_publish_year: 1997,
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: undefined as never },
    };

    httpService.get.mockReturnValue(of(axiosResponse));
    booksRepository.upsert.mockResolvedValue(undefined);

    await service.search('harry potter');

    expect(booksRepository.upsert).toHaveBeenCalledWith(
      [
        {
          externalId: 'OL82563W',
          title: "Harry Potter and the Philosopher's Stone",
          author: 'J. K. Rowling',
          coverUrl: 'https://covers.openlibrary.org/b/id/15155833-L.jpg',
          description: null,
        },
      ],
      {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  });
});
