import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Keep the base URL in env so web can point to local API in dev and cloud API in prod.
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Auth', 'Book', 'Review', 'Rating', 'ReadingStatus', 'Favorite', 'Health'],
  endpoints: () => ({}),
});
