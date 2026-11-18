import type { Metadata } from "next";
import GameShareRedirect from "./redirect";
const games: Record<string, { title: string; description: string; emoji: string }> = {
  chess: { title: "Ocean Chess", description: "Challenge yourself with Ocean Chess on Shoppers Ocean.", emoji: "♟" },
  "snakes-ladders": { title: "Snake & Ladders", description: "Race to 100 in Snake & Ladders on Shoppers Ocean.", emoji: "🐍" },
  "ocean-solitaire": { title: "Ocean Solitaire", description: "Play Ocean Solitaire on Shoppers Ocean.", emoji: "🃏" },
  "tic-tac-toe": { title: "Tic Tac Toe", description: "Enjoy a strategy duel with Tic Tac Toe on Shoppers Ocean.", emoji: "⭕" },
  archery3d: { title: "Archery 3D", description: "Aim, adjust for wind and hit the targets in Archery 3D.", emoji: "🏹" },
  "ocean-carrom": { title: "Ocean Carrom", description: "Aim, strike and pocket the coins in Ocean Carrom.", emoji: "🎯" },
  "urban-rider-final": { title: "Urban Rider", description: "Ride through a 3D city, weave through traffic and perform stunts in Urban Rider on Shoppers Ocean.", emoji: "🏍️" },
  "bubble-shooter": { title: "Bubble Shooter", description: "Aim, match colours and clear bubbles in Bubble Shooter on Shoppers Ocean.", emoji: "🫧" },
};
type Props = { params: Promise<{ gameId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const safeId = gameId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const game = games[safeId] ?? {
    title: safeId.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Online Game",
    description: "Play " + safeId.split("-").join(" ") + " on Shoppers Ocean.",
    emoji: "🎮",
  };
  const url = "https://shoppersocean.com/play/" + encodeURIComponent(safeId);
  const image = "https://shoppersocean.com/api/game-share-image/" + encodeURIComponent(safeId) + "?v=2";
  return { title: game.title + " | Shoppers Ocean", description: game.description, alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Shoppers Ocean", title: game.title + " | Shoppers Ocean", description: game.description, images: [{ url: image, width: 1200, height: 630, alt: game.title + " game on Shoppers Ocean" }] },
    twitter: { card: "summary_large_image", title: game.title + " | Shoppers Ocean", description: game.description, images: [image] } };
}
export default async function SharedGamePage({ params }: Props) {
  const { gameId } = await params;
  const safeId = gameId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const game = games[safeId] ?? {
    title: safeId.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Online Game",
  };
  return <GameShareRedirect gameId={safeId} title={game.title} />;
}