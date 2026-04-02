'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { baseApi } from '@/lib/store/api/base-api';
import { useLogoutMutation } from '@/lib/store/api/auth-api';
import { useAppDispatch } from '@/lib/store/hooks';

export function SignOutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      dispatch(baseApi.util.resetApiState());
      await logout().unwrap();
      router.replace('/sign-in');
      router.refresh();
    } catch {
      // If logout fails, keep user on current page; cookie/session may still be valid.
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
