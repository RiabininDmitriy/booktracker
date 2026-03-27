import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Narrow state shape for headers only — avoids importing RootState from store.ts (circular: store → baseApi → store).
type AuthTokenSlice = { auth: { accessToken: string | null } };

// Keep the base URL in env so web can point to local API in dev and cloud API in prod.
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const ACCESS_COOKIE_NAME = 'access_token';

function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const tokenCookie = document.cookie
    .split('; ')
    .find((cookiePart) => cookiePart.startsWith(`${ACCESS_COOKIE_NAME}=`));

  if (!tokenCookie) return null;
  const rawToken = tokenCookie.split('=').slice(1).join('=');

  try {
    return decodeURIComponent(rawToken);
  } catch {
    return rawToken;
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const stateToken = (getState() as AuthTokenSlice).auth.accessToken;
      const token = stateToken ?? getAccessTokenFromCookie();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Book', 'Review', 'Rating', 'ReadingStatus', 'Favorite', 'Health'],
  endpoints: () => ({}),
});
