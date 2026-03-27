const ACCESS_COOKIE_NAME = 'access_token';
const MAX_AGE_SECONDS = 15 * 60;

export function setAccessTokenCookie(token: string): void {
  document.cookie = `${ACCESS_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearAccessTokenCookie(): void {
  document.cookie = `${ACCESS_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
