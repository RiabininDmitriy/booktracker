import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function toCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

export async function requireServerSession(nextPath: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = toCookieHeader(cookieStore);

  if (!cookieHeader) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  // Playwright e2e mocks run in the browser layer and do not intercept server-side /auth/me fetch.
  // In e2e mode, rely on cookie presence for route gating.
  if (process.env.PLAYWRIGHT_E2E === '1') {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    if (response.ok) {
      return;
    }
  } catch {
    // Fall through to redirect.
  }

  redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
}
