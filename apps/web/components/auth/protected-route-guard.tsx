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

  useEffect(() => {
    if (isLoading || !isError) {
      return;
    }

    const currentPath = pathname || '/dashboard';
    const next = encodeURIComponent(currentPath || '/dashboard');
    window.location.replace(`/sign-in?next=${next}`);
  }, [isError, isLoading, pathname]);

  if (isLoading) {
    return null;
  }

  if (isError) {
    return null;
  }

  return <>{children}</>;
}
