import type { ReactNode } from 'react';

import { requireServerSession } from '@/lib/auth/require-server-session';

export default async function MyAccountLayout({ children }: { children: ReactNode }) {
  await requireServerSession('/my-account');
  return children;
}
