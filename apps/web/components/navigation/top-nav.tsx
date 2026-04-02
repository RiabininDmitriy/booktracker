'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { classNames } from '@/lib/cn';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function isActiveCatalog(pathname: string): boolean {
  return pathname === '/catalog' || pathname.startsWith('/books/');
}

function isActiveDashboard(pathname: string): boolean {
  return pathname === '/dashboard';
}

function isActiveAccount(pathname: string): boolean {
  return pathname === '/my-account' || pathname.startsWith('/my-account/');
}

export function TopNav() {
  const pathname = usePathname();

  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-foreground hover:opacity-90"
            aria-label="Booktracker home"
          >
            Booktracker
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={classNames(
              'inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
              isActiveDashboard(pathname)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-surface'
            )}
          >
            Dashboard
          </Link>

          <Link
            href="/catalog"
            className={classNames(
              'inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
              isActiveCatalog(pathname)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-surface'
            )}
          >
            Catalog
          </Link>

          <Link
            href="/my-account"
            className={classNames(
              'inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
              isActiveAccount(pathname)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-surface'
            )}
          >
            My account
          </Link>
        </div>
      </div>
    </nav>
  );
}
