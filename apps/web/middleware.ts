import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ACCESS_COOKIE_NAME = 'access_token';
const AUTH_PAGES = ['/sign-in', '/sign-up'];
const PROTECTED_PATH_PREFIXES = ['/dashboard', '/catalog', '/books'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isProtectedPath = PROTECTED_PATH_PREFIXES.some((protectedPrefix) =>
    pathname.startsWith(protectedPrefix)
  );

  if (!hasAccessToken && isProtectedPath) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (hasAccessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up', '/dashboard/:path*', '/catalog/:path*', '/books/:path*'],
};
