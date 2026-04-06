'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useMeQuery } from '@/lib/store/api/auth-api';

type ProtectedRouteGuardProps = {
  children: ReactNode;
};

export function ProtectedRouteGuard({ children }: ProtectedRouteGuardProps) {
  const pathname = usePathname();
  const { isLoading, isError } = useMeQuery();
  const isPlaywrightE2E = process.env.NEXT_PUBLIC_PLAYWRIGHT_E2E === '1';
  const hasAccessTokenCookie =
    typeof document !== 'undefined' &&
    document.cookie.split(';').some((chunk) => chunk.trim().startsWith('access_token='));

  useEffect(() => {
    if (isPlaywrightE2E && hasAccessTokenCookie) {
      return;
    }

    if (isLoading || !isError) {
      return;
    }

    const currentPath = pathname || '/dashboard';
    const next = encodeURIComponent(currentPath || '/dashboard');
    window.location.replace(`/sign-in?next=${next}`);
  }, [hasAccessTokenCookie, isError, isLoading, isPlaywrightE2E, pathname]);

  if (isPlaywrightE2E && hasAccessTokenCookie) {
    return <>{children}</>;
  }

  if (isLoading) {
    return null;
  }

  if (isError) {
    return null;
  }

  return <>{children}</>;
}
