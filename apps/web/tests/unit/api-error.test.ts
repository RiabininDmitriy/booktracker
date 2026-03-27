import { describe, expect, it } from 'vitest';

import { getApiErrorMessage } from '@/lib/auth/api-error';

describe('getApiErrorMessage', () => {
  it('returns first validation message from array', () => {
    const error = {
      data: {
        message: ['Email is already in use', 'Other message'],
      },
    };

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Email is already in use');
  });

  it('returns string data message', () => {
    const error = {
      data: {
        message: 'Invalid credentials',
      },
    };

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Invalid credentials');
  });

  it('returns transport error when provided', () => {
    const error = {
      error: 'Failed to fetch',
    };

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Failed to fetch');
  });

  it('returns fallback when shape is unknown', () => {
    expect(getApiErrorMessage({ foo: 'bar' }, 'Fallback')).toBe('Fallback');
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
