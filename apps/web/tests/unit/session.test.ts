// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { clearAccessTokenCookie, setAccessTokenCookie } from '@/lib/auth/session';

describe('session cookie helpers', () => {
  it('sets encoded access token cookie', () => {
    setAccessTokenCookie('abc.123.+=/');

    expect(document.cookie).toContain('access_token=abc.123.%2B%3D%2F');
  });

  it('clears access token cookie', () => {
    setAccessTokenCookie('token');
    clearAccessTokenCookie();

    expect(document.cookie).not.toContain('access_token=');
  });
});
