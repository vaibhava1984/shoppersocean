import { ImageResponse } from "next/og";
import { createElement as h } from "react";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const games: Record<string, { title: string; subtitle: string; from: string; to: string }> = {
  chess: { title: "Ocean Chess", subtitle: "Think ahead. Make your move.", from: "#f59e0b", to: "#7c2d12" },
  "snakes-ladders": { title: "Snake & Ladders", subtitle: "Roll the dice. Race to 100.", from: "#10b981", to: "#155e75" },
  "ocean-solitaire": { title: "Ocean Solitaire", subtitle: "A fresh deal is waiting.", from: "#0d9488", to: "#1e3a8a" },
  "tic-tac-toe": { title: "Tic Tac Toe", subtitle: "Play. Think. Win.", from: "#ec4899", to: "#6d28d9" },
  archery3d: { title: "Archery 3D", subtitle: "Aim true. Hit the target.", from: "#f97316", to: "#1e3a8a" },
  "ocean-carrom": { title: "Ocean Carrom", subtitle: "Aim. Strike. Pocket the coins.", from: "#06b6d4", to: "#92400e" },
};

const div = (style: Record<string, string | number>, ...children: any[]) =>
  h("div", { style }, ...children);

function artwork(game: string) {
  const frame = { display: "flex", width: 330, height: 330, alignItems: "center", justifyContent: "center", borderRadius: 38, background: "rgba(255,255,255,.13)", border: "5px solid rgba(255,255,255,.55)", boxShadow: "0 22px 55px rgba(0,0,0,.25)" };
  if (game === "archery3d") {
    const circle = (size: number, color: string, border?: string) =>
      div({ display: "flex", width: size, height: size, borderRadius: 999, background: color, border: border || "none", alignItems: "center", justifyContent: "center" });
    return div(frame, circle(260, "#f8fafc", "5px solid #0f172a",
      circle(200, "#dc2626", "none",
        circle(140, "#f8fafc", "none",
          circle(82, "#2563eb", "none", circle(32, "#facc15"))))));
  }
  if (game === "ocean-carrom") {
    const coin = (background: string, extra: Record<string, string | number> = {}) =>
      div({ position: "absolute", width: 32, height: 32, borderRadius: 99, background, border: "3px solid #f8fafc", ...extra });
    return div(frame, div({ display: "flex", width: 260, height: 260, borderRadius: 28, background: "#d6a76b", border: "14px solid #633b24", alignItems: "center", justifyContent: "center", position: "relative" },
      div({ display: "flex", width: 155, height: 155, borderRadius: 99, border: "5px solid #633b24", alignItems: "center", justifyContent: "center" },
        div({ display: "flex", width: 48, height: 48, borderRadius: 99, background: "#1e293b", border: "5px solid #f8fafc" })),
      coin("#f8fafc", { top: 45, left: 54 }), coin("#171717", { bottom: 48, right: 48 }), coin("#b91c1c", { top: 47, right: 48 })));
  }
  if (game === "ocean-solitaire") {
    const card = (style: Record<string, string | number>, color: string, text: string) =>
      div({ position: "absolute", width: 140, height: 205, borderRadius: 15, background: color, border: "5px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 88, fontWeight: 900, ...style }, text);
    return div(frame, div({ display: "flex", position: "relative", width: 240, height: 260, alignItems: "center", justifyContent: "center" },
      card({ left: 0, top: 22, transform: "rotate(-12deg)" }, "#e2e8f0", "♠"),
      card({ right: 0, top: 16, transform: "rotate(12deg)" }, "#0f766e", "♦"),
      card({ left: 54, top: 10, color: "#dc2626" }, "#fff", "♥")));
  }
  if (game === "chess") {
    const squares = Array.from({ length: 64 }, (_, i) => {
      const piece = [0, 7, 56, 63].includes(i) ? "♜" : [1, 6, 57, 62].includes(i) ? "♞" : [3, 59].includes(i) ? "♛" : [4, 60].includes(i) ? "♚" : [8, 9, 10, 11, 12, 13, 14, 15, 48, 49, 50, 51, 52, 53, 54, 55].includes(i) ? "♟" : "";
      return h("div", { key: i, style: { display: "flex", width: "12.5%", height: "12.5%", alignItems: "center", justifyContent: "center", background: (Math.floor(i / 8) + i) % 2 ? "#b88955" : "#f4e4c9", color: (Math.floor(i / 8) + i) % 2 ? "#fff" : "#172554", fontSize: 24, fontWeight: 900 } }, piece);
    });
    return div(frame, div({ display: "flex", width: 250, height: 250, flexWrap: "wrap", border: "8px solid #f8fafc", borderRadius: 12, overflow: "hidden" }, ...squares));
  }
  if (game === "snakes-ladders") {
    const cells = Array.from({ length: 25 }, (_, i) =>
      h("div", { key: i, style: { display: "flex", width: "20%", height: "20%", alignItems: "center", justifyContent: "center", background: (Math.floor(i / 5) + i) % 2 ? "#fef3c7" : "#86efac", color: "#164e63", fontSize: 22, fontWeight: 900 } }, String(25 - i)));
    return div(frame, div({ display: "flex", width: 250, height: 250, flexWrap: "wrap", border: "8px solid #fff", borderRadius: 15, overflow: "hidden" }, ...cells));
  }
  const marks = ["✕", "", "○", "", "✕", "", "", "○", "✕"];
  const cells = marks.map((mark, i) => h("div", { key: i, style: { display: "flex", width: "33.333%", height: "33.333%", alignItems: "center", justifyContent: "center", borderRight: i % 3 !== 2 ? "6px solid white" : "none", borderBottom: i < 6 ? "6px solid white" : "none", color: mark === "✕" ? "#fde68a" : "#bae6fd", fontSize: 76, fontWeight: 900 } }, mark));
  return div(frame, div({ display: "flex", width: 240, height: 240, flexWrap: "wrap", background: "rgba(255,255,255,.1)" }, ...cells));
}

export async function GET(_request: Request, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;
  const item = games[game];
  if (!item) return new Response("Game not found", { status: 404 });
  const content = div(
    { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "space-between", padding: "58px 76px", color: "white", background: `linear-gradient(120deg, ${item.from}, ${item.to} 78%)`, fontFamily: "Arial, sans-serif" },
    div({ display: "flex", flexDirection: "column", width: "62%" },
      div({ display: "flex", fontSize: 26, fontWeight: 900, letterSpacing: 4, color: "#cffafe" }, "SHOPPERS OCEAN"),
      div({ display: "flex", marginTop: 52, fontSize: 66, lineHeight: 1.08, fontWeight: 900 }, item.title),
      div({ display: "flex", marginTop: 28, fontSize: 30, color: "#f8fafc" }, item.subtitle),
      div({ display: "flex", marginTop: 56, fontSize: 22, fontWeight: 800, color: "#e0f2fe" }, "PLAY  •  THINK  •  DISCOVER"),
      div({ display: "flex", marginTop: 24, fontSize: 20, color: "#e2e8f0" }, "shoppersocean.com")),
    artwork(game));
  return new ImageResponse(content, {
    width: 1200,
    height: 630,
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800" },
  });
}
