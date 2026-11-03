"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE_TYPES from "three";

type Mode = "tour" | "balloon";
type Round = {
  mode: Mode; level: number; score: number; arrows: number; wind: number;
  aiming: boolean; aimPoint: THREE_TYPES.Vector3 | null;
  flight: { from: THREE_TYPES.Vector3; to: THREE_TYPES.Vector3; started: number; duration: number; hit: boolean } | null;
  popped: boolean[];
};
type SceneRefs = {
  THREE: typeof import("three"); renderer: THREE_TYPES.WebGLRenderer;
  scene: THREE_TYPES.Scene; camera: THREE_TYPES.PerspectiveCamera;
  bow: THREE_TYPES.Group; string: THREE_TYPES.Line; arrow: THREE_TYPES.Group;
  target: THREE_TYPES.Group; balloons: THREE_TYPES.Group[];
  raycaster: THREE_TYPES.Raycaster; aimPlane: THREE_TYPES.Plane;
};

const initialRound = (): Round => ({
  mode: "tour", level: 1, score: 0, arrows: 5, wind: 0,
  aiming: false, aimPoint: null, flight: null, popped: [false, false, false]
});

export default function ArcheryWorldTour() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRefs | null>(null);
  const roundRef = useRef<Round>(initialRound());
  const [mode, setMode] = useState<Mode>("tour");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(5);
  const [wind, setWind] = useState(0);
  const [message, setMessage] = useState("Pull back to aim, then release to shoot.");
  const [roundEnded, setRoundEnded] = useState(false);
  const [stars, setStars] = useState(0);

  const startRound = useCallback((nextLevel: number, nextMode: Mode) => {
    const next: Round = {
      mode: nextMode, level: nextLevel, score: 0, arrows: 5,
      wind: Math.round((Math.random() * 2 - 1) * Math.min(7, 1 + nextLevel * .22)),
      aiming: false, aimPoint: null, flight: null, popped: [false, false, false]
    };
    roundRef.current = next;
    setMode(nextMode); setLevel(nextLevel); setScore(0); setArrows(5);
    setWind(next.wind); setRoundEnded(false); setStars(0);
    setMessage(nextMode === "tour" ? "WORLD TOUR · STAGE " + nextLevel : "BALLOON CHALLENGE · POP ALL THREE!");
    const refs = sceneRef.current;
    if (refs) {
      refs.arrow.visible = true;
      refs.arrow.position.set(-2.05, 1.45, .25);
      refs.target.position.x = 3.8 + (Math.random() - .5) * .9;
      refs.target.position.y = 2.1 + Math.random() * .5;
      refs.target.scale.setScalar(Math.max(.62, 1 - nextLevel * .009));
      refs.target.visible = nextMode === "tour";
      refs.balloons.forEach((balloon, i) => {
        balloon.visible = nextMode === "balloon";
        balloon.position.set(2.4 + i * 1.15, 2.2 + (i % 2) * .9, -14.5);
        balloon.scale.setScalar(1);
      });
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let animation = 0;
    let resizeObserver: ResizeObserver | null = null;
    let refs: SceneRefs | null = null;
    let onResize: (() => void) | null = null;

    const build = async () => {
      const THREE = await import("three");
      if (disposed || !hostRef.current) return;
      const host = hostRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x9ac9e3);
      scene.fog = new THREE.Fog(0x9ac9e3, 22, 62);
      const camera = new THREE.PerspectiveCamera(54, 1, .1, 100);
      camera.position.set(0, 4.2, 11.5);
      camera.lookAt(0, 2.1, -10);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.touchAction = "none";
      host.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xdaf1ff, 0x52613c, 2.0));
      const sun = new THREE.DirectionalLight(0xffedce, 3.1);
      sun.position.set(-7, 13, 8); sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
      sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
      scene.add(sun);

      const mat = (color: number, roughness = .86, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat(0x607b43));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -.08; ground.receiveShadow = true; scene.add(ground);
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 42), mat(0xb9a477));
      lane.rotation.x = -Math.PI / 2; lane.position.set(0, -.045, -16); lane.receiveShadow = true; scene.add(lane);
      for (let i = 0; i < 9; i++) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(5.1 - i * .25, .025, .055), mat(0xe8d9ad));
        mark.position.set(0, .01, -2 - i * 3.6); scene.add(mark);
      }

      // Layered mountain silhouettes and a sunlit archery range.
      for (let i = 0; i < 14; i++) {
        const mountain = new THREE.Mesh(new THREE.ConeGeometry(3.2 + (i % 3), 5 + (i % 4) * 1.4, 7), mat(i % 2 ? 0x759a88 : 0x91b2a0));
        mountain.position.set(-27 + i * 4.3, 1.5, -35 - (i % 4) * 2);
        mountain.rotation.y = i * .31; mountain.receiveShadow = true; scene.add(mountain);
      }
      for (let i = 0; i < 38; i++) {
        const side = i % 2 ? 1 : -1, z = -2 - (i * 1.91) % 37;
        const x = side * (5.8 + (i % 5) * .8), scale = .48 + ((i * 7) % 8) * .11;
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.09 * scale, .16 * scale, 1.35 * scale, 7), mat(0x69452b));
        trunk.position.y = .67 * scale; trunk.castShadow = true; tree.add(trunk);
        for (let j = 0; j < 3; j++) {
          const crown = new THREE.Mesh(new THREE.ConeGeometry((.72 - j * .12) * scale, 1.35 * scale, 8), mat(j % 2 ? 0x315b3c : 0x426f45));
          crown.position.y = (1.35 + j * .58) * scale; crown.castShadow = true; tree.add(crown);
        }
        tree.position.set(x, 0, z); scene.add(tree);
      }

      // Wooden target stand and layered regulation target face.
      const target = new THREE.Group();
      const wood = mat(0x714b2d);
      for (const x of [-.68, .68]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.8, .13), wood);
        leg.position.set(x, -1.25, -.16); leg.rotation.z = x * .08; leg.castShadow = true; target.add(leg);
      }
      const discColors = [0xf2e8cf, 0xd94b43, 0xf4d34e, 0x3479bb, 0x252c39];
      discColors.forEach((color, i) => {
        const radius = 1.03 - i * .17;
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .055, 64), mat(color, .55));
        disc.rotation.x = Math.PI / 2; disc.position.z = .05 + i * .008; disc.castShadow = true; target.add(disc);
      });
      const bull = new THREE.Mesh(new THREE.SphereGeometry(.055, 16, 12), mat(0xfff1b2, .3, .1));
      bull.position.set(0, 0, .13); target.add(bull);
      target.position.set(3.8, 2.2, -16); scene.add(target);

      // Three animated balloon targets.
      const balloons: THREE.Group[] = [];
      const balloonColors = [0xf04466, 0xffd34e, 0x35bce8];
      for (let i = 0; i < 3; i++) {
        const balloon = new THREE.Group();
        const orb = new THREE.Mesh(new THREE.SphereGeometry(.43, 32, 24), new THREE.MeshStandardMaterial({ color: balloonColors[i], roughness: .22, metalness: .04 }));
        orb.scale.set(.82, 1.12, .82); orb.castShadow = true; balloon.add(orb);
        const knot = new THREE.Mesh(new THREE.ConeGeometry(.09, .18, 12), mat(balloonColors[i]));
        knot.position.y = -.49; knot.rotation.z = Math.PI; balloon.add(knot);
        const string = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, 1.0, 6), mat(0xf2e9d8));
        string.position.y = -.98; balloon.add(string);
        balloon.position.set(2.4 + i * 1.15, 2.2 + (i % 2) * .9, -14.5);
        balloon.visible = false; scene.add(balloon); balloons.push(balloon);
      }

      // First-person wooden bow with curved stave, leather grip and a tensioned string.
      const bow = new THREE.Group();
      const bowCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.2, 0), new THREE.Vector3(.42, -.86, 0),
        new THREE.Vector3(.58, -.3, 0), new THREE.Vector3(.52, .35, 0),
        new THREE.Vector3(.28, .95, 0), new THREE.Vector3(0, 1.2, 0)
      ]);
      const stave = new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 36, .075, 10, false), mat(0x8c552d, .42));
      stave.castShadow = true; bow.add(stave);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(.095, .095, .52, 12), mat(0x38251d));
      grip.position.set(.54, 0, 0); bow.add(grip);
      bow.position.set(-2.5, 1.55, .35); scene.add(bow);
      const stringGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -1.2, .02), new THREE.Vector3(.55, 0, .02), new THREE.Vector3(0, 1.2, .02)
      ]);
      const string = new THREE.Line(stringGeometry, new THREE.LineBasicMaterial({ color: 0xf5e9ce }));
      bow.add(string);

      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 2.05, 8), mat(0x79502e));
      shaft.rotation.z = -Math.PI / 2; shaft.position.x = .03; arrow.add(shaft);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.09, .32, 8), mat(0xd8e3e8, .3, .55));
      tip.rotation.z = -Math.PI / 2; tip.position.x = 1.18; arrow.add(tip);
      const fletch = new THREE.Mesh(new THREE.BoxGeometry(.3, .12, .035), mat(0xd74a45));
      fletch.position.x = -.93; arrow.add(fletch);
      arrow.position.set(-2.05, 1.45, .25); arrow.castShadow = true; scene.add(arrow);

      const raycaster = new THREE.Raycaster();
      const aimPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 15);
      refs = { THREE, renderer, scene, camera, bow, string, arrow, target, balloons, raycaster, aimPlane };
      sceneRef.current = refs;

      onResize = () => {
        const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
        camera.aspect = width / height; camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      onResize();
      resizeObserver = new ResizeObserver(() => onResize?.());
      resizeObserver.observe(host);

      const render = (time: number) => {
        if (disposed || !refs) return;
        const round = roundRef.current;
        // Gentle movement in the distant scenery and floating balloon targets.
        refs.balloons.forEach((balloon, i) => {
          if (balloon.visible && !round.popped[i]) balloon.position.y += Math.sin(time * .0018 + i * 2) * .0009;
        });
        if (round.aiming && round.aimPoint) {
          const pull = round.aimPoint.clone().sub(new THREE.Vector3(-2.05, 1.45, .25));
          const middleX = .55 + pull.x * .18;
          const middleY = pull.y * .18;
          const positions = new Float32Array([0,-1.2,.02, middleX, middleY, .12, 0,1.2,.02]);
          refs.string.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
          refs.string.geometry.attributes.position.needsUpdate = true;
          refs.string.geometry.computeBoundingSphere();
        }
        if (round.flight) {
          const flight = round.flight;
          const t = Math.min(1, (time - flight.started) / flight.duration);
          const p = flight.from.clone().lerp(flight.to, t);
          p.y += Math.sin(t * Math.PI) * 1.65;
          p.x += round.wind * .055 * t * t;
          refs.arrow.position.copy(p);
          const tangent = flight.to.clone().sub(flight.from); tangent.y += Math.cos(t * Math.PI) * 1.65;
          refs.arrow.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent.normalize());
          if (t >= 1 && !flight.hit) {
            flight.hit = true;
            const targetPos = round.mode === "tour" ? refs.target.position : null;
            let points = 0;
            if (round.mode === "tour" && targetPos) {
              const distance = Math.hypot(flight.to.x - targetPos.x, flight.to.y - targetPos.y);
              points = distance < .19 ? 10 : distance < .38 ? 8 : distance < .58 ? 6 : distance < .78 ? 4 : distance < 1.02 ? 2 : 0;
            } else {
              const hitIndex = refs.balloons.findIndex((b, i) => !round.popped[i] && flight.to.distanceTo(b.position) < .62);
              if (hitIndex >= 0) {
                round.popped[hitIndex] = true; refs.balloons[hitIndex].visible = false; points = 10;
              }
            }
            round.score += points; setScore(round.score);
            setMessage(points ? (points === 10 ? "PERFECT HIT · 10 POINTS!" : "NICE SHOT · " + points + " POINTS") : "MISS · Adjust your aim and account for the wind.");
            window.setTimeout(() => {
              if (disposed) return;
              const current = roundRef.current;
              current.flight = null;
              if (current.arrows <= 0) {
                const earned = current.score >= 40 ? 3 : current.score >= 25 ? 2 : current.score >= 10 ? 1 : 0;
                setStars(earned); setRoundEnded(true); setMessage("STAGE COMPLETE");
              } else {
                refs?.arrow.position.set(-2.05, 1.45, .25);
                refs?.arrow.quaternion.identity();
              }
            }, 260);
          }
        }
        renderer.render(scene, camera);
        animation = requestAnimationFrame(render);
      };
      animation = requestAnimationFrame(render);
      startRound(1, "tour");
    };
    void build().catch(error => {
      console.error("Archery 3D scene failed to initialize:", error);
    });
    return () => {
      disposed = true; cancelAnimationFrame(animation); resizeObserver?.disconnect();
      if (refs) {
        refs.scene.traverse(object => {
          const mesh = object as THREE_TYPES.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const material = (mesh as THREE_TYPES.Mesh).material;
          if (material) (Array.isArray(material) ? material : [material]).forEach(item => item.dispose());
        });
        refs.renderer.dispose();
        refs.renderer.domElement.remove();
      }
      sceneRef.current = null;
    };
  }, [startRound]);

  const pointerPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const refs = sceneRef.current;
    if (!refs) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = new refs.THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    refs.raycaster.setFromCamera(point, refs.camera);
    const hit = new refs.THREE.Vector3();
    return refs.raycaster.ray.intersectPlane(refs.aimPlane, hit) ? hit : null;
  };
  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const round = roundRef.current;
    if (round.flight || round.arrows <= 0 || roundEnded) return;
    const point = pointerPosition(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    round.aiming = true; round.aimPoint = point;
  };
  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const round = roundRef.current;
    if (!round.aiming) return;
    const point = pointerPosition(event);
    if (point) round.aimPoint = point;
  };
  const pointerUp = () => {
    const round = roundRef.current, refs = sceneRef.current;
    if (!round.aiming || !round.aimPoint || !refs || round.flight) return;
    round.aiming = false;
    const from = new refs.THREE.Vector3(-2.05, 1.45, .25);
    const to = round.aimPoint.clone();
    const targetZ = -15.5;
    const direction = to.clone().sub(from);
    if (direction.z < 0) {
      const scale = (targetZ - from.z) / direction.z;
      to.copy(from).add(direction.multiplyScalar(scale));
    }
    to.x += round.wind * .12;
    round.flight = { from, to, started: performance.now(), duration: 850, hit: false };
    round.arrows -= 1; setArrows(round.arrows);
    round.aimPoint = null;
    setMessage("ARROW RELEASED · FOLLOW THE SHOT");
  };

  const restart = () => startRound(1, mode);
  return (
    <div className="w-full overflow-hidden rounded-[22px] border border-sky-300/30 bg-[#071321] shadow-[0_24px_70px_rgba(0,0,0,.48)]">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#071522] via-[#102c3d] to-[#163e39] px-4 py-3 text-white sm:px-6">
        <div><div className="text-xl font-black tracking-[.08em]">ARCHERY <span className="text-amber-300">WORLD TOUR</span></div><div className="mt-0.5 text-[9px] font-bold tracking-[.28em] text-sky-200">3D ARCHERY CHALLENGE · NO MUSIC</div></div>
        <div className="flex gap-4 text-center"><div><div className="text-[9px] font-bold tracking-widest text-sky-200">STAGE</div><div className="text-xl font-black text-amber-300">{level.toString().padStart(2, "0")}/50</div></div><div><div className="text-[9px] font-bold tracking-widest text-sky-200">SCORE</div><div className="text-xl font-black">{score}</div></div><div><div className="text-[9px] font-bold tracking-widest text-sky-200">ARROWS</div><div className="text-xl font-black text-emerald-300">{arrows}</div></div></div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-white/10 bg-[#0b1c2a] px-3 py-2.5 text-[10px] font-black tracking-wider text-white sm:px-5">
        <div className="flex gap-2"><button onClick={() => startRound(1, "tour")} className={mode === "tour" ? "rounded-md bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-2 text-slate-950 shadow" : "rounded-md border border-white/20 px-3 py-2 text-slate-200"}>WORLD TOUR</button><button onClick={() => startRound(1, "balloon")} className={mode === "balloon" ? "rounded-md bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-2 text-slate-950 shadow" : "rounded-md border border-white/20 px-3 py-2 text-slate-200"}>BALLOON CHALLENGE</button></div>
        <span className="text-sky-200">WIND {wind > 0 ? "→" : wind < 0 ? "←" : "·"} {Math.abs(wind)}</span>
      </div>
      <div className="relative h-[min(66vh,650px)] min-h-[390px] overflow-hidden sm:min-h-[500px]">
        <div ref={hostRef} className="absolute inset-0" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="3D archery range. Pull back to aim and release to shoot." />
        <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full border border-white/30 bg-[#071522]/85 px-4 py-2 text-center text-[11px] font-extrabold tracking-wide text-white shadow-xl">{message}</div>
        {roundEnded && <div className="absolute inset-0 flex items-center justify-center bg-[#06111c]/80 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#183348] to-[#091723] p-6 text-center text-white shadow-2xl"><div className="text-4xl">🏆</div><div className="mt-2 text-xs font-black tracking-[.3em] text-amber-300">STAGE {level} COMPLETE</div><h3 className="mt-2 text-2xl font-black">Excellent shooting!</h3><div className="my-4 text-3xl tracking-widest text-amber-300">{"★".repeat(stars)}<span className="text-slate-600">{"★".repeat(3 - stars)}</span></div><p className="text-sm text-sky-100">Final score: <b>{score}</b></p><button onClick={() => startRound(Math.min(50, level + 1), mode)} className="mt-5 w-full rounded-lg bg-gradient-to-b from-amber-300 to-orange-500 px-6 py-3 font-black text-slate-950 shadow-lg">NEXT STAGE →</button><button onClick={restart} className="mt-2 w-full rounded-lg border border-white/20 px-6 py-2.5 font-bold text-white">RESTART</button></div></div>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 bg-[#071522] px-4 py-3 text-[10px] font-bold text-slate-400"><span>TOUCH & DRAG TO AIM · RELEASE TO SHOOT · NO MUSIC</span><button onClick={restart} className="rounded-md border border-white/20 px-3 py-2 text-slate-200 hover:bg-white/10">RESTART STAGE</button></footer>
    </div>
  );
}
