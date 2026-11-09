"use client";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";

declare global { interface Window { THREE?: any; __shoppersThree?: Promise<any>; } }
type Props = { quotaText: string; onPlayed: () => Promise<boolean>; onNewGame: (finished: boolean) => Promise<boolean> };

function getThree(): Promise<any> {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (!window.__shoppersThree) window.__shoppersThree = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error("3D engine failed to initialise"));
    script.onerror = () => reject(new Error("Unable to load the 3D chess engine"));
    document.head.appendChild(script);
  });
  return window.__shoppersThree;
}

export default function Chess3DGame({ quotaText, onPlayed, onNewGame }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<any>(null);
  const started = useRef(false);
  const ai = useRef(true);
  const played = useRef(onPlayed);
  const newGame = useRef(onNewGame);
  const [vsAI, setVsAI] = useState(true);
  const [status, setStatus] = useState("White to move");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [captures, setCaptures] = useState({ white: 0, black: 0 });
  useEffect(() => { played.current = onPlayed; }, [onPlayed]);
  useEffect(() => { newGame.current = onNewGame; }, [onNewGame]);
  useEffect(() => { ai.current = vsAI; }, [vsAI]);

  useEffect(() => {
    let dead = false, destroy = () => {};
    const boot = async () => {
      try {
        const T = await getThree();
        if (dead || !host.current) return;
        const chess = new Chess();
        const scene = new T.Scene(); scene.background = new T.Color(0x101827);
        const camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
        const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none;";
        host.current.appendChild(renderer.domElement);
        scene.add(new T.HemisphereLight(0xfff0d8, 0x263247, 1.45));
        const sun = new T.DirectionalLight(0xffe7c2, 1.8); sun.position.set(6, 12, 7); sun.castShadow = true; scene.add(sun);
        const board = new T.Group(), pieces = new T.Group(); scene.add(board, pieces);
        const squareMeshes: Record<string, any> = {}, mats: Record<string, any> = {};
        const base = new T.Mesh(new T.BoxGeometry(8.45, .3, 8.45), new T.MeshStandardMaterial({ color: 0x382317, metalness: .2, roughness: .35 }));
        base.position.y = -.18; base.receiveShadow = true; board.add(base);
        for (let r=0;r<8;r++) for(let c=0;c<8;c++) {
          const sq = String.fromCharCode(97+c)+(8-r), mat = new T.MeshStandardMaterial({ color:(r+c)%2===0?0xe8c99b:0x70452e, roughness:.42, emissive:0x000000 });
          const tile = new T.Mesh(new T.BoxGeometry(1,.075,1),mat); tile.position.set(c-3.5,0,r-3.5); tile.userData.sq=sq; tile.receiveShadow=true; board.add(tile); squareMeshes[sq]=tile; mats[sq]=mat;
        }
        const pieceMesh = (type:string,color:string) => {
          const g = new T.Group(), white=color==="w";
          const m = new T.MeshStandardMaterial({ color:white?0xf5ead5:0x202a39, roughness:.27, metalness:white?.12:.3 });
          const gold = new T.MeshStandardMaterial({ color:white?0xc5a15e:0x9c783f, metalness:.65, roughness:.25 });
          const add=(geo:any,mat:any,y:number,x=0,z=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);};
          add(new T.CylinderGeometry(.29,.36,.12,22),gold,.06);
          if(type==="p"){add(new T.CylinderGeometry(.14,.21,.43,18),m,.37);add(new T.SphereGeometry(.18,18,14),m,.69);}
          if(type==="r"){add(new T.CylinderGeometry(.23,.29,.62,20),m,.43);add(new T.CylinderGeometry(.31,.25,.14,20),gold,.82);for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new T.BoxGeometry(.13,.15,.13),m,.96,Math.cos(a)*.22,Math.sin(a)*.22);}}
          if(type==="n"){add(new T.CylinderGeometry(.18,.28,.36,18),m,.34);add(new T.BoxGeometry(.28,.5,.34),m,.68,0,-.06);add(new T.SphereGeometry(.16,16,12),m,.94,0,-.12);}
          if(type==="b"){add(new T.CylinderGeometry(.16,.29,.58,20),m,.43);add(new T.SphereGeometry(.18,18,14),gold,.82);add(new T.ConeGeometry(.17,.36,18),m,1.05);}
          if(type==="q"||type==="k"){add(new T.CylinderGeometry(.17,.3,.68,22),m,.48);add(new T.CylinderGeometry(.26,.2,.13,20),gold,.9);if(type==="q"){add(new T.SphereGeometry(.1,14,12),gold,1.08);for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new T.SphereGeometry(.065,10,8),gold,1.08,Math.cos(a)*.2,Math.sin(a)*.2);}}else{add(new T.CylinderGeometry(.13,.16,.28,18),m,1.1);add(new T.BoxGeometry(.07,.36,.07),gold,1.35);add(new T.BoxGeometry(.27,.07,.07),gold,1.35);}}
          return g;
        };
        let selected:string|null=null, legal:any[]=[];
        const render=()=>{
          while(pieces.children.length){const child=pieces.children[0];pieces.remove(child);child.traverse((o:any)=>{if(o.geometry)o.geometry.dispose();});}
          const b=chess.board();
          for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p){const mesh=pieceMesh(p.type,p.color);mesh.position.set(c-3.5,.08,r-3.5);pieces.add(mesh);}}
          Object.values(mats).forEach((m:any)=>m.emissive.setHex(0));
          if(selected){mats[selected].emissive.setHex(0x147c55);legal.forEach(x=>mats[x.to].emissive.setHex(0x245caa));}
          const h=chess.history({verbose:true});setHistory(chess.history());
          setCaptures({white:h.filter((x:any)=>x.color==="b"&&x.captured).length,black:h.filter((x:any)=>x.color==="w"&&x.captured).length});
          let s=chess.turn()==="w"?"White to move":"Black to move";
          if(chess.isCheckmate())s="Checkmate — "+(chess.turn()==="w"?"Black":"White")+" wins";
          else if(chess.isStalemate())s="Draw — stalemate";else if(chess.isDraw())s="Draw";else if(chess.isCheck())s+=" · Check!";
          setStatus(s);
        };
        let theta=0,phi=Math.PI/3.2,radius=12.8;
        const cameraSet=()=>{camera.position.set(radius*Math.sin(phi)*Math.sin(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(0,.15,0);};
        cameraSet();
        const ray=new T.Raycaster(), point=new T.Vector2();
        const tone=(capture:boolean)=>{try{const C=window.AudioContext||(window as any).webkitAudioContext;if(!C)return;const ctx=new C(),o=ctx.createOscillator(),v=ctx.createGain();o.frequency.value=capture?430:310;v.gain.setValueAtTime(.07,ctx.currentTime);v.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);o.connect(v);v.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.13);setTimeout(()=>void ctx.close(),250);}catch{}};
        let busyAI=false;
        const aiMove=()=>{if(!ai.current||chess.turn()!=="b"||chess.isGameOver())return;busyAI=true;setBusy(true);setTimeout(()=>{if(dead)return;const list=chess.moves({verbose:true});if(list.length){const m=list[Math.floor(Math.random()*list.length)];chess.move({from:m.from as any,to:m.to as any,promotion:"q"});tone(Boolean(m.captured));render();}busyAI=false;setBusy(false);},420);};
        const tap=async(x:number,y:number)=>{
          if(busyAI||chess.isGameOver()||(ai.current&&chess.turn()==="b"))return;
          const rect=renderer.domElement.getBoundingClientRect();point.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);ray.setFromCamera(point,camera);
          const hits=ray.intersectObjects(Object.values(squareMeshes));if(!hits.length)return;
          const sq=hits[0].object.userData.sq,p=chess.get(sq);
          if(!selected){if(p&&p.color===chess.turn()){selected=sq;legal=chess.moves({square:sq as any,verbose:true});render();}return;}
          const move=legal.find(m=>m.to===sq);
          if(move){
            if(!started.current){const ok=await played.current();if(!ok){selected=null;legal=[];render();return;}started.current=true;}
            const capture=Boolean(chess.get(sq as any));chess.move({from:selected as any,to:sq as any,promotion:"q"});tone(capture);selected=null;legal=[];render();aiMove();
          }else if(p&&p.color===chess.turn()){selected=sq;legal=chess.moves({square:sq,verbose:true});render();}else{selected=null;legal=[];render();}
        };
        let down:{x:number;y:number;drag:boolean;id:number}|null=null;
        const activePointers=new Map<number,{x:number;y:number}>();
        let pinchDistance=0;
        const pd=(e:PointerEvent)=>{if(e.pointerType==="mouse"&&e.button!==0)return;activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activePointers.size===2){const pts=[...activePointers.values()];pinchDistance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);down=null;}else if(activePointers.size===1){down={x:e.clientX,y:e.clientY,drag:false,id:e.pointerId};}renderer.domElement.setPointerCapture?.(e.pointerId);};
        const pm=(e:PointerEvent)=>{if(activePointers.has(e.pointerId))activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activePointers.size>=2){const pts=[...activePointers.values()];const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(pinchDistance>0){radius=Math.max(9.5,Math.min(17,radius-(distance-pinchDistance)*.025));cameraSet();}pinchDistance=distance;return;}if(!down||down.id!==e.pointerId)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>5)down.drag=true;if(down.drag){theta-=dx*.008;phi=Math.max(.22,Math.min(Math.PI/2-.06,phi-dy*.008));cameraSet();down.x=e.clientX;down.y=e.clientY;}};
        const pu=(e:PointerEvent)=>{const was=down?.id===e.pointerId?down:null;activePointers.delete(e.pointerId);if(activePointers.size<2)pinchDistance=0;if(!was)return;const dragged=was.drag;down=null;if(!dragged&&activePointers.size===0)void tap(e.clientX,e.clientY);};
        const wheel=(e:WheelEvent)=>{e.preventDefault();radius=Math.max(9.5,Math.min(17,radius+e.deltaY*.012));cameraSet();};
        renderer.domElement.addEventListener("pointerdown",pd);renderer.domElement.addEventListener("pointermove",pm);renderer.domElement.addEventListener("pointerup",pu);renderer.domElement.addEventListener("pointercancel",pu);renderer.domElement.addEventListener("wheel",wheel,{passive:false});
        const resize=()=>{if(!host.current)return;const w=host.current.clientWidth,h=host.current.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w<520?45:41;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
        const observer=new ResizeObserver(resize);observer.observe(host.current);resize();render();
        let frame=0;const animate=()=>{if(dead)return;frame=requestAnimationFrame(animate);renderer.render(scene,camera);};animate();
        api.current={reset:()=>{chess.reset();selected=null;legal=[];started.current=false;busyAI=false;setBusy(false);render();}};
        destroy=()=>{observer.disconnect();cancelAnimationFrame(frame);renderer.domElement.removeEventListener("pointerdown",pd);renderer.domElement.removeEventListener("pointermove",pm);renderer.domElement.removeEventListener("pointerup",pu);renderer.domElement.removeEventListener("pointercancel",pu);renderer.domElement.removeEventListener("wheel",wheel);renderer.dispose();renderer.domElement.remove();scene.traverse((o:any)=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach((m:any)=>m.dispose());else o.material.dispose();}});api.current=null;};
      } catch(e) { if(!dead)setError(e instanceof Error?e.message:"Unable to start 3D chess."); }
    };
    void boot();return()=>{dead=true;destroy();};
  }, []);

  const restart=async()=>{
    if(busy)return;
    if(started.current&&!await newGame.current(false))return;
    api.current?.reset();started.current=false;setHistory([]);setCaptures({white:0,black:0});setStatus("White to move");
  };
  const toggle=async()=>{
    if(busy)return;
    if(started.current&&!await newGame.current(false))return;
    api.current?.reset();started.current=false;setHistory([]);setCaptures({white:0,black:0});setVsAI(v=>!v);setStatus("White to move");
  };
  return <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[26px] border border-amber-300/40 bg-gradient-to-b from-slate-950 via-slate-900 to-[#171c2c] p-3 text-white shadow-2xl sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black uppercase text-amber-300">♛ Chess</span><span className="truncate text-xs font-semibold text-slate-200" aria-live="polite">{status}</span></div><div className="flex gap-2"><button type="button" onClick={()=>void toggle()} disabled={busy} className="min-h-10 rounded-xl border border-slate-600 bg-slate-800 px-3 text-xs font-bold text-amber-300 disabled:opacity-50">vs AI: {vsAI?"On":"Off"}</button><button type="button" onClick={()=>void restart()} disabled={busy} className="min-h-10 rounded-xl bg-amber-500 px-4 text-xs font-black text-slate-950 disabled:opacity-50">New Game</button></div></div>
    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-400"><span>White captured: {captures.white}</span><span className="text-center text-amber-300">{quotaText}</span><span>Black captured: {captures.black}</span></div>
    <div ref={host} className="mt-2 h-[min(68vh,620px)] min-h-[330px] w-full overflow-hidden rounded-2xl border border-amber-300/25 bg-[#101827] sm:h-[min(70vh,650px)]" />
    {error&&<p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}
    <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400"><span>Tap a piece, then its destination.</span><span>Drag to rotate · scroll to zoom</span></div>
    <div className="mt-3 max-h-24 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2 text-xs text-slate-300">{history.length?history.map((m,i)=><span key={i} className="mr-2 inline-block"><b className="text-amber-300">{i+1}.</b> {m}</span>):"Move history will appear here."}</div>
  </div>;
}
