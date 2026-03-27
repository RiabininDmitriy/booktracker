'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { BookDetailsHero } from '@/components/books/book-details-hero';
import { BookReviewsSection } from '@/components/books/book-reviews-section';
import { ErrorStateCard, LoadingStateCard } from '@/components/ui/state-card';
import {
  useAddReviewMutation,
  useGetBookByIdQuery,
  useGetReviewsByBookQuery,
  useSetRatingMutation,
  useSetReadingStatusMutation,
  useToggleFavoriteMutation,
  type ReadingStatus,
} from '@/lib/store/api/book-detail-api';
import { useAppSelector } from '@/lib/store/hooks';

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const bookId = params?.id;
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const [draftReview, setDraftReview] = useState('');
  const [localRating, setLocalRating] = useState<number | null>(null);
  const [localStatus, setLocalStatus] = useState<ReadingStatus | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    data: book,
    isLoading: isBookLoading,
    isError: isBookError,
  } = useGetBookByIdQuery(bookId ?? '', {
    skip: !bookId,
  });
  const { data: reviews, isLoading: isReviewsLoading } = useGetReviewsByBookQuery(bookId ?? '', {
    skip: !bookId,
  });

  const [setRating, { isLoading: isSavingRating }] = useSetRatingMutation();
  const [setReadingStatus, { isLoading: isSavingStatus }] = useSetReadingStatusMutation();
  const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();
  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();

  const effectiveRating = localRating ?? book?.avgRating ?? null;

  const reviewsCountLabel = useMemo(() => {
    if (!reviews) return 'Loading reviews...';
    return `${reviews.length} reviews`;
  }, [reviews]);

  const handleRating = async (value: number) => {
    if (!bookId) return;

    try {
      const response = await setRating({ bookId, value }).unwrap();
      setLocalRating(response.avgRating ?? value);
      setFeedback('Rating saved.');
    } catch {
      setFeedback('Unable to save rating.');
    }
  };

  const handleStatus = async (status: ReadingStatus) => {
    if (!bookId) return;

    try {
      const response = await setReadingStatus({ bookId, status }).unwrap();
      setLocalStatus(response.status);
      setFeedback('Reading status updated.');
    } catch {
      setFeedback('Unable to update status.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!bookId) return;

    try {
      const response = await toggleFavorite({ bookId }).unwrap();
      setIsFavorite(response.isFavorite);
      setFeedback(response.isFavorite ? 'Added to favorites.' : 'Removed from favorites.');
    } catch {
      setFeedback('Unable to update favorite.');
    }
  };

  const handleAddReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookId || !draftReview.trim()) return;

    try {
      await addReview({ bookId, text: draftReview.trim() }).unwrap();
      setDraftReview('');
      setFeedback('Review added.');
    } catch {
      setFeedback('Unable to add review.');
    }
  };

  if (!bookId) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
        <p className="text-sm text-danger">Missing book id.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Book details</h1>
          <Link
            href="/catalog"
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50"
          >
            Back to catalog
          </Link>
        </div>

        {isBookLoading ? <LoadingStateCard message="Loading book..." /> : null}
        {isBookError ? <ErrorStateCard message="Failed to load this book." /> : null}

        {book ? (
          <BookDetailsHero
            book={book}
            effectiveRating={effectiveRating}
            reviewsCountLabel={reviewsCountLabel}
            isFavorite={isFavorite}
            localStatus={localStatus}
            feedback={feedback}
            isSavingStatus={isSavingStatus}
            isSavingRating={isSavingRating}
            isTogglingFavorite={isTogglingFavorite}
            onStatusChange={handleStatus}
            onRate={handleRating}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : null}

        <BookReviewsSection
          draftReview={draftReview}
          reviews={reviews}
          currentUserId={currentUserId}
          isReviewsLoading={isReviewsLoading}
          isAddingReview={isAddingReview}
          onDraftReviewChange={setDraftReview}
          onSubmit={handleAddReview}
        />
      </div>
    </main>
  );
}
