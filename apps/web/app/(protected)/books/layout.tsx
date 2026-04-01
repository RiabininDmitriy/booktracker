import type { ReactNode } from 'react';

import { requireServerSession } from '@/lib/auth/require-server-session';

export default async function BooksLayout({ children }: { children: ReactNode }) {
  await requireServerSession('/books');
  return children;
}
