'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-8 md:py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>BookTracker Auth</CardTitle>
          <CardDescription>Select a flow to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground"
            href="/sign-up"
          >
            Sign up
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
