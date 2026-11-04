"use client";

const backRank = ["♜","♞","♝","♛","♚","♝","♞","♜"];
const files = ["A","B","C","D","E","F","G","H"];

function Piece({ symbol, side }: { symbol: string; side: "light" | "dark" }) {
  return <span aria-hidden="true" className={`chess-piece chess-piece-${side}`}>{symbol}</span>;
}

export default function ChessBoardPreview() {
  return <main className="min-h-screen bg-[#292522] px-3 py-6 sm:px-6 sm:py-10">
    <style jsx global>{`
      .wood-board { width:min(94vw,760px); aspect-ratio:1; padding:clamp(8px,2vw,18px); border:clamp(7px,1.5vw,13px) solid #65391f; border-radius:15px; background:linear-gradient(135deg,#9b6238,#5b301b 45%,#a66c3c); box-shadow:0 18px 45px #0009,inset 0 2px 5px #f7d3a455; }
      .wood-grid { display:grid; grid-template-columns:repeat(8,minmax(0,1fr)); grid-template-rows:repeat(8,minmax(0,1fr)); width:100%;height:100%; overflow:hidden; border:2px solid #d6b98b; }
      .wood-square { display:grid; place-items:center; min-width:0; min-height:0; }
      .wood-light { background:linear-gradient(145deg,#f0dcb4,#d8bb8a); }
      .wood-dark { background:linear-gradient(145deg,#8a5333,#61351f); }
      .chess-piece { display:block; line-height:1; font-family:"DejaVu Sans",serif; font-size:clamp(27px,7.2vw,62px); transform:translateY(-2%); user-select:none; }
      .chess-piece-light { color:#e9bd70; -webkit-text-stroke:1px #7d4a22; text-shadow:0 2px 0 #fff1c0,0 4px 3px #3c241b99; }
      .chess-piece-dark { color:#241b18; -webkit-text-stroke:1px #080605; text-shadow:0 2px 0 #80604b,0 5px 4px #0009; }
      .coord-row { display:grid;grid-template-columns:repeat(8,1fr);text-align:center;color:#f0d8b3;font-weight:700;font-size:clamp(10px,2vw,14px);letter-spacing:.06em;padding:5px 0 0; }
      .coord-side { position:absolute;inset:0 auto 0 0;display:grid;grid-template-rows:repeat(8,1fr);align-items:center;color:#f0d8b3;font-size:clamp(9px,1.7vw,13px);font-weight:700;transform:translateX(-125%); }
      @media(max-width:520px){.wood-board{width:90vw}.chess-piece{font-size:clamp(25px,8.1vw,40px)}}
    `}</style>
    <header className="mx-auto mb-5 max-w-[800px] text-center">
      <p className="text-xs font-bold uppercase tracking-[.28em] text-amber-300">Shoppers Ocean · Classic Chess</p>
      <h1 className="mt-2 text-3xl font-black tracking-wide text-[#f5e6cc] sm:text-4xl">WOODEN CHESS</h1>
      <p className="mt-2 text-sm text-[#d3c1a9]">Traditional walnut and maple board · Staunton-style wooden pieces</p>
    </header>
    <section className="mx-auto w-fit">
      <div className="relative">
        <div className="coord-side">{[8,7,6,5,4,3,2,1].map(n=><span key={n}>{n}</span>)}</div>
        <div className="wood-board">
          <div className="wood-grid" role="img" aria-label="Chess board in the standard starting position, honey-coloured pieces against dark ebony pieces">
            {Array.from({length:64},(_,i)=>{
              const row=Math.floor(i/8), col=i%8;
              const lightSide=row<2;
              const symbol=row===0?backRank[col]:row===1?"♟":row===6?"♟":row===7?backRank[col][0]==="♜"?"♜":backRank[col]:"";
              const pieceSymbol = row===0 || row===7 ? backRank[col] : symbol;
              const isPiece = row<2 || row>5;
              return <div key={i} className={`wood-square ${(row+col)%2===0?"wood-light":"wood-dark"}`}>
                {isPiece && <Piece symbol={pieceSymbol} side={lightSide?"light":"dark"}/>}
              </div>;
            })}
          </div>
        </div>
      </div>
      <div className="coord-row">{files.map(f=><span key={f}>{f}</span>)}</div>
    </section>
    <p className="mx-auto mt-6 max-w-[760px] text-center text-xs leading-5 text-[#cbb9a2]">Design preview only · The two armies use the same traditional piece shapes and proportions; only the wood finish differs.</p>
  </main>;
}
