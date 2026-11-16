import { ImageResponse } from "next/og";

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

function GameArtwork({ game }: { game: string }) {
  const frame = { display: "flex", width: 330, height: 330, alignItems: "center", justifyContent: "center", borderRadius: 38, background: "rgba(255,255,255,.13)", border: "5px solid rgba(255,255,255,.55)", boxShadow: "0 22px 55px rgba(0,0,0,.25)" } as const;
  if (game === "ocean-carrom") return <div style={frame}><div style={{ display:"flex", width:260, height:260, borderRadius:28, background:"#d6a76b", border:"14px solid #633b24", alignItems:"center", justifyContent:"center", position:"relative" }}><div style={{ display:"flex", width:155, height:155, borderRadius:100, border:"5px solid #633b24", alignItems:"center", justifyContent:"center" }}><div style={{ display:"flex", width:48, height:48, borderRadius:50, background:"#1e293b", border:"5px solid #f8fafc" }}/></div><div style={{ position:"absolute", top:45, left:54, width:30, height:30, borderRadius:50, background:"#f8fafc", border:"3px solid #64748b" }}/><div style={{ position:"absolute", bottom:48, right:48, width:32, height:32, borderRadius:50, background:"#171717", border:"3px solid #f8fafc" }}/><div style={{ position:"absolute", top:47, right:48, width:30, height:30, borderRadius:50, background:"#b91c1c", border:"3px solid #f8fafc" }}/></div></div>;
  if (game === "archery3d") return <div style={frame}><div style={{ display:"flex", width:250, height:250, borderRadius:200, background:"#f8fafc", border:"5px solid #0f172a", alignItems:"center", justifyContent:"center" }}><div style={{ display:"flex", width:195, height:195, borderRadius:200, background:"#dc2626", alignItems:"center", justifyContent:"center" }}><div style={{ display:"flex", width:140, height:140, borderRadius:200, background:"#f8fafc", alignItems:"center", justifyContent:"center" }}><div style={{ display:"flex", width:82, height:82, borderRadius:200, background:"#2563eb", alignItems:"center", justifyContent:"center" }}><div style={{ display:"flex", width:32, height:32, borderRadius:50, background:"#facc15" }}/></div></div></div></div>;
  if (game === "ocean-solitaire") return <div style={frame}><div style={{ display:"flex", position:"relative", width:240, height:260, alignItems:"center", justifyContent:"center" }}><div style={{ position:"absolute", left:0, top:22, width:140, height:205, borderRadius:15, background:"#e2e8f0", border:"5px solid white", transform:"rotate(-12deg)" }}/><div style={{ position:"absolute", right:0, top:16, width:140, height:205, borderRadius:15, background:"#0f766e", border:"5px solid white", transform:"rotate(12deg)" }}/><div style={{ position:"absolute", left:54, top:10, width:140, height:205, borderRadius:15, background:"#fff", border:"5px solid #dbeafe", display:"flex", alignItems:"center", justifyContent:"center", color:"#dc2626", fontSize:88, fontWeight:900 }}>♥</div></div></div>;
  if (game === "chess") return <div style={frame}><div style={{ display:"flex", width:250, height:250, flexWrap:"wrap", border:"8px solid #f8fafc", borderRadius:12, overflow:"hidden" }}>{Array.from({length:64},(_,i)=><div key={i} style={{ display:"flex", width:"12.5%", height:"12.5%", alignItems:"center", justifyContent:"center", background:(Math.floor(i/8)+i)%2?"#b88955":"#f4e4c9", color:(Math.floor(i/8)+i)%2?"#fff":"#172554", fontSize:24, fontWeight:900 }}>{[0,7,56,63].includes(i)?"♜":[1,6,57,62].includes(i)?"♞":[3,59].includes(i)?"♛":[4,60].includes(i)?"♚":[8,9,10,11,12,13,14,15,48,49,50,51,52,53,54,55].includes(i)?"♟":""}</div>)}</div></div>;
  if (game === "snakes-ladders") return <div style={frame}><div style={{ display:"flex", width:250, height:250, flexWrap:"wrap", border:"8px solid #fff", borderRadius:15, overflow:"hidden" }}>{Array.from({length:25},(_,i)=><div key={i} style={{ display:"flex", width:"20%", height:"20%", alignItems:"center", justifyContent:"center", background:(Math.floor(i/5)+i)%2?"#fef3c7":"#86efac", color:"#164e63", fontSize:22, fontWeight:900 }}>{25-i}</div>)}</div></div>;
  return <div style={frame}><div style={{ display:"flex", width:240, height:240, flexWrap:"wrap", background:"rgba(255,255,255,.1)" }}>{["✕","","○","","✕","","","○","✕"].map((v,i)=><div key={i} style={{ display:"flex", width:"33.333%", height:"33.333%", alignItems:"center", justifyContent:"center", borderRight:i%3!==2?"6px solid white":"none", borderBottom:i<6?"6px solid white":"none", color:v==="✕"?"#fde68a":"#bae6fd", fontSize:76, fontWeight:900 }}>{v}</div>)}</div></div>;
}

export async function GET(_request: Request, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;
  const item = games[game];
  if (!item) return new Response("Game not found", { status: 404 });
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"58px 76px", color:"white", background:`linear-gradient(120deg, ${item.from}, ${item.to} 78%)`, fontFamily:"Arial, sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", width:"62%" }}>
        <div style={{ display:"flex", fontSize:26, fontWeight:900, letterSpacing:4, color:"#cffafe" }}>SHOPPERS OCEAN</div>
        <div style={{ display:"flex", marginTop:52, fontSize:66, lineHeight:1.08, fontWeight:900 }}>{item.title}</div>
        <div style={{ display:"flex", marginTop:28, fontSize:30, color:"#f8fafc" }}>{item.subtitle}</div>
        <div style={{ display:"flex", marginTop:56, fontSize:22, fontWeight:800, color:"#e0f2fe" }}>PLAY  •  THINK  •  DISCOVER</div>
        <div style={{ display:"flex", marginTop:24, fontSize:20, color:"#e2e8f0" }}>shoppersocean.com</div>
      </div>
      <GameArtwork game={game} />
    </div>,
    { width:1200, height:630, headers:{ "Cache-Control":"public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800" } }
  );
}
