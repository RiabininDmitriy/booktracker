import { cookies } from 'next/headers';
import { Suspense } from 'react';

import { CatalogPageClient } from '@/components/catalog/catalog-page-client';
import { parseCatalogQuery, type CatalogSearchParams } from '@/lib/catalog/catalog-query';
import type { CatalogQuery, CatalogResponse } from '@/lib/store/api/books-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const CATALOG_REVALIDATE_SECONDS = 60;

function shouldSkipCatalogSsrForE2E(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_E2E === '1';
}

async function fetchCatalogSsr(query: CatalogQuery): Promise<CatalogResponse | null> {
  if (shouldSkipCatalogSsrForE2E()) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
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
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
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
  searchParams: Promise<CatalogSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseCatalogQuery(resolvedSearchParams);

  const initialData = await fetchCatalogSsr(initialQuery);
  const clientKey = `${initialQuery.page}-${initialQuery.limit}-${initialQuery.sort}-${initialQuery.order}-${initialQuery.query ?? ''}-${initialQuery.author ?? ''}`;

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
