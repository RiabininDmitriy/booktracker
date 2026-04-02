import { expect, test } from '@playwright/test';

test.describe('Real E2E Smoke Path', () => {
  // Use a unique email for every test run to ensure registration works
  const uniqueEmail = `smoke_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
  const password = 'SmokePassword123!';

  test('Full flow: Register -> Dashboard -> Logout -> Blocked', async ({ page }) => {
    // 1. Visit the home or dashboard page initially, should be redirected to sign-in
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);

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

    // 5. Expect to be redirected to dashboard upon successful registration and login sequence
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

    // 9. Try accessing dashboard again, should remain blocked
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
