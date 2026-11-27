import { redirect } from "next/navigation";

// Keep previously shared game URLs working after the canonical route changed.
export default async function LegacySharedGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  redirect(`/games/${encodeURIComponent(game)}`);
}
