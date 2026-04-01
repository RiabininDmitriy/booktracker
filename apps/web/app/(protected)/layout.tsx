import type { ReactNode } from 'react';

import { TopNav } from '@/components/navigation/top-nav';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      {children}
    </>
  );
}
