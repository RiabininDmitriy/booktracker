import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card';
import { Textarea } from '@/components/ui/textarea';
import type { Review } from '@/lib/store/api/book-detail-api';

type BookReviewsSectionProps = {
  draftReview: string;
  reviews: Review[] | undefined;
  currentUserId?: string;
  isReviewsLoading: boolean;
  isAddingReview: boolean;
  isUpdatingReview: boolean;
  isDeletingReview: boolean;
  onDraftReviewChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateReview: (reviewId: string, text: string) => void;
  onDeleteReview: (reviewId: string) => void;
};

export function BookReviewsSection({
  draftReview,
  reviews,
  currentUserId,
  isReviewsLoading,
  isAddingReview,
  isUpdatingReview,
  isDeletingReview,
  onDraftReviewChange,
  onSubmit,
  onUpdateReview,
  onDeleteReview,
}: BookReviewsSectionProps) {
  const myReview = useMemo(
    () => reviews?.find((review) => currentUserId && review.userId === currentUserId),
    [currentUserId, reviews]
  );
  const hasMyReview = Boolean(myReview);
  const [myReviewDraft, setMyReviewDraft] = useState<string | null>(null);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>Read what users say and leave your own review.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={onSubmit}>
          <Textarea
            placeholder="Write your review..."
            value={draftReview}
            disabled={isAddingReview || hasMyReview}
            onChange={(event) => onDraftReviewChange(event.target.value)}
          />
          <Button type="submit" disabled={isAddingReview || hasMyReview || !draftReview.trim()}>
            {isAddingReview ? 'Saving...' : 'Add review'}
          </Button>
          {hasMyReview ? (
            <p className="text-xs text-muted-foreground">
              You already have a review for this book. Update or delete it to add a new one.
            </p>
          ) : null}
        </form>

        {isReviewsLoading ? <LoadingStateCard message="Loading reviews..." /> : null}

        <div className="space-y-3">
          {(reviews ?? []).map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {review.userId === currentUserId
                    ? 'My review'
                    : review.userName?.trim() || review.userEmail || 'Unknown user'}
                </p>
                {review.userId === currentUserId ? (
                  isEditingMyReview ? (
                    <form
                      className="space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        onUpdateReview(review.id, (myReviewDraft ?? review.text).trim());
                        setIsEditingMyReview(false);
                        setMyReviewDraft(null);
                      }}
                    >
                      <Textarea
                        value={myReviewDraft ?? review.text}
                        onChange={(event) => setMyReviewDraft(event.target.value)}
                        disabled={isUpdatingReview || isDeletingReview}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            isUpdatingReview ||
                            isDeletingReview ||
                            !(myReviewDraft ?? review.text).trim() ||
                            (myReviewDraft ?? review.text).trim() === review.text
                          }
                        >
                          {isUpdatingReview ? 'Saving...' : 'Save changes'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isUpdatingReview || isDeletingReview}
                          onClick={() => {
                            setIsEditingMyReview(false);
                            setMyReviewDraft(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-foreground">{review.text}</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={isUpdatingReview || isDeletingReview}
                          onClick={() => {
                            setIsEditingMyReview(true);
                            setMyReviewDraft(review.text);
                          }}
                        >
                          Edit review
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={isUpdatingReview || isDeletingReview}
                          onClick={() => onDeleteReview(review.id)}
                        >
                          {isDeletingReview ? 'Deleting...' : 'Delete review'}
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-foreground">{review.text}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
          {!isReviewsLoading && (reviews?.length ?? 0) === 0 ? (
            <EmptyStateCard message="No reviews yet." className="text-center" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
