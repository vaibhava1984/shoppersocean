import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameShareRedirect from "./GameShareRedirect";

const games = {
  chess: { title: "Ocean Chess", description: "Play Ocean Chess on Shoppers Ocean." },
  "snakes-ladders": { title: "Snake & Ladders", description: "Roll the dice and race to 100 in Snake & Ladders on Shoppers Ocean." },
  "ocean-solitaire": { title: "Ocean Solitaire", description: "Enjoy a classic card challenge with Ocean Solitaire on Shoppers Ocean." },
  "tic-tac-toe": { title: "Tic Tac Toe", description: "Challenge yourself or a friend in Tic Tac Toe on Shoppers Ocean." },
  archery3d: { title: "Archery 3D", description: "Aim carefully and hit the targets in Archery 3D on Shoppers Ocean." },
  "ocean-carrom": { title: "Ocean Carrom", description: "Aim, strike and pocket the coins in Ocean Carrom on Shoppers Ocean." },
  "urban-rider-final": { title: "Urban Rider", description: "Ride through a 3D city, weave through traffic and perform stunts in Urban Rider on Shoppers Ocean." },
} as const;

type GameId = keyof typeof games;

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const { game } = await params;
  if (!(game in games)) return { title: "Game not found | Shoppers Ocean" };
  const id = game as GameId;
  const item = games[id];
  const url = `https://shoppersocean.com/games/${id}`;
  const image = `https://shoppersocean.com/api/game-share-image/${id}?v=4`;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "Shoppers Ocean",
      title: `${item.title} | Shoppers Ocean`,
      description: item.description,
      images: [{ url: image, width: 1200, height: 630, type: "image/png", alt: `${item.title} game preview on Shoppers Ocean` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Shoppers Ocean`,
      description: item.description,
      images: [image],
    },
  };
}

export default async function SharedGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!(game in games)) notFound();
  const id = game as GameId;
  return <GameShareRedirect gameId={id} title={games[id].title} />;
}
