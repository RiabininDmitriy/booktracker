import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from '../utils/create-test-app';

type OpenApiBody = {
  openapi: string;
  info: {
    title: string;
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/docs (GET) serves swagger ui', () => {
    return request(app.getHttpServer()).get('/docs').expect(200);
  });

  it('/docs-json (GET) serves openapi json', async () => {
    const res = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const body = res.body as OpenApiBody;
    expect(typeof body.openapi).toBe('string');
    expect(body.info.title).toBe('Booktracker API');
  });
});
