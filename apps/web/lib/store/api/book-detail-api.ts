import type { CatalogBook } from './books-api';
import { baseApi } from './base-api';

type Review = {
  id: string;
  userId: string;
  bookId: string;
  text: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
};

type RatingResponse = {
  userId: string;
  bookId: string;
  value: number;
  avgRating: number | null;
};

type ReadingStatus = 'planned' | 'reading' | 'completed';

type ReadingStatusResponse = {
  userId: string;
  bookId: string;
  status: ReadingStatus;
  updatedAt: string;
};

type FavoriteToggleResponse = {
  userId: string;
  bookId: string;
  isFavorite: boolean;
};

export const bookDetailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookById: builder.query<CatalogBook, string>({
      query: (bookId) => `/books/${bookId}`,
      providesTags: ['Book'],
    }),
    getReviewsByBook: builder.query<Review[], string>({
      query: (bookId) => `/reviews/book/${bookId}`,
      providesTags: ['Review'],
    }),
    addReview: builder.mutation<Review, { bookId: string; text: string }>({
      query: ({ bookId, text }) => ({
        url: `/reviews/${bookId}`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: ['Review', 'Book'],
    }),
    updateReview: builder.mutation<Review, { reviewId: string; text: string }>({
      query: ({ reviewId, text }) => ({
        url: `/reviews/${reviewId}`,
        method: 'PATCH',
        body: { text },
      }),
      invalidatesTags: ['Review', 'Book'],
    }),
    deleteReview: builder.mutation<void, { reviewId: string }>({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Book'],
    }),
    setRating: builder.mutation<RatingResponse, { bookId: string; value: number }>({
      query: ({ bookId, value }) => ({
        url: `/ratings/${bookId}`,
        method: 'PUT',
        body: { value },
      }),
      invalidatesTags: ['Book'],
    }),
    setReadingStatus: builder.mutation<
      ReadingStatusResponse,
      { bookId: string; status: ReadingStatus }
    >({
      query: ({ bookId, status }) => ({
        url: `/reading-statuses/${bookId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['ReadingStatus'],
    }),
    toggleFavorite: builder.mutation<FavoriteToggleResponse, { bookId: string }>({
      query: ({ bookId }) => ({
        url: `/favorites/${bookId}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['Favorite'],
    }),
  }),
});

export const {
  useGetBookByIdQuery,
  useGetReviewsByBookQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useSetRatingMutation,
  useSetReadingStatusMutation,
  useToggleFavoriteMutation,
} = bookDetailApi;

export type { ReadingStatus, Review };
