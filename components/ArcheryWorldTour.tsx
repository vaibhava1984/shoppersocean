"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Shot = { x: number; y: number; vx: number; vy: number; age: number };
type Mode = "tour" | "balloon";

export default function ArcheryWorldTour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ aim: null as { x: number; y: number } | null, shot: null as Shot | null, arrows: 3, score: 0, level: 1, wind: 0, targetX: 0.78, targetY: 0.48, hits: [] as { x: number; y: number; points: number }[], mode: "tour" as Mode, message: "Pull back from the bow and release to shoot!", lastTime: 0 });
  const [mode, setMode] = useState<Mode>("tour");
  const [level, setLevel] = useState(1);
  const [arrows, setArrows] = useState(3);
  const [score, setScore] = useState(0);
  const [wind, setWind] = useState(0);
  const [message, setMessage] = useState("Pull back from the bow and release to shoot!");
  const [roundOver, setRoundOver] = useState(false);

  const resetRound = useCallback((nextLevel = 1, nextMode: Mode = mode) => {
    const s = stateRef.current;
    s.level = nextLevel; s.mode = nextMode; s.arrows = 3; s.score = 0; s.shot = null; s.aim = null; s.hits = [];
    s.targetX = nextMode === "balloon" ? 0.72 : 0.78; s.targetY = nextMode === "balloon" ? 0.38 : 0.48;
    s.wind = Math.round((Math.random() * 2 - 1) * Math.min(5, nextLevel));
    s.message = nextMode === "balloon" ? "Pop the balloons!" : "New round — aim carefully!";
    setLevel(nextLevel); setArrows(3); setScore(0); setWind(s.wind); setMessage(s.message); setRoundOver(false);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let width = 900, height = 520;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width); height = Math.max(300, rect.height);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const draw = (time: number) => {
      const s = stateRef.current;
      const w = width, h = height, ground = h * 0.82;
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#69c8f0"); sky.addColorStop(.58, "#d7edda"); sky.addColorStop(1, "#f3d69b");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      // Sun and layered distant mountains.
      ctx.fillStyle = "rgba(255,244,190,.9)"; ctx.beginPath(); ctx.arc(w*.82,h*.17,Math.min(w,h)*.065,0,Math.PI*2); ctx.fill();
      const mountain = (color: string, y: number, amp: number, shift: number) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h*y);
        for(let x=0;x<=w+10;x+=10) ctx.lineTo(x,h*y-Math.abs(Math.sin((x+shift)/w*5.2))*h*amp-Math.abs(Math.sin((x+shift)/w*11))*h*amp*.35);
        ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
      };
      mountain("#8cb9aa",.56,.18,0); mountain("#4c8d70",.68,.12,130);
      // Valley floor.
      const floor = ctx.createLinearGradient(0,ground,0,h);floor.addColorStop(0,"#6f9f4c");floor.addColorStop(1,"#264d35");
      ctx.fillStyle=floor;ctx.fillRect(0,ground,w,h-ground);
      for(let i=0;i<16;i++){const x=(i*137+time*.008)%(w+60)-30;ctx.fillStyle=i%2?"#285a3b":"#397148";ctx.beginPath();ctx.moveTo(x,ground+20);ctx.lineTo(x-28,ground-65-(i%3)*12);ctx.lineTo(x+28,ground-65-(i%3)*12);ctx.closePath();ctx.fill();ctx.fillRect(x-4,ground-2,8,24);}
      // Shooting lane.
      ctx.fillStyle="rgba(237,220,169,.45)";ctx.beginPath();ctx.moveTo(w*.16,ground);ctx.lineTo(w*.68,ground);ctx.lineTo(w*.82,h*.58);ctx.lineTo(w*.37,h*.58);ctx.closePath();ctx.fill();
      // Target stand.
      const tx=w*s.targetX, ty=h*s.targetY, radius=Math.min(w,h)*(s.mode==="balloon"?.075:.115);
      if(s.mode==="tour"){
        ctx.strokeStyle="#593b22";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx,ty+radius*.55);ctx.lineTo(tx,ground+4);ctx.moveTo(tx-28,ground+4);ctx.lineTo(tx+28,ground+4);ctx.stroke();
        const colors=["#f7f3df","#e84b3c","#f5d547","#3184d5","#242d3a"];
        colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(tx,ty,radius*(1-i*.19),0,Math.PI*2);ctx.fill();});
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(tx,ty,3,0,Math.PI*2);ctx.fill();
      } else {
        for(let i=0;i<3;i++){const bx=tx+(i-1)*radius*1.35,by=ty+Math.sin(time/450+i)*12;ctx.fillStyle=["#ff5267","#ffcf43","#60d8ff"][i];ctx.beginPath();ctx.ellipse(bx,by,radius*.46,radius*.6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(bx,by+radius*.6);ctx.lineTo(bx,by+radius*.85);ctx.stroke();}
      }
      // Wind ribbon.
      ctx.fillStyle="rgba(255,255,255,.8)";ctx.font="bold 13px system-ui";ctx.fillText("WIND",w*.46,28);
      ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.46,42);ctx.lineTo(w*.46+s.wind*10,42);ctx.stroke();ctx.beginPath();ctx.moveTo(w*.46+s.wind*10,42);ctx.lineTo(w*.46+s.wind*10-(s.wind>=0?8:-8),36);ctx.lineTo(w*.46+s.wind*10-(s.wind>=0?8:-8),48);ctx.closePath();ctx.fillStyle="white";ctx.fill();
      // Bow.
      const bx=w*.14, by=h*.68;
      ctx.strokeStyle="#6b351d";ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.arc(bx+18,by,Math.min(h*.19,95),-Math.PI*.48,Math.PI*.48);ctx.stroke();
      ctx.strokeStyle="#f4e7c7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-5,by-Math.min(h*.17,84));ctx.lineTo(bx+15+(s.aim?.x??0)*.12,by+(s.aim?.y??0)*.12);ctx.lineTo(bx-5,by+Math.min(h*.17,84));ctx.stroke();
      // Aim trajectory guide.
      if(s.aim && !s.shot){const dx=bx-s.aim.x,dy=by-s.aim.y;ctx.setLineDash([5,7]);ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+30,by);ctx.quadraticCurveTo(bx+dx*.8,by+dy*.8,bx+Math.min(w*.62,dx*2.2),by+dy*1.5);ctx.stroke();ctx.setLineDash([]);}
      // Arrow flight.
      if(s.shot){const a=s.shot;a.age+=.016;a.x+=a.vx*.016;a.y+=a.vy*.016;a.vy+=190*.016;a.x+=s.wind*2.2*.016;
        ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(a.vy,a.vx));ctx.strokeStyle="#4a2d1c";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(18,0);ctx.stroke();ctx.fillStyle="#d7e4e8";ctx.beginPath();ctx.moveTo(24,0);ctx.lineTo(13,-5);ctx.lineTo(13,5);ctx.fill();ctx.fillStyle="#e54e46";ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-31,-7);ctx.lineTo(-28,0);ctx.lineTo(-31,7);ctx.fill();ctx.restore();
        if(a.x>tx-radius*1.3&&a.x<tx+radius*1.3&&a.y>ty-radius*1.3&&a.y<ty+radius*1.3){const d=Math.hypot(a.x-tx,a.y-ty);const points=s.mode==="balloon"?10:d<radius*.19?10:d<radius*.38?8:d<radius*.58?6:d<radius*.78?4:2;s.score+=points;s.hits.push({x:a.x,y:a.y,points});s.message=points+" points!";setScore(s.score);setMessage(s.message);s.shot=null;if(s.mode==="balloon"){s.targetX=.68+Math.random()*.18;s.targetY=.28+Math.random()*.24;}}
        else if(a.x>w+30||a.y>h+30||a.age>4){s.shot=null;s.message="Arrow missed — adjust your aim.";setMessage(s.message);}
      }
      s.hits.forEach(hit=>{ctx.fillStyle="#fff";ctx.font="900 18px system-ui";ctx.fillText("+"+hit.points,hit.x,hit.y-12);});
      if(s.aim&&!s.shot){ctx.fillStyle="rgba(8,30,48,.8)";ctx.beginPath();ctx.arc(s.aim.x,s.aim.y,7,0,Math.PI*2);ctx.fill();}
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    const ro=new ResizeObserver(resize);ro.observe(canvas);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();};
  }, []);

  const pointerDown=(e: React.PointerEvent<HTMLCanvasElement>)=>{if(roundOver||stateRef.current.shot||stateRef.current.arrows<=0)return; e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();stateRef.current.aim={x:e.clientX-r.left,y:e.clientY-r.top};};
  const pointerMove=(e: React.PointerEvent<HTMLCanvasElement>)=>{if(!stateRef.current.aim)return;const r=e.currentTarget.getBoundingClientRect();stateRef.current.aim={x:e.clientX-r.left,y:e.clientY-r.top};};
  const pointerUp=()=>{const s=stateRef.current;if(!s.aim||s.shot)return;const canvas=canvasRef.current;if(!canvas)return;const r=canvas.getBoundingClientRect(),bx=r.width*.14,by=r.height*.68;const dx=bx-s.aim.x,dy=by-s.aim.y;const power=Math.min(1.8,Math.max(.35,Math.hypot(dx,dy)/125));s.shot={x:bx+28,y:by,vx:Math.max(190,dx*3.1)*power,vy:dy*3.1*power,age:0};s.aim=null;s.arrows-=1;setArrows(s.arrows);if(s.arrows===0){window.setTimeout(()=>{setRoundOver(true);s.message="Round complete!";setMessage("Round complete!");},1800);}};
  return <div className="w-full overflow-hidden rounded-2xl border border-sky-200 bg-slate-950 shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-950 via-blue-950 to-emerald-950 px-3 py-3 text-white sm:px-5">
      <div><div className="text-lg font-black tracking-wide">🏹 ARCHERY WORLD TOUR</div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-sky-200">Precision • Patience • Power</div></div>
      <div className="flex gap-3 text-center text-xs font-black"><span>LEVEL<strong className="block text-lg text-amber-300">{level}</strong></span><span>SCORE<strong className="block text-lg text-emerald-300">{score}</strong></span><span>ARROWS<strong className="block text-lg text-sky-300">{arrows}</strong></span></div>
    </div>
    <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200">
      <div className="flex gap-2"><button onClick={()=>{setMode("tour");resetRound(1,"tour");}} className={mode==="tour"?"rounded-full bg-amber-400 px-3 py-1 text-slate-950":"rounded-full bg-slate-700 px-3 py-1"}>WORLD TOUR</button><button onClick={()=>{setMode("balloon");resetRound(1,"balloon");}} className={mode==="balloon"?"rounded-full bg-amber-400 px-3 py-1 text-slate-950":"rounded-full bg-slate-700 px-3 py-1"}>BALLOON CHALLENGE</button></div><span>Wind {wind>0?"+":""}{wind}</span>
    </div>
    <div className="relative h-[min(62vh,570px)] min-h-[330px] touch-none sm:min-h-[420px]">
      <canvas ref={canvasRef} className="h-full w-full touch-none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Archery game. Drag backward from the bow and release to shoot." />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-slate-950/75 px-4 py-2 text-center text-xs font-bold text-white shadow-lg">{message}</div>
      {roundOver&&<div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 p-4"><div className="w-full max-w-sm rounded-2xl border border-amber-300/50 bg-slate-900 p-6 text-center text-white shadow-2xl"><div className="text-3xl">🏆</div><h3 className="mt-2 text-2xl font-black">Round Complete!</h3><p className="mt-2 text-slate-300">You scored {score} points.</p><button onClick={()=>resetRound(level+1,mode)} className="mt-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-black text-slate-950">NEXT LEVEL →</button><button onClick={()=>resetRound(1,mode)} className="ml-2 mt-5 rounded-full bg-slate-700 px-5 py-3 font-bold">RESTART</button></div></div>}
    </div>
    <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-[11px] font-semibold text-slate-400"><span>Touch and drag to aim • Release to fire</span><button onClick={()=>resetRound(level,mode)} className="rounded-full border border-slate-600 px-3 py-1.5 text-slate-200">Restart round</button></div>
  </div>;
}
