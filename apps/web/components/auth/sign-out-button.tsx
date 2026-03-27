'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { clearAccessTokenCookie } from '@/lib/auth/session';
import { useLogoutMutation } from '@/lib/store/api/auth-api';
import { clearCredentials } from '@/lib/store/features/auth-slice';
import { useAppDispatch } from '@/lib/store/hooks';

export function SignOutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Ignore network failures and still clear local auth state.
    } finally {
      clearAccessTokenCookie();
      dispatch(clearCredentials());
      router.push('/sign-in');
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleSignOut}
      disabled={isLoading}
      data-testid="sign-out-button"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
