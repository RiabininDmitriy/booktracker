import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../utils/create-test-app';

function uniqueEmail(prefix = 'favorite'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

type RegisterBody = { accessToken: string };
type InsertedBookRow = { id: string };
type CountRow = { count: number };

describe('Favorites (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('toggles favorite on and off', async () => {
    const agent = request.agent(app.getHttpServer());
    const password = 'password123';
    const register = await agent
      .post('/auth/register')
      .send({ email: uniqueEmail(), password, name: 'Favorite User' })
      .expect(201);
    const token = (register.body as RegisterBody).accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [`e2e-favorite-${Date.now()}`, 'Favorite Book', 'Fav Author', null, null],
    )) as unknown as InsertedBookRow[];
    const bookId = insertedBooks[0].id;

    const onRes = await agent
      .put(`/favorites/${bookId}/toggle`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(onRes.body).toMatchObject({ bookId, isFavorite: true });

    const offRes = await agent
      .put(`/favorites/${bookId}/toggle`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(offRes.body).toMatchObject({ bookId, isFavorite: false });

    const countRows = (await dataSource.query(
      `SELECT COUNT(*)::int AS count FROM favorites WHERE book_id = $1`,
      [bookId],
    )) as unknown as CountRow[];
    expect(countRows[0].count).toBe(0);
  });

  it('returns 401 without token', async () => {
    await request(app.getHttpServer())
      .put('/favorites/11111111-1111-1111-1111-111111111111/toggle')
      .expect(401);
  });

  it('returns 404 when book does not exist', async () => {
    const agent = request.agent(app.getHttpServer());
    const register = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('favorite-missing-book'),
        password: 'password123',
        name: 'Favorite Missing Book',
      })
      .expect(201);
    const token = (register.body as RegisterBody).accessToken;

    await agent
      .put('/favorites/11111111-1111-1111-1111-111111111111/toggle')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
