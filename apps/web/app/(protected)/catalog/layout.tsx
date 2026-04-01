import type { ReactNode } from 'react';

import { requireServerSession } from '@/lib/auth/require-server-session';

export default async function CatalogLayout({ children }: { children: ReactNode }) {
  await requireServerSession('/catalog');
  return children;
}
