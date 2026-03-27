'use client';

import type { FormEvent } from 'react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SignInCard } from '@/components/auth/sign-in-card';
import { getApiErrorMessage } from '@/lib/auth/api-error';
import { setAccessTokenCookie } from '@/lib/auth/session';
import type { AuthResponse } from '@/lib/store/api/auth-api';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/lib/store/features/auth-slice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function SignInPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    let response: AuthResponse;
    setIsSubmitting(true);

    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const payload = (await authResponse.json()) as AuthResponse | { message?: string | string[] };
      if (!authResponse.ok) {
        setError(getApiErrorMessage({ data: payload }, 'Unable to sign in. Please try again.'));
        return;
      }

      response = payload as AuthResponse;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please try again.'));
      return;
    } finally {
      setIsSubmitting(false);
    }

    if (!response.accessToken || !response.user) {
      setError('Unexpected auth response. Please try again.');
      return;
    }

    try {
      dispatch(setCredentials({ accessToken: response.accessToken, user: response.user }));
      setAccessTokenCookie(response.accessToken);

      const nextPath = searchParams.get('next');
      const destination = nextPath?.startsWith('/') ? nextPath : '/dashboard';
      window.location.replace(destination);
    } catch {
      setError('Sign-in succeeded, but redirect failed. Please refresh and try again.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <SignInCard
          email={email}
          password={password}
          rememberMe={rememberMe}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRememberMeChange={setRememberMe}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12" />
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
