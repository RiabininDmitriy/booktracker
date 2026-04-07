import { Suspense } from 'react';

import { SignInPageClient } from '@/components/auth/sign-in-page-client';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12" />
      }
    >
      <SignInPageClient />
    </Suspense>
  );
}
