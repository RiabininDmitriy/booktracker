import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { CatalogOrder, CatalogSort } from '@/lib/store/api/books-api';

type CatalogFiltersProps = {
  queryInput: string;
  authorInput: string;
  sort: CatalogSort;
  order: CatalogOrder;
  isFetching: boolean;
  onQueryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onApplyFilters: (event: FormEvent<HTMLFormElement>) => void;
  onClearFilters: () => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
};

export function CatalogFilters({
  queryInput,
  authorInput,
  sort,
  order,
  isFetching,
  onQueryChange,
  onAuthorChange,
  onApplyFilters,
  onClearFilters,
  onSortChange,
  onOrderChange,
}: CatalogFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Search by title/author and adjust sorting.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-6"
          data-testid="catalog-filters"
          onSubmit={onApplyFilters}
        >
          <Input
            data-testid="catalog-query-input"
            placeholder="Search title or author"
            value={queryInput}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <Input
            data-testid="catalog-author-input"
            placeholder="Author"
            value={authorInput}
            onChange={(event) => onAuthorChange(event.target.value)}
          />
          <Select
            data-testid="catalog-sort-select"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
          </Select>
          <Select
            data-testid="catalog-order-select"
            value={order}
            onChange={(event) => onOrderChange(event.target.value)}
          >
            <option value="desc">DESC</option>
            <option value="asc">ASC</option>
          </Select>
          <Button
            type="button"
            variant="secondary"
            className="h-11 w-full"
            data-testid="catalog-clear-button"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
          <Button type="submit" className="h-11 w-full" data-testid="catalog-apply-button">
            {isFetching ? 'Applying...' : 'Apply'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
