import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignOutButton } from '@/components/auth/sign-out-button';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Your dashboard</CardTitle>
          <CardDescription>
            Protected route is active. Next tasks will add catalog and reading views.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            You are authenticated and can continue to app features.
          </p>
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground"
              href="/catalog"
            >
              Open catalog
            </Link>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
