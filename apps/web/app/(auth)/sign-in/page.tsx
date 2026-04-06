'use client';

import type { FormEvent } from 'react';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { SignInCard } from '@/components/auth/sign-in-card';
import { persistAppAccessTokenCookie } from '@/lib/auth/app-session-cookie';
import { getApiErrorMessage } from '@/lib/auth/api-error';
import { useLoginMutation } from '@/lib/store/api/auth-api';

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await login({ email, password }).unwrap();
      if (!response.user) {
        setError('Unexpected auth response. Please try again.');
        return;
      }
      persistAppAccessTokenCookie(response.accessToken);

      const nextPath = searchParams.get('next');
      const destination = nextPath?.startsWith('/') ? nextPath : '/dashboard';
      router.replace(destination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please try again.'));
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
          isSubmitting={isLoading}
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
