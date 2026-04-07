'use client';

import { useMemo } from 'react';

import { DashboardReadingColumn } from '@/components/dashboard/dashboard-reading-column';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorStateCard, LoadingStateCard } from '@/components/ui/state-card';
import { groupReadingStatuses } from '@/lib/dashboard/group-reading-statuses';
import { useGetMyReadingStatusesQuery } from '@/lib/store/api/dashboard-api';

export function DashboardPageClient() {
  const { data, isLoading, isError } = useGetMyReadingStatusesQuery();
  const grouped = useMemo(() => groupReadingStatuses(data), [data]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <span>Your dashboard</span>
              <Badge variant="info">{(data ?? []).length} books</Badge>
            </CardTitle>
            <CardDescription className="text-center">
              Track your reading lists by status and jump to any book details.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Organize your library as Planned, Reading, and Completed.
            </p>
          </CardContent>
        </Card>

        {isLoading ? <LoadingStateCard message="Loading reading lists..." /> : null}
        {isError ? <ErrorStateCard message="Failed to load dashboard lists." /> : null}

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
