import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shoppers Ocean — One Destination. Endless Ways to Enjoy.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 76, color: "white", background: "linear-gradient(125deg, #071b45 0%, #123b83 48%, #087f9c 100%)", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#67e8f9,#60a5fa)", color: "#082f49", fontSize: 48, fontWeight: 900 }}>S</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 27, fontWeight: 700, letterSpacing: 1 }}>SHOPPERS OCEAN<span style={{ fontSize: 17, color: "#bae6fd", fontWeight: 500, marginTop: 5 }}>DISCOVER MORE. ENJOY MORE.</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 900, letterSpacing: -2 }}>One Destination.<br/>Endless Ways to Enjoy.</div>
        <div style={{ display: "flex", gap: 15, marginTop: 34, fontSize: 23, color: "#e0f2fe" }}>
          <span> DIGITAL FLIPBOOKS </span><span>•</span><span> GAMES </span><span>•</span><span> QUIZZES </span><span>•</span><span> LEARNING </span>
        </div>
      </div>
      <div style={{ fontSize: 20, color: "#bae6fd", letterSpacing: 2 }}>www.shoppersocean.com</div>
    </div>,
    { ...size }
  );
}
