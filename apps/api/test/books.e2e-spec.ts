import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from './utils/create-test-app';

type ValidationErrorResponse = {
  statusCode: number;
  message: string;
  details?: unknown;
};

type CatalogItem = {
  externalId: string;
  title: string;
  author: string | null;
};

type CatalogResponse = {
  items: CatalogItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

describe('Books (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('search with missing query → 400 stable validation shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/books/search')
      .expect(400);
    const body = res.body as ValidationErrorResponse;

    expect(body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
    });
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('search with too short query → 400 stable validation shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/books/search?q=a')
      .expect(400);
    const body = res.body as ValidationErrorResponse;

    expect(body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
    });
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('catalog list returns paginated books sorted by rating', async () => {
    await dataSource.query(
      `DELETE FROM books WHERE external_id IN ('e2e-books-1', 'e2e-books-2', 'e2e-books-3')`,
    );
    await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description, avg_rating, review_count)
       VALUES
       ('e2e-books-1', 'Book Alpha', 'Author A', NULL, NULL, 4.20, 3),
       ('e2e-books-2', 'Book Beta', 'Author B', NULL, NULL, 4.80, 7),
       ('e2e-books-3', 'Book Gamma', 'Author A', NULL, NULL, 3.90, 1)`,
    );

    const res = await request(app.getHttpServer())
      .get('/books?page=1&limit=2&sort=rating&order=desc')
      .expect(200);
    const body = res.body as CatalogResponse;

    expect(body.page).toBe(1);
    expect(body.limit).toBe(2);
    expect(typeof body.total).toBe('number');
    expect(typeof body.totalPages).toBe('number');
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeLessThanOrEqual(2);
    expect(body.items[0]).toMatchObject({
      externalId: 'e2e-books-2',
      title: 'Book Beta',
    });
  });

  it('catalog list supports filters by text and author', async () => {
    const res = await request(app.getHttpServer())
      .get('/books?page=1&limit=10&q=Book&author=Author%20A')
      .expect(200);
    const body = res.body as CatalogResponse;

    expect(Array.isArray(body.items)).toBe(true);
    for (const item of body.items) {
      expect(item.title).toContain('Book');
      expect(item.author ?? '').toContain('Author A');
    }
  });
});
