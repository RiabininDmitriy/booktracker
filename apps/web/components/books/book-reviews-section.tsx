import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Review } from '@/lib/store/api/book-detail-api';

type BookReviewsSectionProps = {
  draftReview: string;
  reviews: Review[] | undefined;
  isReviewsLoading: boolean;
  isAddingReview: boolean;
  onDraftReviewChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function BookReviewsSection({
  draftReview,
  reviews,
  isReviewsLoading,
  isAddingReview,
  onDraftReviewChange,
  onSubmit,
}: BookReviewsSectionProps) {
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
            onChange={(event) => onDraftReviewChange(event.target.value)}
          />
          <Button type="submit" disabled={isAddingReview || !draftReview.trim()}>
            {isAddingReview ? 'Saving...' : 'Add review'}
          </Button>
        </form>

        {isReviewsLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        ) : null}

        <div className="space-y-3">
          {(reviews ?? []).map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">{review.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
          {!isReviewsLoading && (reviews?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
