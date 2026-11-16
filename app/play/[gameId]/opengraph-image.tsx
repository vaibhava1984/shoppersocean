import { ImageResponse } from "next/og";
export const runtime = "edge";
const games: Record<string, { title: string; emoji: string; subtitle: string; colors: [string,string] }> = {
  chess: { title: "Ocean Chess", emoji: "♟", subtitle: "The royal game", colors: ["#0f172a", "#1d4ed8"] },
  "snakes-ladders": { title: "Snake & Ladders", emoji: "🐍", subtitle: "Race to 100", colors: ["#064e3b", "#0891b2"] },
  "ocean-solitaire": { title: "Ocean Solitaire", emoji: "🃏", subtitle: "Clear the cards", colors: ["#1e3a8a", "#a21caf"] },
  "tic-tac-toe": { title: "Tic Tac Toe", emoji: "⭕", subtitle: "A quick strategy duel", colors: ["#6b21a8", "#be185d"] },
  archery3d: { title: "Archery 3D", emoji: "🏹", subtitle: "Aim. Focus. Hit the target.", colors: ["#78350f", "#be123c"] },
  "ocean-carrom": { title: "Ocean Carrom", emoji: "🎯", subtitle: "Aim, strike and pocket the coins", colors: ["#164e63", "#b45309"] },
};
export default async function Image({ params }: { params: Promise<{ gameId: string }> }) {
 const { gameId } = await params; const game = games[gameId] || { title: "Shoppers Ocean Game", emoji: "🎮", subtitle: "Play, Think, Discover & Enjoy", colors: ["#0f172a", "#1d4ed8"] as [string,string] };
 return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "72px", color: "white", background: "linear-gradient(125deg, " + game.colors[0] + ", " + game.colors[1] + ")" }}><div style={{ display: "flex", flexDirection: "column", width: "68%" }}><div style={{ fontSize: 30, fontWeight: 800, color: "#bae6fd", letterSpacing: 5 }}>SHOPPERS OCEAN</div><div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.08, marginTop: 35 }}>{game.title}</div><div style={{ fontSize: 30, marginTop: 28, color: "#e0f2fe" }}>{game.subtitle}</div><div style={{ fontSize: 23, marginTop: 70, fontWeight: 700 }}>Play now • www.shoppersocean.com</div></div><div style={{ display: "flex", width: 300, height: 300, alignItems: "center", justifyContent: "center", borderRadius: 55, background: "rgba(255,255,255,0.15)", border: "4px solid rgba(255,255,255,0.35)", fontSize: 175 }}>{game.emoji}</div></div>, { width: 1200, height: 630 });
}