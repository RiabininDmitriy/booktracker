import { cookies } from 'next/headers';
import { Suspense } from 'react';

import { CatalogPageClient } from '@/components/catalog/catalog-page-client';
import type {
  CatalogOrder,
  CatalogQuery,
  CatalogResponse,
  CatalogSort,
} from '@/lib/store/api/books-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const CATALOG_REVALIDATE_SECONDS = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | null {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toSort(value: string | null): CatalogSort {
  return value === 'rating' || value === 'title' || value === 'createdAt' ? value : 'title';
}

function toOrder(value: string | null): CatalogOrder {
  return value === 'asc' || value === 'desc' ? value : 'desc';
}

function shouldSkipCatalogSsrForE2E(): boolean {
  // Jest/Vitest: NODE_ENV=test. Playwright runs `next dev` (development) with PLAYWRIGHT_E2E=1 from playwright.config.
  // Browser `page.route()` does not intercept RSC/server fetch, so we skip SSR and let RTK + stubs load data.
  return process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_E2E === '1';
}

async function fetchCatalogSsr(query: CatalogQuery): Promise<CatalogResponse | null> {
  if (shouldSkipCatalogSsrForE2E()) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
    sort: query.sort ?? 'title',
    order: query.order ?? 'desc',
  });

  if (query.query) params.set('query', query.query);
  if (query.author) params.set('author', query.author);

  try {
    const response = await fetch(`${API_BASE_URL}/books?${params.toString()}`, {
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] },
    });
    if (!response.ok) return null;
    return (await response.json()) as CatalogResponse;
  } catch {
    return null;
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = toPositiveInt(getParam(resolvedSearchParams, 'page'), 1);
  const limit = toPositiveInt(getParam(resolvedSearchParams, 'limit'), 12);
  const sort = toSort(getParam(resolvedSearchParams, 'sort'));
  const order = toOrder(getParam(resolvedSearchParams, 'order'));
  const query = (getParam(resolvedSearchParams, 'query') ?? '').trim();
  const author = (getParam(resolvedSearchParams, 'author') ?? '').trim();

  const initialQuery = {
    page,
    limit,
    sort,
    order,
    query: query || undefined,
    author: author || undefined,
  };

  const initialData = await fetchCatalogSsr(initialQuery);
  const clientKey = `${page}-${limit}-${sort}-${order}-${query}-${author}`;

  return (
    <Suspense fallback={<main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12" />}>
      <CatalogPageClient
        key={clientKey}
        initialData={initialData}
        initialQuery={initialQuery}
        initialError={!initialData}
      />
    </Suspense>
  );
}
