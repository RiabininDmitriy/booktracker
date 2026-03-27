import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { CatalogBook } from '@/lib/store/api/books-api';
import type { ReadingStatus } from '@/lib/store/api/book-detail-api';

const readingStatusOptions: Array<{ value: ReadingStatus; label: string }> = [
  { value: 'planned', label: 'Planned' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
];

type BookDetailsHeroProps = {
  book: CatalogBook;
  effectiveRating: number | null;
  reviewsCountLabel: string;
  isFavorite: boolean;
  localStatus: ReadingStatus | null;
  feedback: string | null;
  isSavingStatus: boolean;
  isSavingRating: boolean;
  isTogglingFavorite: boolean;
  onStatusChange: (status: ReadingStatus) => void;
  onRate: (value: number) => void;
  onToggleFavorite: () => void;
};

export function BookDetailsHero({
  book,
  effectiveRating,
  reviewsCountLabel,
  isFavorite,
  localStatus,
  feedback,
  isSavingStatus,
  isSavingRating,
  isTogglingFavorite,
  onStatusChange,
  onRate,
  onToggleFavorite,
}: BookDetailsHeroProps) {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <div className="relative h-80 overflow-hidden rounded-md border border-border bg-surface">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 260px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No cover available
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                My reading status
              </p>
              <Select
                value={localStatus ?? 'planned'}
                onChange={(event) => onStatusChange(event.target.value as ReadingStatus)}
                disabled={isSavingStatus}
              >
                {readingStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                My rating
              </p>
              <div className="flex flex-nowrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    className="h-11 w-11 shrink-0 px-0"
                    variant="secondary"
                    onClick={() => onRate(value)}
                    disabled={isSavingRating}
                  >
                    {value}★
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Tap to rate 1-5</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-4xl font-bold text-foreground">{book.title}</h2>
              <p className="mt-2 text-base text-muted-foreground">
                {book.author ?? 'Unknown author'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={effectiveRating ? 'success' : 'default'}>
                {effectiveRating ? `Rating ${effectiveRating.toFixed(1)}` : 'No rating yet'}
              </Badge>
              <Badge variant="info">{reviewsCountLabel}</Badge>
              <Badge variant={isFavorite ? 'warning' : 'default'}>
                {isFavorite ? 'Favorite' : 'Not favorite'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </Button>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              {book.description?.trim() || 'No book description available yet.'}
            </p>

            {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
