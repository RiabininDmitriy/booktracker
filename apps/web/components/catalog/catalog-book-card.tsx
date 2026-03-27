import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CatalogBook } from '@/lib/store/api/books-api';

type CatalogBookCardProps = {
  book: CatalogBook;
};

export function CatalogBookCard({ book }: CatalogBookCardProps) {
  return (
    <Link className="group block" href={`/books/${book.id}`}>
      <Card className="flex h-full flex-col transition-colors hover:border-primary/60">
        <CardContent className="pb-0 pt-6">
          <div className="relative h-52 overflow-hidden rounded-md border border-border bg-surface">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`${book.title} cover`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No cover available
              </div>
            )}
          </div>
        </CardContent>
        <CardHeader className="min-h-28">
          <CardTitle className="line-clamp-2 text-xl transition-colors group-hover:text-primary">
            {book.title}
          </CardTitle>
          <CardDescription>{book.author ?? 'Unknown author'}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={book.avgRating ? 'success' : 'default'}>
              {book.avgRating ? `Rating ${book.avgRating.toFixed(1)}` : 'No rating'}
            </Badge>
            <Badge variant="info">{book.reviewCount} reviews</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
