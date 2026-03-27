import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../utils/create-test-app';

function uniqueEmail(prefix = 'rs'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

type InsertedBookRow = { id: string };
type CountRow = { count: number };
type ReadingStatusBody = { bookId: string; status: string };
type ReadingStatusListItemBody = {
  userId: string;
  bookId: string;
  status: 'planned' | 'reading' | 'completed';
  updatedAt: string;
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
  };
};

function findStatusItemByBookId(
  items: ReadingStatusListItemBody[],
  bookId: string,
): ReadingStatusListItemBody {
  const item = items.find((entry) => entry.bookId === bookId);
  if (!item) {
    throw new Error(`Status item for book ${bookId} not found`);
  }
  return item;
}

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
    expect(createdBody).toMatchObject({ bookId: book.id, status: 'planned' });

    const updated = await agent
      .put(`/reading-statuses/${book.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed' })
      .expect(200);
    const updatedBody = updated.body as ReadingStatusBody;
    expect(updatedBody).toMatchObject({ bookId: book.id, status: 'completed' });

    const countRows = (await dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM reading_statuses rs
       JOIN users u ON u.id = rs.user_id
       WHERE u.email = $1 AND rs.book_id = $2`,
      [email, book.id],
    )) as unknown as CountRow[];

    expect(countRows[0].count).toBe(1);
  });

  it('returns 401 without token', async () => {
    await request(app.getHttpServer())
      .put('/reading-statuses/11111111-1111-1111-1111-111111111111')
      .send({ status: 'planned' })
      .expect(401);
  });

  it('returns 404 when book does not exist', async () => {
    const agent = request.agent(app.getHttpServer());
    const registerRes = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rs-missing-book'),
        password: 'password123',
        name: 'RS Missing Book',
      })
      .expect(201);
    const accessToken = (registerRes.body as { accessToken: string })
      .accessToken;

    await agent
      .put('/reading-statuses/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'planned' })
      .expect(404);
  });

  it('returns 400 for invalid status value', async () => {
    const agent = request.agent(app.getHttpServer());
    const registerRes = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rs-invalid-status'),
        password: 'password123',
        name: 'RS Invalid Status',
      })
      .expect(201);
    const accessToken = (registerRes.body as { accessToken: string })
      .accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        `e2e-reading-status-invalid-${Date.now()}`,
        'E2E Invalid Status Book',
        'E2E Author',
        null,
        null,
      ],
    )) as unknown as InsertedBookRow[];
    const book = insertedBooks[0];

    await agent
      .put(`/reading-statuses/${book.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'invalid-status' })
      .expect(400);
  });

  it('lists current user reading statuses with book info', async () => {
    const agent = request.agent(app.getHttpServer());
    const registerRes = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rs-list'),
        password: 'password123',
        name: 'RS List User',
      })
      .expect(201);
    const accessToken = (registerRes.body as { accessToken: string })
      .accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description, avg_rating, review_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7),
              ($8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        `e2e-rs-list-1-${Date.now()}`,
        'Dashboard Planned',
        'Author One',
        null,
        null,
        4.5,
        12,
        `e2e-rs-list-2-${Date.now()}`,
        'Dashboard Reading',
        'Author Two',
        null,
        null,
        3.8,
        5,
      ],
    )) as unknown as InsertedBookRow[];

    const plannedBookId = insertedBooks[0].id;
    const readingBookId = insertedBooks[1].id;

    await agent
      .put(`/reading-statuses/${plannedBookId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'planned' })
      .expect(200);

    await agent
      .put(`/reading-statuses/${readingBookId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'reading' })
      .expect(200);

    const response = await agent
      .get('/reading-statuses/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as ReadingStatusListItemBody[];

    expect(body).toHaveLength(2);

    const plannedItem = findStatusItemByBookId(body, plannedBookId);
    expect(plannedItem.status).toBe('planned');
    expect(plannedItem.book.id).toBe(plannedBookId);
    expect(plannedItem.book.title).toBe('Dashboard Planned');
    expect(plannedItem.book.author).toBe('Author One');
    expect(plannedItem.book.avgRating).toBe(4.5);
    expect(plannedItem.book.reviewCount).toBe(12);

    const readingItem = findStatusItemByBookId(body, readingBookId);
    expect(readingItem.status).toBe('reading');
    expect(readingItem.book.id).toBe(readingBookId);
    expect(readingItem.book.title).toBe('Dashboard Reading');
    expect(readingItem.book.author).toBe('Author Two');
    expect(readingItem.book.avgRating).toBe(3.8);
    expect(readingItem.book.reviewCount).toBe(5);
  });

  it('supports filtering my reading statuses by status', async () => {
    const agent = request.agent(app.getHttpServer());
    const registerRes = await agent
      .post('/auth/register')
      .send({
        email: uniqueEmail('rs-filter'),
        password: 'password123',
        name: 'RS Filter User',
      })
      .expect(201);
    const accessToken = (registerRes.body as { accessToken: string })
      .accessToken;

    const insertedBooks = (await dataSource.query(
      `INSERT INTO books (external_id, title, author, cover_url, description)
       VALUES ($1, $2, $3, $4, $5),
              ($6, $7, $8, $9, $10)
       RETURNING id`,
      [
        `e2e-rs-filter-1-${Date.now()}`,
        'Filter Planned',
        'Author',
        null,
        null,
        `e2e-rs-filter-2-${Date.now()}`,
        'Filter Completed',
        'Author',
        null,
        null,
      ],
    )) as unknown as InsertedBookRow[];

    await agent
      .put(`/reading-statuses/${insertedBooks[0].id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'planned' })
      .expect(200);
    await agent
      .put(`/reading-statuses/${insertedBooks[1].id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed' })
      .expect(200);

    const response = await agent
      .get('/reading-statuses/me')
      .query({ status: 'completed' })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const body = response.body as ReadingStatusListItemBody[];

    expect(body).toHaveLength(1);
    expect(body[0].status).toBe('completed');
    expect(body[0].bookId).toBe(insertedBooks[1].id);
    expect(body[0].book.title).toBe('Filter Completed');
  });

  it('returns 401 for list endpoint without token', async () => {
    await request(app.getHttpServer()).get('/reading-statuses/me').expect(401);
  });
});
