const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;

export function persistAppAccessTokenCookie(accessToken: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${ACCESS_TOKEN_MAX_AGE_SECONDS}; Secure; SameSite=Lax`;
}

export function clearAppAccessTokenCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
}
