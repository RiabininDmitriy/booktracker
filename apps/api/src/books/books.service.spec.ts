import { BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { Book } from '../entities/book.entity';
import { BooksService } from './books.service';

describe('BooksService', () => {
  let service: BooksService;
  let httpService: { get: jest.Mock };
  let booksRepository: {
    findBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };
    booksRepository = {
      findBy: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: HttpService,
          useValue: httpService,
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
    booksRepository.findBy.mockResolvedValue([]);
    booksRepository.save.mockResolvedValue([]);

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
    expect(booksRepository.save).toHaveBeenCalledTimes(1);
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
    booksRepository.findBy.mockResolvedValue([]);

    const result = await service.search('harry potter');

    expect(result).toEqual([]);
    expect(booksRepository.save).not.toHaveBeenCalled();
  });

  it('throws BadGatewayException when OpenLibrary fails', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('network error')),
    );

    await expect(service.search('harry potter')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('does not save books that are already cached', async () => {
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
    booksRepository.findBy.mockResolvedValue([{ externalId: 'OL82563W' }]);

    await service.search('harry potter');

    expect(booksRepository.save).not.toHaveBeenCalled();
  });
});
