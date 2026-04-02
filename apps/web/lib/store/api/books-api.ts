import { baseApi } from './base-api';

export type CatalogSort = 'rating' | 'createdAt' | 'title';
export type CatalogOrder = 'asc' | 'desc';

export type CatalogBook = {
  id: string;
  externalId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  description: string | null;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
};

export type CatalogResponse = {
  items: CatalogBook[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CatalogQuery = {
  page?: number;
  limit?: number;
  sort?: CatalogSort;
  order?: CatalogOrder;
  query?: string;
  author?: string;
};

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatalog: builder.query<CatalogResponse, CatalogQuery>({
      query: ({ page = 1, limit = 12, sort = 'title', order = 'desc', query, author }) => ({
        url: '/books',
        params: {
          page,
          limit,
          sort,
          order,
          ...(query ? { query } : {}),
          ...(author ? { author } : {}),
        },
      }),
      providesTags: ['Book'],
    }),
  }),
});

export const { useGetCatalogQuery } = booksApi;
