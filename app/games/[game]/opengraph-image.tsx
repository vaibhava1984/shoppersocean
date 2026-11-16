import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shoppers Ocean game preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const games: Record<string, { title: string; icon: string; subtitle: string; a: string; b: string }> = {
  chess: { title: "Ocean Chess", icon: "♟", subtitle: "Think ahead. Make your move.", a: "#f59e0b", b: "#7c2d12" },
  "snakes-ladders": { title: "Snake & Ladders", icon: "🐍", subtitle: "Roll the dice. Race to 100.", a: "#10b981", b: "#155e75" },
  "ocean-solitaire": { title: "Ocean Solitaire", icon: "🂡", subtitle: "A fresh deal is waiting.", a: "#0d9488", b: "#1e3a8a" },
  "tic-tac-toe": { title: "Tic Tac Toe", icon: "✕ ○", subtitle: "Play. Think. Win.", a: "#ec4899", b: "#6d28d9" },
  archery3d: { title: "Archery 3D", icon: "🏹", subtitle: "Aim true. Hit the target.", a: "#f97316", b: "#1e3a8a" },
  "ocean-carrom": { title: "Ocean Carrom", icon: "◉", subtitle: "Aim. Strike. Pocket the coins.", a: "#06b6d4", b: "#92400e" },
};

export default async function OpenGraphImage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const item = games[game] ?? { title: "Shoppers Ocean Games", icon: "🎮", subtitle: "Play. Connect. Compete.", a: "#0891b2", b: "#312e81" };
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "64px 78px", color: "white", background: `linear-gradient(120deg, ${item.a}, ${item.b} 78%)`, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "67%" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#cffafe" }}>SHOPPERS OCEAN</div>
        <div style={{ display: "flex", marginTop: 52, fontSize: 68, lineHeight: 1.08, fontWeight: 900 }}>{item.title}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 31, color: "#f8fafc" }}>{item.subtitle}</div>
        <div style={{ display: "flex", marginTop: 54, fontSize: 22, fontWeight: 700, color: "#e0f2fe" }}>PLAY • THINK • DISCOVER</div>
      </div>
      <div style={{ display: "flex", width: 300, height: 300, alignItems: "center", justifyContent: "center", borderRadius: 64, border: "8px solid rgba(255,255,255,.65)", background: "rgba(255,255,255,.18)", boxShadow: "0 24px 60px rgba(0,0,0,.25)", fontSize: 150 }}>{item.icon}</div>
    </div>,
    { ...size }
  );
}
