import { expect, test } from '@playwright/test';

const bookId = 'book-1';

const bookResponse = {
  id: bookId,
  externalId: 'ext-book-1',
  title: 'The Pragmatic Programmer',
  author: 'Andrew Hunt',
  coverUrl: null,
  description: 'A practical guide for software craftsmanship.',
  avgRating: 4.2,
  reviewCount: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const reviewsResponse = [
  {
    id: 'review-1',
    userId: 'user-1',
    bookId,
    text: 'Great read.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

test.describe('book details page', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    await page.route('**/auth/me', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'admin@gmail.com',
          name: 'Admin',
          pendingEmail: null,
          emailVerifiedAt: '2026-01-01T00:00:00.000Z',
          role: 'admin',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      });
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

    await page.route('**/books/**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookResponse),
      });
    });

    await page.route('**/reviews/book/**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reviewsResponse),
      });
    });
  });

  test('renders core book info', async ({ page }) => {
    await page.goto(`/books/${bookId}`);

    await expect(page.getByText('Book details')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Pragmatic Programmer' })).toBeVisible();
    await expect(page.getByText('Andrew Hunt')).toBeVisible();
    await expect(page.getByText('A practical guide for software craftsmanship.')).toBeVisible();
  });

  test('updates rating, reading status and favorite', async ({ page }) => {
    let ratingRequested = false;
    let statusRequested = false;
    let favoriteRequested = false;

    await page.route('**/ratings/**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      ratingRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-1',
          bookId,
          value: 5,
          avgRating: 5,
        }),
      });
    });

    await page.route('**/reading-statuses/**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      statusRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-1',
          bookId,
          status: 'completed',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/favorites/**/toggle', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      favoriteRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-1',
          bookId,
          isFavorite: true,
        }),
      });
    });

    await page.goto(`/books/${bookId}`);
    await expect(page.getByRole('heading', { name: 'The Pragmatic Programmer' })).toBeVisible();

    await page.getByRole('button', { name: /5/ }).first().click();
    await page.getByRole('combobox').selectOption('completed');
    await page.getByRole('button', { name: 'Add to favorites' }).click();

    await expect.poll(() => ratingRequested).toBe(true);
    await expect.poll(() => statusRequested).toBe(true);
    await expect.poll(() => favoriteRequested).toBe(true);
  });

  test('submits a review', async ({ page }) => {
    let reviewRequested = false;

    await page.route('**/reviews/book/**', async (route) => {
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

    await page.route('**/reviews/**', async (route) => {
      if (route.request().resourceType() === 'document') {
        await route.fallback();
        return;
      }
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      reviewRequested = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'review-2',
          userId: 'user-1',
          bookId,
          text: 'Excellent advice',
          createdAt: '2026-01-02T00:00:00.000Z',
        }),
      });
    });

    await page.goto(`/books/${bookId}`);

    await page.getByPlaceholder('Write your review...').fill('Excellent advice');
    await page.getByRole('button', { name: 'Add review' }).click();

    await expect.poll(() => reviewRequested).toBe(true);
  });
});
