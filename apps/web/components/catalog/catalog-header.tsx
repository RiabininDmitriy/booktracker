import Link from 'next/link';

type CatalogHeaderProps = {
  title: string;
  subtitle: string;
};

export function CatalogHeader({ title, subtitle }: CatalogHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground"
        href="/dashboard"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
