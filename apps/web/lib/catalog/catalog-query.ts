import type { CatalogOrder, CatalogQuery, CatalogSort } from '@/lib/store/api/books-api';

export type CatalogPageQuery = Required<Pick<CatalogQuery, 'page' | 'limit' | 'sort' | 'order'>> &
  Pick<CatalogQuery, 'query' | 'author'>;

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: CatalogSearchParams, key: string): string | null {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function toSort(value: string | null): CatalogSort {
  return value === 'rating' || value === 'title' || value === 'createdAt' ? value : 'title';
}

export function toOrder(value: string | null): CatalogOrder {
  return value === 'asc' || value === 'desc' ? value : 'desc';
}

export function parseCatalogQuery(searchParams: CatalogSearchParams): CatalogPageQuery {
  const page = toPositiveInt(getParam(searchParams, 'page'), 1);
  const limit = toPositiveInt(getParam(searchParams, 'limit'), 12);
  const sort = toSort(getParam(searchParams, 'sort'));
  const order = toOrder(getParam(searchParams, 'order'));
  const query = (getParam(searchParams, 'query') ?? '').trim();
  const author = (getParam(searchParams, 'author') ?? '').trim();

  return {
    page,
    limit,
    sort,
    order,
    query: query || undefined,
    author: author || undefined,
  };
}

export function isSameCatalogQuery(query: CatalogPageQuery, other: CatalogPageQuery): boolean {
  return (
    query.page === other.page &&
    query.limit === other.limit &&
    query.sort === other.sort &&
    query.order === other.order &&
    (query.query ?? '') === (other.query ?? '') &&
    (query.author ?? '') === (other.author ?? '')
  );
}
