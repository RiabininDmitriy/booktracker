import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../utils/create-test-app';

function uniqueEmail(prefix = 'rating'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

type RegisterBody = { accessToken: string };
type InsertedBookRow = { id: string };
type AvgRow = { avg_rating: number | null };

describe('Ratings (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('upserts rating and recalculates book avg_rating', async () => {
    const userAgent1 = request.agent(app.getHttpServer());
    const userAgent2 = request.agent(app.getHttpServer());
    const password = 'password123';

    const register1 = await userAgent1
      .post('/auth/register')
      .send({ email: uniqueEmail('rating-user-1'), password, name: 'User 1' })
      .expect(201);
    const token1 = (register1.body as RegisterBody).accessToken;

    const register2 = await userAgent2
      .post('/auth/register')
      .send({ email: uniqueEmail('rating-user-2'), password, name: 'User 2' })
      .expect(201);
    const token2 = (register2.body as RegisterBody).accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [`e2e-rating-${Date.now()}`, 'Rated Book', 'Rating Author', null, null],
    )) as unknown as InsertedBookRow[];
    const bookId = insertedBooks[0].id;

    await userAgent1
      .put(`/ratings/${bookId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ value: 5 })
      .expect(200);

    await userAgent2
      .put(`/ratings/${bookId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ value: 3 })
      .expect(200);

    await userAgent1
      .put(`/ratings/${bookId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ value: 4 })
      .expect(200);

    const avgRows = (await dataSource.query(
      `SELECT avg_rating FROM books WHERE id = $1`,
      [bookId],
    )) as unknown as AvgRow[];

    expect(Number(avgRows[0].avg_rating)).toBe(3.5);
  });

  it('returns 401 without token', async () => {
    await request(app.getHttpServer())
      .put('/ratings/11111111-1111-1111-1111-111111111111')
      .send({ value: 5 })
      .expect(401);
  });

  it('returns 400 for rating value outside 1..5', async () => {
    const agent = request.agent(app.getHttpServer());
    const register = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rating-invalid'),
        password: 'password123',
        name: 'Rating Invalid',
      })
      .expect(201);
    const token = (register.body as RegisterBody).accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        `e2e-rating-invalid-${Date.now()}`,
        'Rated Book Invalid',
        'Author',
        null,
        null,
      ],
    )) as unknown as InsertedBookRow[];
    const bookId = insertedBooks[0].id;

    await agent
      .put(`/ratings/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 10 })
      .expect(400);
  });

  it('returns 404 when book does not exist', async () => {
    const agent = request.agent(app.getHttpServer());
    const register = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rating-missing-book'),
        password: 'password123',
        name: 'Rating Missing Book',
      })
      .expect(201);
    const token = (register.body as RegisterBody).accessToken;

    await agent
      .put('/ratings/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 4 })
      .expect(404);
  });
});
