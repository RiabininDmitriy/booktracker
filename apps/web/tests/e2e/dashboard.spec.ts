import { expect, test } from '@playwright/test';

const dashboardItems = [
  {
    userId: 'user-1',
    bookId: 'book-planned',
    status: 'planned',
    updatedAt: '2026-01-01T00:00:00.000Z',
    book: {
      id: 'book-planned',
      title: 'Planned Book',
      author: 'Author Planned',
      coverUrl: null,
      avgRating: null,
      reviewCount: 0,
    },
  },
  {
    userId: 'user-1',
    bookId: 'book-reading',
    status: 'reading',
    updatedAt: '2026-01-02T00:00:00.000Z',
    book: {
      id: 'book-reading',
      title: 'Reading Book',
      author: 'Author Reading',
      coverUrl: null,
      avgRating: 4.1,
      reviewCount: 3,
    },
  },
  {
    userId: 'user-1',
    bookId: 'book-completed',
    status: 'completed',
    updatedAt: '2026-01-03T00:00:00.000Z',
    book: {
      id: 'book-completed',
      title: 'Completed Book',
      author: 'Author Completed',
      coverUrl: null,
      avgRating: 4.9,
      reviewCount: 20,
    },
  },
] as const;

test.describe('dashboard page', () => {
  test('renders reading lists by status', async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    await page.route('**://localhost:3001/reading-statuses/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dashboardItems),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Your dashboard')).toBeVisible();
    await expect(page.getByText('Planned', { exact: true })).toBeVisible();
    await expect(page.getByText('Reading', { exact: true })).toBeVisible();
    await expect(page.getByText('Completed', { exact: true })).toBeVisible();

    await expect(page.getByText('Planned Book')).toBeVisible();
    await expect(page.getByText('Reading Book')).toBeVisible();
    await expect(page.getByText('Completed Book')).toBeVisible();
  });

  test('opens book details from a dashboard item', async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    await page.route('**://localhost:3001/reading-statuses/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dashboardItems),
      });
    });

    await page.route('**://localhost:3001/books/book-planned', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'book-planned',
          externalId: 'ext-book-planned',
          title: 'Planned Book',
          author: 'Author Planned',
          coverUrl: null,
          description: 'Dashboard book description',
          avgRating: null,
          reviewCount: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**://localhost:3001/reviews/book/book-planned', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Planned Book/i }).click();

    await expect(page).toHaveURL('/books/book-planned');
    await expect(page.getByText('Book details')).toBeVisible();
  });
});
