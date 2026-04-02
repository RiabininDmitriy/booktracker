'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { CatalogBookCard } from '@/components/catalog/catalog-book-card';
import { CatalogFilters } from '@/components/catalog/catalog-filters';
import { CatalogHeader } from '@/components/catalog/catalog-header';
import { CatalogPagination } from '@/components/catalog/catalog-pagination';
import { Badge } from '@/components/ui/badge';
import { EmptyStateCard, ErrorStateCard } from '@/components/ui/state-card';
import {
  isSameCatalogQuery,
  toOrder,
  toPositiveInt,
  toSort,
  type CatalogPageQuery,
} from '@/lib/catalog/catalog-query';
import { useGetCatalogQuery, type CatalogResponse } from '@/lib/store/api/books-api';

type CatalogPageClientProps = {
  initialData: CatalogResponse | null;
  initialQuery: CatalogPageQuery;
  initialError: boolean;
};

export function CatalogPageClient({
  initialData,
  initialQuery,
  initialError,
}: CatalogPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRoutePending, startRouteTransition] = useTransition();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const limit = toPositiveInt(searchParams.get('limit'), 12);
  const sort = toSort(searchParams.get('sort'));
  const order = toOrder(searchParams.get('order'));
  const query = searchParams.get('query') ?? '';
  const author = searchParams.get('author') ?? '';

  const currentQuery = useMemo(
    () => ({
      page,
      limit,
      sort,
      order,
      query: query || undefined,
      author: author || undefined,
    }),
    [author, limit, order, page, query, sort]
  );

  const hasMatchingSsrData = Boolean(initialData && isSameCatalogQuery(currentQuery, initialQuery));
  const {
    data: liveData,
    isLoading: isLiveLoading,
    isFetching: isLiveFetching,
    isError: isLiveError,
  } = useGetCatalogQuery(currentQuery, { skip: hasMatchingSsrData });

  const data = hasMatchingSsrData ? initialData : liveData;
  const isLoading = hasMatchingSsrData ? false : isLiveLoading;
  const isFetching = hasMatchingSsrData ? false : isLiveFetching;
  const isError = hasMatchingSsrData ? initialError : isLiveError;

  const [queryInput, setQueryInput] = useState(query);
  const [authorInput, setAuthorInput] = useState(author);

  const books = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const isCatalogBusy = Boolean(!isError && (isRoutePending || isLoading || isFetching));
  const isEmptyCatalog = Boolean(
    !isError && data && data.total === 0 && !isLoading && !isRoutePending
  );

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

    startRouteTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      page: '1',
      query: queryInput.trim() || undefined,
      author: authorInput.trim() || undefined,
    });
  };

  const handleClearFilters = () => {
    setQueryInput('');
    setAuthorInput('');
    updateParams({
      page: '1',
      query: undefined,
      author: undefined,
      sort: undefined,
      order: undefined,
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
          isFetching={isFetching || isRoutePending}
          onQueryChange={setQueryInput}
          onAuthorChange={setAuthorInput}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onSortChange={(value) => updateParams({ page: '1', sort: value })}
          onOrderChange={(value) => updateParams({ page: '1', order: value })}
        />

        <div className="relative min-h-[12rem]">
          {isCatalogBusy ? (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-start gap-3 rounded-lg bg-background/55 pt-14 backdrop-blur-sm"
              aria-busy="true"
              aria-label="Updating catalog"
              role="status"
            >
              <span className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Updating catalog…</span>
            </div>
          ) : null}

          <div
            className={
              isCatalogBusy
                ? 'pointer-events-none select-none opacity-60 flex flex-col gap-4'
                : 'flex flex-col gap-4'
            }
          >
            <div
              className={
                isEmptyCatalog
                  ? 'flex flex-col items-center justify-center gap-2 text-center'
                  : 'flex items-center justify-between gap-2'
              }
            >
              <p className="text-sm text-muted-foreground">{summary}</p>
              {isFetching && !isLoading && !isRoutePending ? (
                <Badge variant="info">Refreshing</Badge>
              ) : null}
            </div>

            {isError ? (
              <ErrorStateCard message="Failed to load catalog. Please try again." />
            ) : null}

            {!isError ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <CatalogBookCard key={book.id} book={book} />
                ))}
              </div>
            ) : null}

            {!isError && !isLoading && !isRoutePending && books.length === 0 ? (
              <div className="mx-auto mt-4 flex w-full max-w-2xl justify-center">
                <EmptyStateCard
                  message="No books match current filters."
                  className="w-full text-center"
                />
              </div>
            ) : null}

            <div className="mt-6">
              <CatalogPagination
                page={page}
                totalPages={totalPages}
                isLoading={isLoading || isRoutePending}
                onPrev={() => goToPage(page - 1)}
                onNext={() => goToPage(page + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
