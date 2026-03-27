'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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

export default function CatalogPage() {
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Catalog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse books with search, filters and pagination.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search by title/author and adjust sorting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-5"
              data-testid="catalog-filters"
              onSubmit={handleApplyFilters}
            >
              <Input
                data-testid="catalog-query-input"
                placeholder="Search title or author"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
              />
              <Input
                data-testid="catalog-author-input"
                placeholder="Author"
                value={authorInput}
                onChange={(event) => setAuthorInput(event.target.value)}
              />
              <Select
                data-testid="catalog-sort-select"
                value={sort}
                onChange={(event) => updateParams({ page: '1', sort: event.target.value })}
              >
                <option value="createdAt">Newest</option>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
              </Select>
              <Select
                data-testid="catalog-order-select"
                value={order}
                onChange={(event) => updateParams({ page: '1', order: event.target.value })}
              >
                <option value="desc">DESC</option>
                <option value="asc">ASC</option>
              </Select>
              <Button type="submit" data-testid="catalog-apply-button">
                {isFetching ? 'Applying...' : 'Apply'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{summary}</p>
          {isFetching && !isLoading ? <Badge variant="info">Refreshing</Badge> : null}
        </div>

        {isError ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-danger">Failed to load catalog. Please try again.</p>
            </CardContent>
          </Card>
        ) : null}

        {!isError ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-xl">{book.title}</CardTitle>
                  <CardDescription>{book.author ?? 'Unknown author'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={book.avgRating ? 'success' : 'default'}>
                      {book.avgRating ? `Rating ${book.avgRating.toFixed(1)}` : 'No rating'}
                    </Badge>
                    <Badge variant="info">{book.reviewCount} reviews</Badge>
                  </div>
                  {book.coverUrl ? (
                    <a
                      className="text-sm text-primary hover:text-primary-hover"
                      href={book.coverUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open cover
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No cover available</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!isError && !isLoading && books.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">No books match current filters.</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <Button
            data-testid="catalog-prev-button"
            variant="secondary"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page}
            {totalPages > 0 ? ` / ${totalPages}` : ''}
          </p>
          <Button
            data-testid="catalog-next-button"
            variant="secondary"
            onClick={() => goToPage(page + 1)}
            disabled={isLoading || totalPages === 0 || page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
