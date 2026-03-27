'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { SignUpCard } from '@/components/auth/sign-up-card';
import { getApiErrorMessage } from '@/lib/auth/api-error';
import { setAccessTokenCookie } from '@/lib/auth/session';
import { useRegisterMutation } from '@/lib/store/api/auth-api';
import { setCredentials } from '@/lib/store/features/auth-slice';
import { useAppDispatch } from '@/lib/store/hooks';

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await register({
        email,
        password,
        name: name.trim() || undefined,
      }).unwrap();
      dispatch(setCredentials({ accessToken: response.accessToken, user: response.user }));
      setAccessTokenCookie(response.accessToken);
      router.push('/dashboard');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create account. Please try again.'));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <SignUpCard
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          error={error}
        />
      </div>
    </main>
  );
}
