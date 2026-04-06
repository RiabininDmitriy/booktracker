import type { ReactNode } from 'react';

import { ProtectedRouteGuard } from '@/components/auth/protected-route-guard';
import { TopNav } from '@/components/navigation/top-nav';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <ProtectedRouteGuard>{children}</ProtectedRouteGuard>
    </>
  );
}
