import { describe, expect, it } from 'vitest';

import {
  authReducer,
  clearCredentials,
  setCredentials,
  type AuthState,
} from '@/lib/store/features/auth-slice';

describe('auth-slice', () => {
  it('returns initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });

    expect(state).toEqual({
      accessToken: null,
      user: null,
    });
  });

  it('sets credentials', () => {
    const payload: AuthState = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        email: 'admin@gmail.com',
        name: 'Admin',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };

    const state = authReducer(undefined, setCredentials(payload));
    expect(state).toEqual(payload);
  });

  it('clears credentials', () => {
    const populatedState: AuthState = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        email: 'admin@gmail.com',
        name: 'Admin',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };

    const state = authReducer(populatedState, clearCredentials());
    expect(state).toEqual({
      accessToken: null,
      user: null,
    });
  });
});
