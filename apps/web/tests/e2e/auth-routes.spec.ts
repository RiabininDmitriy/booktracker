import { expect, test } from '@playwright/test';

const authUser = {
  id: 'user-1',
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const authResponse = {
  user: authUser,
};

test.describe('auth and route protection', () => {
  test('redirects guest from /dashboard to /sign-in', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
  });

  test('signs in and redirects to dashboard', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'set-cookie': 'access_token=access-token-123; Path=/; SameSite=Lax',
        },
        body: JSON.stringify(authResponse),
      });
    });

    await page.goto('/sign-in');
    await page.getByLabel('Email address').fill('admin@gmail.com');
    await page.getByLabel('Password').fill('12345678');
    await page.getByTestId('sign-in-submit').click();
    await page.context().addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your dashboard')).toBeVisible();
  });

  test('signs up and redirects to dashboard', async ({ page }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: {
          'set-cookie': 'access_token=access-token-123; Path=/; SameSite=Lax',
        },
        body: JSON.stringify(authResponse),
      });
    });

    await page.goto('/sign-up');
    await page.getByLabel('Full name').fill('QA User');
    await page.getByLabel('Email address').fill(`qa-${Date.now()}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill('12345678');
    await page.getByLabel('Confirm password', { exact: true }).fill('12345678');
    await page.getByTestId('sign-up-submit').click();
    await page.context().addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your dashboard')).toBeVisible();
  });

  test('keeps auth pages accessible for authenticated user', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);

    await page.goto('/sign-in');
    await expect(page).toHaveURL('/sign-in');

    await page.goto('/sign-up');
    await expect(page).toHaveURL('/sign-up');
  });

  test('signs out from my account and blocks dashboard access again', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);

    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'set-cookie': 'access_token=; Path=/; Max-Age=0; SameSite=Lax',
        },
        body: '',
      });
    });

    await page.goto('/my-account');
    await page.getByTestId('sign-out-button').click();

    await expect(page).toHaveURL('/sign-in');

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
  });
});
