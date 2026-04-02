import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardReadingItem } from '@/lib/store/api/dashboard-api';

type DashboardReadingColumnProps = {
  title: string;
  items: DashboardReadingItem[];
};

export function DashboardReadingColumn({ title, items }: DashboardReadingColumnProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{title}</span>
          <Badge variant="info">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No books yet.</p>
        ) : (
          items.map((item) => (
            <Link key={item.bookId} className="block" href={`/books/${item.bookId}`}>
              <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:border-primary/60">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-border bg-background">
                  {item.book.coverUrl ? (
                    <Image
                      src={item.book.coverUrl}
                      alt={`${item.book.title} cover`}
                      fill
                      className="object-contain"
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                      No cover
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {item.book.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.book.author ?? 'Unknown author'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
