import { BookDetailsPageClient } from '@/components/books/book-details-page-client';

type BookDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
        <p className="text-sm text-danger">Missing book id.</p>
      </main>
    );
  }

  return <BookDetailsPageClient bookId={id} />;
}
