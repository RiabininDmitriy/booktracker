import { baseApi } from './base-api';

export type DashboardReadingStatus = 'planned' | 'reading' | 'completed';

export type DashboardReadingItem = {
  userId: string;
  bookId: string;
  status: DashboardReadingStatus;
  updatedAt: string;
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
  };
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyReadingStatuses: builder.query<DashboardReadingItem[], void>({
      query: () => '/reading-statuses/me',
      providesTags: ['ReadingStatus', 'Book'],
    }),
  }),
});

export const { useGetMyReadingStatusesQuery } = dashboardApi;
