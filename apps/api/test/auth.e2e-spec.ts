import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './utils/create-test-app';

function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

interface AuthResponseBody {
  accessToken: string;
  refreshToken: string;
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
    expect(typeof registerBody.refreshToken).toBe('string');

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
    expect(typeof registerBody.refreshToken).toBe('string');

    await agent.post('/auth/refresh').expect(201);

    await agent.post('/auth/logout').expect(201);

    await agent.post('/auth/refresh').expect(401);
  });

  it('me without token → 401', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get('/auth/me').expect(401);
  });
});
