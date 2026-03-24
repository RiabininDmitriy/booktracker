import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from './utils/create-test-app';

function uniqueEmail(prefix = 'rs'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

type InsertedBookRow = { id: string };
type CountRow = { count: number };
type ReadingStatusBody = { bookId: string; status: string };

describe('Reading statuses (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('upserts one reading status per user/book', async () => {
    const agent = request.agent(app.getHttpServer());

    const email = uniqueEmail();
    const password = 'password123';

    const registerRes = await agent
      .post('/auth/register')
      .send({ email, password, name: 'Reading Status User' })
      .expect(201);
    const accessToken = (registerRes.body as { accessToken: string })
      .accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        `e2e-reading-status-${Date.now()}`,
        'E2E Book',
        'E2E Author',
        null,
        null,
      ],
    )) as unknown as InsertedBookRow[];
    const book = insertedBooks[0];

    const created = await agent
      .put(`/reading-statuses/${book.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'planned' })
      .expect(200);
    const createdBody = created.body as ReadingStatusBody;

    expect(createdBody).toMatchObject({
      bookId: book.id,
      status: 'planned',
    });

    const updated = await agent
      .put(`/reading-statuses/${book.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed' })
      .expect(200);
    const updatedBody = updated.body as ReadingStatusBody;

    expect(updatedBody).toMatchObject({
      bookId: book.id,
      status: 'completed',
    });

    const countRows = (await dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM reading_statuses rs
       JOIN users u ON u.id = rs.user_id
       WHERE u.email = $1 AND rs.book_id = $2`,
      [email, book.id],
    )) as unknown as CountRow[];
    const countRow = countRows[0];

    expect(countRow.count).toBe(1);
  });

  it('returns 401 without token', async () => {
    await request(app.getHttpServer())
      .put('/reading-statuses/11111111-1111-1111-1111-111111111111')
      .send({ status: 'planned' })
      .expect(401);
  });
});
