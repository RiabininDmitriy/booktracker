'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { SignInCard } from '@/components/auth/sign-in-card';
import { getApiErrorMessage } from '@/lib/auth/api-error';
import { setAccessTokenCookie } from '@/lib/auth/session';
import { useAppDispatch } from '@/lib/store/hooks';
import { useLoginMutation } from '@/lib/store/api/auth-api';
import { setCredentials } from '@/lib/store/features/auth-slice';

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
      dispatch(setCredentials({ accessToken: response.accessToken, user: response.user }));
      setAccessTokenCookie(response.accessToken);
      router.push('/dashboard');
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
