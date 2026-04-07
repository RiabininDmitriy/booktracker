import { expect, test } from '@playwright/test';

const authUser = {
  id: 'user-1',
  email: 'admin@gmail.com',
  name: 'Admin',
  pendingEmail: null,
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

test.describe('my account and top navigation', () => {
  let isAuthenticated = false;

  test.beforeEach(async ({ page }) => {
    isAuthenticated = false;

    await page.route('**/auth/me', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      if (!isAuthenticated) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(authUser),
      });
    });
  });

  test('redirects guest from /my-account to /sign-in', async ({ page }) => {
    await page.goto('/my-account');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fmy-account/);
  });

  test('renders TopNav on /my-account and marks My account active', async ({ context, page }) => {
    isAuthenticated = true;
    await context.addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);

    await page.goto('/my-account');

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Catalog' })).toBeVisible();

    const myAccountLink = page.getByRole('link', { name: 'My account' });
    await expect(myAccountLink).toBeVisible();
    await expect(myAccountLink).toHaveClass(/bg-primary/);

    await expect(page.getByTestId('sign-out-button')).toBeVisible();
  });

  test('shows dev token after saving email change', async ({ context, page }) => {
    isAuthenticated = true;
    await context.addCookies([
      {
        name: 'access_token',
        value: 'existing-token',
        url: 'http://localhost:3000',
      },
    ]);

    await page.route('**/users/me', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            ...authUser,
            pendingEmail: 'new-email@example.com',
            emailVerifiedAt: null,
          },
          emailVerificationRequired: true,
          emailVerificationToken: 'dev-token-123',
        }),
      });
    });

    await page.goto('/my-account');
    await page.getByPlaceholder('you@example.com').fill('new-email@example.com');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByText('Dev token:')).toBeVisible();
    await expect(page.getByText('dev-token-123')).toBeVisible();
  });

  test('does not render TopNav on /sign-in', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Catalog' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'My account' })).toHaveCount(0);
  });
});
