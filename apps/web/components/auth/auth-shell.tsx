'use client';

import { useState } from 'react';

import { SignInCard } from './sign-in-card';
import { SignUpCard } from './sign-up-card';

export function AuthShell() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        {mode === 'signIn' ? (
          <SignInCard onSwitchToSignUp={() => setMode('signUp')} />
        ) : (
          <SignUpCard onSwitchToSignIn={() => setMode('signIn')} />
        )}
      </div>
    </main>
  );
}
