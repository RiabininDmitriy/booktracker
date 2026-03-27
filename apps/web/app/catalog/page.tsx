'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { EmptyStateCard, ErrorStateCard } from '@/components/ui/state-card';
import { CatalogBookCard } from '@/components/catalog/catalog-book-card';
import { CatalogFilters } from '@/components/catalog/catalog-filters';
import { CatalogHeader } from '@/components/catalog/catalog-header';
import { CatalogPagination } from '@/components/catalog/catalog-pagination';
import { useGetCatalogQuery, type CatalogOrder, type CatalogSort } from '@/lib/store/api/books-api';

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toSort(value: string | null): CatalogSort {
  return value === 'rating' || value === 'title' || value === 'createdAt' ? value : 'createdAt';
}

function toOrder(value: string | null): CatalogOrder {
  return value === 'asc' || value === 'desc' ? value : 'desc';
}

function CatalogPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const limit = toPositiveInt(searchParams.get('limit'), 12);
  const sort = toSort(searchParams.get('sort'));
  const order = toOrder(searchParams.get('order'));
  const query = searchParams.get('query') ?? '';
  const author = searchParams.get('author') ?? '';

  const [queryInput, setQueryInput] = useState(query);
  const [authorInput, setAuthorInput] = useState(author);

  const { data, isLoading, isFetching, isError } = useGetCatalogQuery({
    page,
    limit,
    sort,
    order,
    query: query || undefined,
    author: author || undefined,
  });

  const books = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  const summary = useMemo(() => {
    if (!data) return 'Loading catalog...';
    if (data.total === 0) return 'No books found';

    const start = (data.page - 1) * data.limit + 1;
    const end = Math.min(data.page * data.limit, data.total);
    return `Showing ${start}-${end} of ${data.total}`;
  }, [data]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      page: '1',
      query: queryInput.trim() || undefined,
      author: authorInput.trim() || undefined,
    });
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages)) return;
    updateParams({ page: String(nextPage) });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <CatalogHeader
          title="Catalog"
          subtitle="Browse books with search, filters and pagination."
        />

        <CatalogFilters
          queryInput={queryInput}
          authorInput={authorInput}
          sort={sort}
          order={order}
          isFetching={isFetching}
          onQueryChange={setQueryInput}
          onAuthorChange={setAuthorInput}
          onApplyFilters={handleApplyFilters}
          onSortChange={(value) => updateParams({ page: '1', sort: value })}
          onOrderChange={(value) => updateParams({ page: '1', order: value })}
        />

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{summary}</p>
          {isFetching && !isLoading ? <Badge variant="info">Refreshing</Badge> : null}
        </div>

        {isError ? <ErrorStateCard message="Failed to load catalog. Please try again." /> : null}

        {!isError ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <CatalogBookCard key={book.id} book={book} />
            ))}
          </div>
        ) : null}

        {!isError && !isLoading && books.length === 0 ? (
          <EmptyStateCard message="No books match current filters." />
        ) : null}

        <CatalogPagination
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12" />}>
      <CatalogPageContent />
    </Suspense>
  );
}
