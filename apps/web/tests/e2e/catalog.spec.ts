import { expect, test } from '@playwright/test';

type CatalogItem = {
  id: string;
  externalId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
};

const makeItem = (id: string, title: string, author: string, rating = 4.5): CatalogItem => ({
  id,
  externalId: `ext-${id}`,
  title,
  author,
  coverUrl: null,
  avgRating: rating,
  reviewCount: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const pageOneItems: CatalogItem[] = [
  makeItem('1', 'Atomic Habits', 'James Clear', 4.8),
  makeItem('2', 'Clean Code', 'Robert Martin', 4.6),
];

const pageTwoItems: CatalogItem[] = [
  makeItem('3', 'The Pragmatic Programmer', 'Andy Hunt', 4.7),
  makeItem('4', 'Refactoring', 'Martin Fowler', 4.5),
];

test.describe('catalog page', () => {
  test('redirects guest to sign-in from catalog', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fcatalog/);
  });

  test('renders catalog items for authenticated user', async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    await page.route('**/books**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: pageOneItems,
          page: 1,
          limit: 12,
          total: 4,
          totalPages: 2,
        }),
      });
    });

    await page.goto('/catalog');
    await expect(page.getByText('Atomic Habits')).toBeVisible();
    await expect(page.getByText('Clean Code')).toBeVisible();
    await expect(page.getByText('Showing 1-4 of 4')).toBeVisible();
  });

  test('applies filters and updates query params', async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    let booksRequestUrl = '';
    await page.route('**/books**', async (route) => {
      booksRequestUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: pageOneItems,
          page: 1,
          limit: 12,
          total: 2,
          totalPages: 1,
        }),
      });
    });

    await page.goto('/catalog');
    await page.getByTestId('catalog-query-input').fill('Atomic');
    await page.getByTestId('catalog-author-input').fill('James');
    await page.getByTestId('catalog-apply-button').click();

    await expect(page).toHaveURL(/query=Atomic/);
    await expect(page).toHaveURL(/author=James/);
    expect(booksRequestUrl).toContain('query=Atomic');
    expect(booksRequestUrl).toContain('author=James');
  });

  test('supports next/previous pagination controls', async ({ context, page }) => {
    await context.addCookies([
      { name: 'access_token', value: 'token', url: 'http://localhost:3000' },
    ]);

    await page.route('**/books**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const requestPage = requestUrl.searchParams.get('page') ?? '1';
      const response =
        requestPage === '2'
          ? { items: pageTwoItems, page: 2, limit: 12, total: 24, totalPages: 2 }
          : { items: pageOneItems, page: 1, limit: 12, total: 24, totalPages: 2 };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.goto('/catalog');
    await expect(page.getByText('Page 1 / 2')).toBeVisible();

    await page.getByTestId('catalog-next-button').click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText('The Pragmatic Programmer')).toBeVisible();
    await expect(page.getByText('Page 2 / 2')).toBeVisible();

    await page.getByTestId('catalog-prev-button').click();
    await expect(page).toHaveURL(/page=1/);
    await expect(page.getByText('Atomic Habits')).toBeVisible();
  });
});
