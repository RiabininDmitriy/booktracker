import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './utils/create-test-app';

type ValidationErrorResponse = {
  statusCode: number;
  message: string;
  details?: unknown;
};

describe('Books (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
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
});
