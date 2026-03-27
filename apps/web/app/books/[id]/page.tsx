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
  useDeleteReviewMutation,
  useGetBookByIdQuery,
  useGetReviewsByBookQuery,
  useSetRatingMutation,
  useSetReadingStatusMutation,
  useToggleFavoriteMutation,
  useUpdateReviewMutation,
  type ReadingStatus,
} from '@/lib/store/api/book-detail-api';
import { useMeQuery } from '@/lib/store/api/auth-api';
import { useAppSelector } from '@/lib/store/hooks';

const readingStatusOrder: Record<ReadingStatus, number> = {
  planned: 0,
  reading: 1,
  completed: 2,
};

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const bookId = params?.id;
  const authUserId = useAppSelector((state) => state.auth.user?.id);
  const { data: me } = useMeQuery();
  const currentUserId = authUserId ?? me?.id;

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
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  const effectiveRating = localRating ?? book?.avgRating ?? null;
  const effectiveStatus = localStatus ?? 'planned';
  const hasMyReview = Boolean(
    currentUserId && reviews?.some((review) => review.userId === currentUserId)
  );

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
    if (readingStatusOrder[status] < readingStatusOrder[effectiveStatus]) {
      setFeedback('Status can only move forward: planned -> reading -> completed.');
      return;
    }
    if (status === effectiveStatus) {
      return;
    }

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
    if (hasMyReview) {
      setFeedback('You already reviewed this book.');
      return;
    }

    try {
      await addReview({ bookId, text: draftReview.trim() }).unwrap();
      setDraftReview('');
      setFeedback('Review added.');
    } catch {
      setFeedback('Unable to add review.');
    }
  };

  const handleUpdateReview = async (reviewId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await updateReview({ reviewId, text: text.trim() }).unwrap();
      setFeedback('Review updated.');
    } catch {
      setFeedback('Unable to update review.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview({ reviewId }).unwrap();
      setFeedback('Review deleted.');
    } catch {
      setFeedback('Unable to delete review.');
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
          isUpdatingReview={isUpdatingReview}
          isDeletingReview={isDeletingReview}
          onDraftReviewChange={setDraftReview}
          onSubmit={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
        />
      </div>
    </main>
  );
}
