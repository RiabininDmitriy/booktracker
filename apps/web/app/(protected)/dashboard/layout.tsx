import type { ReactNode } from 'react';

import { requireServerSession } from '@/lib/auth/require-server-session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireServerSession('/dashboard');
  return children;
}
