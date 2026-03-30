import { expect, test } from '@playwright/test';

test.describe('my account and top navigation', () => {
  test('redirects guest from /my-account to /sign-in', async ({ page }) => {
    await page.goto('/my-account');

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fmy-account/);
  });

  test('renders TopNav on /my-account and marks My account active', async ({ context, page }) => {
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

  test('does not render TopNav on /sign-in', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Catalog' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'My account' })).toHaveCount(0);
  });
});
