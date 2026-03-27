'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { DashboardReadingColumn } from '@/components/dashboard/dashboard-reading-column';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardReadingItem } from '@/lib/store/api/dashboard-api';
import { useGetMyReadingStatusesQuery } from '@/lib/store/api/dashboard-api';

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetMyReadingStatusesQuery();

  const grouped = useMemo(() => {
    const initial = {
      planned: [] as DashboardReadingItem[],
      reading: [] as DashboardReadingItem[],
      completed: [] as DashboardReadingItem[],
    };

    for (const item of data ?? []) {
      initial[item.status].push(item);
    }

    return initial;
  }, [data]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Your dashboard</span>
              <Badge variant="info">{(data ?? []).length} books</Badge>
            </CardTitle>
            <CardDescription>
              Track your reading lists by status and jump to any book details.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Organize your library as Planned, Reading, and Completed.
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

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reading lists...</p>
        ) : null}
        {isError ? <p className="text-sm text-danger">Failed to load dashboard lists.</p> : null}

        {!isLoading && !isError ? (
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardReadingColumn title="Planned" items={grouped.planned} />
            <DashboardReadingColumn title="Reading" items={grouped.reading} />
            <DashboardReadingColumn title="Completed" items={grouped.completed} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
