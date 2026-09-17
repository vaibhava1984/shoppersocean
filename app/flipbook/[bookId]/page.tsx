import FlipbookPageClient from './FlipbookPageClient';

export default async function FlipbookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  return <FlipbookPageClient bookId={bookId} />;
}
