import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireServerSession(nextPath: string): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
}
