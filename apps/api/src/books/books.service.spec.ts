import { BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { BooksService } from './books.service';

describe('BooksService', () => {
  let service: BooksService;
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: HttpService,
          useValue: httpService,
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
  });

  it('throws BadGatewayException when OpenLibrary fails', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('network error')),
    );

    await expect(service.search('harry potter')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
