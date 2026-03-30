'use client';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeQuery } from '@/lib/store/api/auth-api';
import { LoadingStateCard } from '@/components/ui/state-card';

export default function MyAccountPage() {
  const { data: me, isLoading, isError } = useMeQuery();

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-center">My account</CardTitle>
            <CardDescription className="text-center">
              Manage your account settings and sign out.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center">
            {isLoading ? (
              <LoadingStateCard message="Loading account info..." className="w-full max-w-sm" />
            ) : null}
            {!isLoading && isError ? (
              <p className="text-sm text-danger">
                Unable to load account info. You can still sign out.
              </p>
            ) : null}

            {!isLoading && !isError ? (
              <>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Nickname
                    </p>
                    <p className="text-sm font-medium text-foreground">{me?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm font-medium text-foreground">{me?.email ?? '—'}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  Your session is active. When you sign out, you will be redirected to the sign-in
                  page.
                </p>
              </>
            ) : null}

            <div className="mt-4 w-full max-w-sm">
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
