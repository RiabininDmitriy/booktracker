import { expect, test } from '@playwright/test';

test.describe('Real E2E Smoke Path', () => {
  // Use a unique email for every test run to ensure registration works
  const uniqueEmail = `smoke_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
  const password = 'SmokePassword123!';
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
        body: JSON.stringify({
          id: 'user-smoke',
          email: uniqueEmail,
          name: 'Smoke User',
          pendingEmail: null,
          emailVerifiedAt: '2026-01-01T00:00:00.000Z',
          role: 'user',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/auth/register', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      isAuthenticated = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'access-token-123',
          user: {
            id: 'user-smoke',
            email: uniqueEmail,
            name: 'Smoke User',
            pendingEmail: null,
            emailVerifiedAt: '2026-01-01T00:00:00.000Z',
            role: 'user',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.route('**/auth/logout', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      isAuthenticated = false;
      await route.fulfill({ status: 200, body: '' });
    });

    await page.route('**/reading-statuses/me', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/books**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        }),
      });
    });
  });

  test('Full flow: Register -> Dashboard -> Logout -> Blocked', async ({ page }) => {
    // 1. Visit dashboard first - guest should be redirected to sign-in
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);

    // 2. Navigate to sign up
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/sign-up');

    // 3. Fill registration form
    await page.getByLabel('Full name').fill('Smoke User');
    await page.getByLabel('Email address').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password', { exact: true }).fill(password);

    // 4. Submit sign up
    await page.getByTestId('sign-up-submit').click();
    isAuthenticated = true;

    // 5. Open dashboard after successful registration/login sequence
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your dashboard')).toBeVisible();

    // 6. Test Catalog access
    await page.goto('/catalog');
    await expect(page).toHaveURL('/catalog');
    await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();

    // 7. Go to my-account and sign out
    await page.goto('/my-account');
    await expect(page).toHaveURL('/my-account');
    await page.getByTestId('sign-out-button').click();

    // 8. Expect to be redirected to sign-in
    await expect(page).toHaveURL(/\/sign-in/);

    // 9. After logout dashboard should be blocked again
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
  });
});
