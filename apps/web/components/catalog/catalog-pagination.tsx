import { Button } from '@/components/ui/button';

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function CatalogPagination({
  page,
  totalPages,
  isLoading,
  onPrev,
  onNext,
}: CatalogPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        data-testid="catalog-prev-button"
        variant="secondary"
        onClick={onPrev}
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
        onClick={onNext}
        disabled={isLoading || totalPages === 0 || page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
