import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from './utils/create-test-app';

function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

interface AuthResponseBody {
  accessToken: string;
  user: {
    email: string;
  };
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('register → me (200) with access token', async () => {
    const agent = request.agent(app.getHttpServer());

    const email = uniqueEmail('register');
    const password = 'password123';

    const registerRes = await agent
      .post('/auth/register')
      .send({ email, password, name: 'Test' })
      .expect(201);

    const registerBody = registerRes.body as AuthResponseBody;
    expect(registerBody).toMatchObject({
      user: { email },
    });
    expect(typeof registerBody.accessToken).toBe('string');
    expect(registerBody).not.toHaveProperty('refreshToken');
    expect(registerRes.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('refresh_token='),
        expect.stringContaining('HttpOnly'),
      ]),
    );

    const meRes = await agent
      .get('/auth/me')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .expect(200);

    expect(meRes.body).toMatchObject({ email });
    expect(meRes.body).not.toHaveProperty('passwordHash');
    expect(meRes.body).not.toHaveProperty('refreshTokenHash');
  });

  it('login wrong password → 401', async () => {
    const agent = request.agent(app.getHttpServer());

    const email = uniqueEmail('wrongpass');
    const password = 'password123';

    await agent
      .post('/auth/register')
      .send({ email, password, name: 'Test' })
      .expect(201);

    await agent
      .post('/auth/login')
      .send({ email, password: 'not_the_password' })
      .expect(401);
  });

  it('login invalid body → stable 400 validation shape', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await agent
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);

    const body = res.body as {
      statusCode: number;
      message: string;
      details?: unknown;
    };
    expect(body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
    });
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('refresh works with cookie; logout invalidates refresh; refresh after logout → 401', async () => {
    const agent = request.agent(app.getHttpServer());

    const email = uniqueEmail('refresh');
    const password = 'password123';

    const registerRes = await agent
      .post('/auth/register')
      .send({ email, password, name: 'Test' })
      .expect(201);

    const registerBody = registerRes.body as AuthResponseBody;
    expect(registerBody).not.toHaveProperty('refreshToken');
    expect(registerRes.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refresh_token=')]),
    );

    await agent.post('/auth/refresh').expect(201);

    await agent.post('/auth/logout').expect(201);

    await agent.post('/auth/refresh').expect(401);
  });

  it('me without token → 401', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/auth/me').expect(401);
  });

  it('RBAC: /users is admin-only (403 for user, 200 for admin)', async () => {
    const agent = request.agent(app.getHttpServer());
    const dataSource = app.get(DataSource);

    const email = uniqueEmail('rbac');
    const password = 'password123';

    const registerRes = await agent
      .post('/auth/register')
      .send({ email, password, name: 'Test' })
      .expect(201);

    const registerBody = registerRes.body as AuthResponseBody;

    await agent
      .get('/users')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .expect(403);

    // Promote to admin directly in DB for the test
    await dataSource.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [
      email,
    ]);

    const adminLoginRes = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const adminBody = adminLoginRes.body as AuthResponseBody;

    await agent
      .get('/users')
      .set('Authorization', `Bearer ${adminBody.accessToken}`)
      .expect(200);
  });
});
