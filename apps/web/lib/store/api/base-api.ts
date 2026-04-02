import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Keep the base URL in env so web can point to local API in dev and cloud API in prod.
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  const isPlaywrightE2E = process.env.NEXT_PUBLIC_PLAYWRIGHT_E2E === '1';

  if (isPlaywrightE2E) {
    return result;
  }

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthRequest =
      url === '/auth/login' ||
      url === '/auth/register' ||
      url === '/auth/refresh' ||
      url === '/auth/logout';

    if (!isAuthRequest) {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(baseApi.util.resetApiState());
        if (typeof window !== 'undefined' && process.env.PLAYWRIGHT_E2E !== '1') {
          const currentPath = `${window.location.pathname}${window.location.search}`;
          const safeNext =
            currentPath.startsWith('/sign-in') || currentPath.startsWith('/sign-up')
              ? '/dashboard'
              : currentPath;
          window.location.replace(`/sign-in?next=${encodeURIComponent(safeNext)}`);
        }
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Book', 'Review', 'Rating', 'ReadingStatus', 'Favorite', 'Health'],
  endpoints: () => ({}),
});
