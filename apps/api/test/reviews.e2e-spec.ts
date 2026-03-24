import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from './utils/create-test-app';

function uniqueEmail(prefix = 'reviews'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

type RegisterBody = { accessToken: string };
type InsertedBookRow = { id: string };
type InsertedReviewRow = { id: string };
type CountRow = { count: number };

describe('Reviews (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('own create/update/delete; admin can delete any; duplicate review -> 409', async () => {
    const userAgent = request.agent(app.getHttpServer());
    const adminAgent = request.agent(app.getHttpServer());
    const outsiderAgent = request.agent(app.getHttpServer());

    const userEmail = uniqueEmail('review-user');
    const adminEmail = uniqueEmail('review-admin');
    const outsiderEmail = uniqueEmail('review-outsider');
    const password = 'password123';

    const userRegister = await userAgent
      .post('/auth/register')
      .send({ email: userEmail, password, name: 'Review User' })
      .expect(201);
    const userToken = (userRegister.body as RegisterBody).accessToken;

    await adminAgent
      .post('/auth/register')
      .send({ email: adminEmail, password, name: 'Admin User' })
      .expect(201);
    await dataSource.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [
      adminEmail,
    ]);
    const adminLogin = await adminAgent
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(201);
    const adminToken = (adminLogin.body as RegisterBody).accessToken;

    const outsiderRegister = await outsiderAgent
      .post('/auth/register')
      .send({ email: outsiderEmail, password, name: 'Outsider User' })
      .expect(201);
    const outsiderToken = (outsiderRegister.body as RegisterBody).accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        `e2e-review-${Date.now()}`,
        'Reviewable Book',
        'Book Author',
        null,
        null,
      ],
    )) as unknown as InsertedBookRow[];
    const bookId = insertedBooks[0].id;

    const created = await userAgent
      .post(`/reviews/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'my first review' })
      .expect(201);
    const reviewId = (created.body as InsertedReviewRow).id;

    await userAgent
      .post(`/reviews/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'duplicate review' })
      .expect(409);

    await userAgent
      .patch(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'updated by owner' })
      .expect(200);

    await outsiderAgent
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .expect(403);

    await adminAgent
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const countRows = (await dataSource.query(
      `SELECT COUNT(*)::int AS count FROM reviews WHERE id = $1`,
      [reviewId],
    )) as unknown as CountRow[];
    expect(countRows[0].count).toBe(0);
  });

  it('returns 401 for protected review routes without token', async () => {
    await request(app.getHttpServer())
      .post('/reviews/11111111-1111-1111-1111-111111111111')
      .send({ text: 'no token' })
      .expect(401);

    await request(app.getHttpServer())
      .patch('/reviews/11111111-1111-1111-1111-111111111111')
      .send({ text: 'no token' })
      .expect(401);

    await request(app.getHttpServer())
      .delete('/reviews/11111111-1111-1111-1111-111111111111')
      .expect(401);
  });

  it('returns 404 for missing book or review', async () => {
    const agent = request.agent(app.getHttpServer());
    const register = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('reviews-404'),
        password: 'password123',
        name: 'Reviews 404',
      })
      .expect(201);
    const token = (register.body as RegisterBody).accessToken;

    await agent
      .post('/reviews/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'missing book' })
      .expect(404);

    await agent
      .patch('/reviews/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'missing review' })
      .expect(404);

    await agent
      .delete('/reviews/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
