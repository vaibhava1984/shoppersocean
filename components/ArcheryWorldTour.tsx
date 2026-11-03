"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "tour" | "balloon";
type Impact = { x: number; y: number; points: number; born: number };
type Flight = { startX: number; startY: number; endX: number; endY: number; started: number; duration: number; hit: boolean };
type GameState = {
  mode: Mode; level: number; score: number; arrows: number; wind: number;
  aim: { x: number; y: number } | null; flight: Flight | null;
  impacts: Impact[]; targetOffset: number; targetY: number; targetScale: number;
  balloons: { x: number; y: number; popped: boolean; phase: number }[];
  message: string; roundEnded: boolean; lastShot: number;
};

const initialState = (): GameState => ({
  mode: "tour", level: 1, score: 0, arrows: 5, wind: 0,
  aim: null, flight: null, impacts: [], targetOffset: 0, targetY: .48,
  targetScale: 1, balloons: [], message: "Touch the bow, pull back, aim and release.", roundEnded: false, lastShot: 0
});

export default function ArcheryWorldTour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<GameState>(initialState());
  const [mode, setMode] = useState<Mode>("tour");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(5);
  const [wind, setWind] = useState(0);
  const [message, setMessage] = useState(state.current.message);
  const [roundEnded, setRoundEnded] = useState(false);
  const [stars, setStars] = useState(0);

  const announce = (text: string) => { state.current.message = text; setMessage(text); };
  const startRound = useCallback((nextLevel: number, nextMode: Mode) => {
    const s = state.current;
    s.mode = nextMode; s.level = nextLevel; s.score = 0; s.arrows = 5;
    s.wind = Math.round((Math.random() * 2 - 1) * Math.min(7, 1 + nextLevel * .22));
    s.aim = null; s.flight = null; s.impacts = []; s.targetOffset = 0;
    s.targetY = .43 + Math.random() * .12; s.targetScale = Math.max(.56, 1 - nextLevel * .012);
    s.balloons = Array.from({ length: 3 }, (_, i) => ({ x: .73 + i * .065, y: .34 + (i % 2) * .08, popped: false, phase: i * 2 }));
    s.roundEnded = false; s.lastShot = 0;
    announce(nextMode === "tour" ? `WORLD TOUR · STAGE ${nextLevel}` : "BALLOON CHALLENGE · POP ALL THREE!");
    setMode(nextMode); setLevel(nextLevel); setScore(0); setArrows(5); setWind(s.wind); setRoundEnded(false); setStars(0);
  }, []);

  useEffect(() => { startRound(1, "tour"); }, [startRound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, width = 900, height = 520;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width); height = Math.max(300, rect.height);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const roundRect = (x:number,y:number,w:number,h:number,r:number) => {
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
    };
    const draw = (time:number) => {
      const s = state.current, w = width, h = height, horizon = h * .49;
      const sky = ctx.createLinearGradient(0,0,0,horizon);
      sky.addColorStop(0,"#3d86bd"); sky.addColorStop(.56,"#8fc9dd"); sky.addColorStop(1,"#f5d9a2");
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      // Sun, soft clouds and distant mountain ranges create depth.
      const sun=ctx.createRadialGradient(w*.79,h*.17,2,w*.79,h*.17,h*.13);
      sun.addColorStop(0,"rgba(255,249,214,.95)");sun.addColorStop(1,"rgba(255,249,214,0)");
      ctx.fillStyle=sun;ctx.fillRect(w*.64,0,w*.3,h*.34);
      ctx.fillStyle="#fff4d2";ctx.beginPath();ctx.arc(w*.79,h*.17,Math.min(w,h)*.035,0,Math.PI*2);ctx.fill();
      for(let i=0;i<4;i++){
        const cx=((i*.31*w+time*.006*(i%2?1:-1))%(w+180))-90, cy=h*(.13+i*.055);
        ctx.fillStyle="rgba(255,255,255,.24)";ctx.beginPath();ctx.ellipse(cx,cy,48,10,0,0,Math.PI*2);ctx.ellipse(cx+28,cy-5,32,13,0,0,Math.PI*2);ctx.ellipse(cx+52,cy,36,9,0,0,Math.PI*2);ctx.fill();
      }
      const ridge=(color:string,base:number,amp:number,phase:number)=>{
        ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,horizon);
        for(let x=0;x<=w+8;x+=8)ctx.lineTo(x,base-Math.abs(Math.sin(x/w*5+phase))*h*amp-Math.abs(Math.sin(x/w*12+phase))*h*amp*.25);
        ctx.lineTo(w,horizon);ctx.closePath();ctx.fill();
      };
      ridge("#a5c4b4",h*.52,.15,1);ridge("#719a80",h*.59,.11,3);ridge("#456e56",h*.68,.08,0);
      // Perspective shooting range.
      const ground=ctx.createLinearGradient(0,horizon,0,h);ground.addColorStop(0,"#b6a477");ground.addColorStop(.38,"#82965a");ground.addColorStop(1,"#314d32");
      ctx.fillStyle=ground;ctx.fillRect(0,horizon,w,h-horizon);
      ctx.fillStyle="rgba(241,221,174,.52)";ctx.beginPath();ctx.moveTo(w*.41,horizon);ctx.lineTo(w*.57,horizon);ctx.lineTo(w*.91,h);ctx.lineTo(w*.04,h);ctx.closePath();ctx.fill();
      // Perspective lane markers.
      ctx.strokeStyle="rgba(255,244,207,.35)";ctx.lineWidth=2;
      for(let i=1;i<7;i++){const y=horizon+(h-horizon)*i/7;ctx.beginPath();ctx.moveTo(w*.5-(i*13),y);ctx.lineTo(w*.5+(i*13),y);ctx.stroke();}
      // Trees and shrubs at different scales.
      for(let i=0;i<24;i++){
        const x=(i*113+Math.sin(i*7)*31)%w, depth=(i%7)/7, y=horizon+depth*(h-horizon)*.9, scale=.24+depth*.9;
        ctx.fillStyle="#563c2c";ctx.fillRect(x-3*scale,y-32*scale,6*scale,34*scale);
        ctx.fillStyle=i%2?"#315d43":"#3e7049";ctx.beginPath();ctx.arc(x,y-38*scale,17*scale,0,Math.PI*2);ctx.arc(x-11*scale,y-29*scale,12*scale,0,Math.PI*2);ctx.arc(x+12*scale,y-28*scale,13*scale,0,Math.PI*2);ctx.fill();
      }
      // Target position moves gently as levels advance.
      const targetX=w*(.79+s.targetOffset), targetY=h*s.targetY, radius=Math.min(w,h)*.115*s.targetScale;
      if(s.mode==="tour"){
        // Wooden target stand with foot braces and layered 3D-looking target face.
        ctx.strokeStyle="#53341e";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(targetX-radius*.52,targetY+radius*.65);ctx.lineTo(targetX-radius*.66,h*.83);ctx.moveTo(targetX+radius*.52,targetY+radius*.65);ctx.lineTo(targetX+radius*.66,h*.83);ctx.moveTo(targetX-radius*.9,h*.83);ctx.lineTo(targetX+radius*.9,h*.83);ctx.stroke();
        const rings=[["#f4e8c9",1],["#d94b3f",.82],["#f2d044",.64],["#397dc2",.46],["#242c3a",.28]];
        rings.forEach(([color,scale])=>{ctx.fillStyle=String(color);ctx.beginPath();ctx.ellipse(targetX+4,targetY+5,radius*Number(scale),radius*Number(scale)*.96,0,0,Math.PI*2);ctx.fill();});
        ctx.strokeStyle="rgba(255,255,255,.55)";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(targetX,targetY,radius*.99,radius*.95,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(targetX,targetY,3,0,Math.PI*2);ctx.fill();
      } else {
        s.balloons.forEach((b,i)=>{if(b.popped)return;const bx=w*b.x,by=h*(b.y+Math.sin(time/500+b.phase)*.018),br=Math.min(w,h)*.043;
          const g=ctx.createRadialGradient(bx-br*.3,by-br*.4,2,bx,by,br);g.addColorStop(0,"#fff");g.addColorStop(.25,["#ff6d86","#ffdf67","#64dfff"][i]);g.addColorStop(1,["#b51d43","#c18a19","#1474a5"][i]);
          ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(bx,by,br*.78,br,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.moveTo(bx,by+br);ctx.lineTo(bx+2,by+br*1.28);ctx.strokeStyle="#f4e6c9";ctx.stroke();
        });
      }
      // Wind indicator.
      roundRect(w*.405,12,w*.19,42,12);ctx.fillStyle="rgba(9,26,39,.56)";ctx.fill();
      ctx.fillStyle="#d9f4ff";ctx.font="800 10px system-ui";ctx.textAlign="center";ctx.fillText("WIND",w*.5,27);
      ctx.fillStyle="#fff";ctx.font="bold 14px system-ui";ctx.fillText(`${s.wind>0?"→":s.wind<0?"←":"·"} ${Math.abs(s.wind).toFixed(0)}`,w*.5,45);
      // Archer's bow in foreground.
      const bx=w*.145, by=h*.72, bowR=Math.min(h*.2,100);
      ctx.save();ctx.shadowColor="rgba(0,0,0,.35)";ctx.shadowBlur=9;ctx.strokeStyle="#4b2918";ctx.lineWidth=12;ctx.beginPath();ctx.arc(bx+22,by,bowR,-Math.PI*.49,Math.PI*.49);ctx.stroke();
      ctx.strokeStyle="#a96b36";ctx.lineWidth=5;ctx.beginPath();ctx.arc(bx+22,by,bowR,-Math.PI*.49,Math.PI*.49);ctx.stroke();ctx.restore();
      const pull=s.aim?Math.max(-45,Math.min(45,(s.aim.y-by)*.18)):0;
      ctx.strokeStyle="#f4e6c7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-4,by-bowR*.91);ctx.quadraticCurveTo(bx+30+(s.aim? (s.aim.x-bx)*.18:0),by+pull,bx-4,by+bowR*.91);ctx.stroke();
      // Arrow resting on bow / drawn arrow.
      if(!s.flight){const ax=bx+28+(s.aim?(s.aim.x-bx)*.18:0), ay=by+pull;
        ctx.save();ctx.translate(ax,ay);ctx.rotate(s.aim?Math.atan2(by-s.aim.y,bx-s.aim.x)*.16:0);
        ctx.strokeStyle="#5c3822";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(118,0);ctx.stroke();
        ctx.fillStyle="#dce8ec";ctx.beginPath();ctx.moveTo(124,0);ctx.lineTo(110,-5);ctx.lineTo(110,5);ctx.fill();
        ctx.fillStyle="#d64b43";ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-29,-8);ctx.lineTo(-26,0);ctx.lineTo(-29,8);ctx.fill();ctx.restore();
      }
      // Aim guide.
      if(s.aim&&!s.flight){ctx.setLineDash([5,7]);ctx.strokeStyle="rgba(255,255,255,.72)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+45,by+pull);ctx.quadraticCurveTo(w*.43,h*.27,targetX,targetY);ctx.stroke();ctx.setLineDash([]);}
      // Arrow travels along a curved ballistic path toward the target.
      if(s.flight){
        const f=s.flight,t=Math.min(1,(time-f.started)/f.duration),x=f.startX+(f.endX-f.startX)*t+s.wind*1.4*t*t,y=f.startY+(f.endY-f.startY)*t-Math.sin(t*Math.PI)*h*.22;
        const dx=(f.endX-f.startX)+s.wind*2.8*t,dy=(f.endY-f.startY)-Math.cos(t*Math.PI)*h*.22;
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.strokeStyle="#59351e";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(24,0);ctx.stroke();ctx.fillStyle="#e2edf0";ctx.beginPath();ctx.moveTo(29,0);ctx.lineTo(17,-5);ctx.lineTo(17,5);ctx.fill();ctx.fillStyle="#d94c43";ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-32,-7);ctx.lineTo(-28,0);ctx.lineTo(-32,7);ctx.fill();ctx.restore();
        if(t>=1){s.flight=null;}
      }
      // Impact markers and floating score.
      s.impacts=s.impacts.filter(hit=>time-hit.born<1300);
      s.impacts.forEach(hit=>{const alpha=1-(time-hit.born)/1300;ctx.globalAlpha=alpha;ctx.fillStyle="#fff7c7";ctx.font="900 20px system-ui";ctx.textAlign="center";ctx.fillText(`+${hit.points}`,hit.x,hit.y-18-(time-hit.born)*.025);ctx.globalAlpha=1;});
      if(s.aim){ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.aim.x,s.aim.y,10,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(s.aim.x-15,s.aim.y);ctx.lineTo(s.aim.x+15,s.aim.y);ctx.moveTo(s.aim.x,s.aim.y-15);ctx.lineTo(s.aim.x,s.aim.y+15);ctx.stroke();}
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    const ro=new ResizeObserver(resize);ro.observe(canvas);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  }, []);

  const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const s=state.current;if(s.flight||s.roundEnded||s.arrows<=0)return;
    e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();s.aim={x:e.clientX-r.left,y:e.clientY-r.top};
  };
  const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{const s=state.current;if(!s.aim)return;const r=e.currentTarget.getBoundingClientRect();s.aim={x:e.clientX-r.left,y:e.clientY-r.top};};
  const pointerUp=()=>{
    const s=state.current,canvas=canvasRef.current;if(!s.aim||!canvas||s.flight||s.roundEnded)return;
    const r=canvas.getBoundingClientRect(),w=r.width,h=r.height,bx=w*.145,by=h*.72,tx=w*(.79+s.targetOffset),ty=h*s.targetY;
    const pullX=bx-s.aim.x,pullY=by-s.aim.y;
    const angle=Math.atan2(pullY,Math.max(30,pullX)),power=Math.max(.45,Math.min(1.5,Math.hypot(pullX,pullY)/135));
    const spread=(Math.random()-.5)*(.035+(1-power)*.07)+angle*.16;
    const endX=tx+(Math.sin(spread)*h*.18),endY=ty+(Math.cos(spread)*h*.13);
    const balloonIndex=s.mode==="balloon"?s.balloons.findIndex(b=>!b.popped&&Math.abs((b.x*w)-tx)<w): -1;
    s.flight={startX:bx+40,startY:by,endX,endY,started:performance.now(),duration:650+Math.max(0,1-power)*280,hit:false};
    s.arrows-=1;setArrows(s.arrows);s.aim=null;s.lastShot=performance.now();
    window.setTimeout(()=>{
      if(s.mode==="tour"){
        const radius=Math.min(w,h)*.115*s.targetScale,distance=Math.hypot(endX-tx,endY-ty);
        const points=distance<radius*.18?10:distance<radius*.38?8:distance<radius*.58?6:distance<radius*.78?4:distance<radius?2:0;
        if(points){s.score+=points;s.impacts.push({x:tx,y:ty,points,born:performance.now()});setScore(s.score);announce(points===10?"PERFECT TEN!":`NICE SHOT · ${points} POINTS`);}
        else announce("MISS! Adjust your aim and compensate for the wind.");
        s.targetOffset=(Math.random()-.5)*Math.min(.12,.018*s.level);
        s.targetY=.39+Math.random()*.18;
      }else{
        const idx=s.balloons.findIndex(b=>!b.popped&&Math.hypot(endX-b.x*w,endY-b.y*h)<Math.min(w,h)*.075);
        if(idx>=0){s.balloons[idx].popped=true;s.score+=10;setScore(s.score);announce("BALLOON POPPED · +10!");}
        else announce("MISSED! Track the moving balloons.");
      }
      if(s.arrows<=0){
        const earned=s.score>=40?3:s.score>=25?2:s.score>=10?1:0;s.roundEnded=true;
        setStars(earned);setRoundEnded(true);announce("STAGE COMPLETE");
      }
    },950);
  };

  const restart=()=>startRound(1,mode);
  return <div className="w-full overflow-hidden rounded-[22px] border border-sky-300/30 bg-[#071321] shadow-[0_24px_70px_rgba(0,0,0,.48)]">
    <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#071522] via-[#102c3d] to-[#163e39] px-4 py-3 text-white sm:px-6">
      <div><div className="text-xl font-black tracking-[.08em]">ARCHERY <span className="text-amber-300">WORLD TOUR</span></div><div className="mt-0.5 text-[9px] font-bold tracking-[.28em] text-sky-200">THE ULTIMATE ARCHERY CHALLENGE</div></div>
      <div className="flex gap-4 text-center"><div><div className="text-[9px] font-bold tracking-widest text-sky-200">STAGE</div><div className="text-xl font-black text-amber-300">{level.toString().padStart(2,"0")}/50</div></div><div><div className="text-[9px] font-bold tracking-widest text-sky-200">SCORE</div><div className="text-xl font-black">{score}</div></div><div><div className="text-[9px] font-bold tracking-widest text-sky-200">ARROWS</div><div className="text-xl font-black text-emerald-300">{arrows}</div></div></div>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-2 border-y border-white/10 bg-[#0b1c2a] px-3 py-2.5 text-[10px] font-black tracking-wider text-white sm:px-5">
      <div className="flex gap-2"><button onClick={()=>startRound(1,"tour")} className={mode==="tour"?"rounded-md bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-2 text-slate-950 shadow":"rounded-md border border-white/20 px-3 py-2 text-slate-200"}>WORLD TOUR</button><button onClick={()=>startRound(1,"balloon")} className={mode==="balloon"?"rounded-md bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-2 text-slate-950 shadow":"rounded-md border border-white/20 px-3 py-2 text-slate-200"}>BALLOON CHALLENGE</button></div>
      <span className="text-sky-200">WIND {wind>0?"→":wind<0?"←":"·"} {Math.abs(wind).toFixed(0)}</span>
    </div>
    <div className="relative h-[min(66vh,650px)] min-h-[370px] overflow-hidden sm:min-h-[480px]">
      <canvas ref={canvasRef} className="h-full w-full touch-none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Archery game. Touch and drag to aim, then release to shoot." />
      <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full border border-white/30 bg-[#071522]/85 px-4 py-2 text-center text-[11px] font-extrabold tracking-wide text-white shadow-xl">{message}</div>
      {roundEnded&&<div className="absolute inset-0 flex items-center justify-center bg-[#06111c]/80 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#183348] to-[#091723] p-6 text-center text-white shadow-2xl"><div className="text-4xl">🏆</div><div className="mt-2 text-xs font-black tracking-[.3em] text-amber-300">STAGE {level} COMPLETE</div><h3 className="mt-2 text-2xl font-black">Excellent shooting!</h3><div className="my-4 text-3xl tracking-widest text-amber-300">{"★".repeat(stars)}<span className="text-slate-600">{"★".repeat(3-stars)}</span></div><p className="text-sm text-sky-100">Final score: <b>{score}</b></p><button onClick={()=>startRound(Math.min(50,level+1),mode)} className="mt-5 w-full rounded-lg bg-gradient-to-b from-amber-300 to-orange-500 px-6 py-3 font-black text-slate-950 shadow-lg">NEXT STAGE →</button><button onClick={restart} className="mt-2 w-full rounded-lg border border-white/20 px-6 py-2.5 font-bold text-white">RESTART</button></div></div>}
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-2 bg-[#071522] px-4 py-3 text-[10px] font-bold text-slate-400"><span>TOUCH & DRAG TO AIM · RELEASE TO SHOOT</span><button onClick={restart} className="rounded-md border border-white/20 px-3 py-2 text-slate-200 hover:bg-white/10">RESTART STAGE</button></footer>
  </div>;
}
