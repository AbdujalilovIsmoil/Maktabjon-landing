'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Cap } from './models';
import { robotLock as L } from '@/lib/robotLock';
import Rocket from './Rocket';
import Peekers from './Peekers';

const M = THREE.MathUtils;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const EMOTES = ['Wave', 'Dance', 'ThumbsUp', 'Jump', 'Yes', 'No', 'Punch'];
const HALF = 1.0; // ~57°: yurganda ham yuz ko'rinib turadi

type Step = {
  d: number; anim: string; ry?: number;
  from?: { x?: number; y?: number }; to?: { x?: number; y?: number };
  ease?: 'lin' | 'in' | 'out'; sc?: number;
};
const EASE = { lin: (t: number) => t, in: (t: number) => t * t, out: (t: number) => 1 - (1 - t) * (1 - t) };

function giantAct(W: number, H: number): Step[] {
  const GS = Math.min(2.7, (H * 2 * 0.62) / Math.min(1.45, Math.max(0.9, W * 2 * 0.14)));
  const dir = Math.random() < 0.5 ? 1 : -1, sx = -dir * (W + 3.2), ex = dir * (W + 3.2), mid = rand(-W * 0.25, W * 0.25);
  const sp = 2.3;
  return [
    { d: Math.abs(mid - sx) / sp, anim: 'Walking', ry: dir * HALF, sc: GS, from: { x: sx }, to: { x: mid } },
    { d: 2.4, anim: pick(['Wave', 'ThumbsUp', 'Yes']), ry: 0, sc: GS },
    { d: Math.abs(ex - mid) / sp, anim: 'Walking', ry: dir * HALF, sc: GS, to: { x: ex } },
  ];
}

/** Ekranda turli joydan chiqib, turli qiliqlar qiladigan sahnalar. */
function makeAct(W: number, H: number, forced?: string): Step[] {
  const floor = -H + 0.06;
  const dir = Math.random() < 0.5 ? 1 : -1;
  const kind = forced ?? pick(['walk', 'walk', 'peek', 'side', 'drop', 'giant']);
  if (kind === 'giant') return giantAct(W, H).map((x, i) => (i === 0 ? { ...x, from: { x: x.from!.x, y: floor } } : x));

  if (kind === 'walk') {
    const sx = -dir * (W + 1), ex = dir * (W + 1), stop = rand(-W * 0.55, W * 0.55);
    return [
      { d: Math.abs(stop - sx) / 1.5, anim: 'Walking', ry: dir * HALF, from: { x: sx, y: floor }, to: { x: stop, y: floor } },
      { d: 2.6, anim: pick(EMOTES), ry: 0 },
      { d: 2.2, anim: pick(EMOTES), ry: 0 },
      { d: Math.abs(ex - stop) / 2.8, anim: 'Running', ry: dir * HALF, to: { x: ex } },
    ];
  }
  if (kind === 'peek') {
    const x = rand(-W * 0.8, W * 0.8);
    return [
      { d: 0.55, anim: 'Idle', ry: 0, from: { x, y: floor - 2.2 }, to: { y: floor }, ease: 'out' },
      { d: 2.8, anim: pick(EMOTES) },
      { d: 2.2, anim: pick(EMOTES) },
      { d: 0.5, anim: 'Idle', to: { y: floor - 2.2 }, ease: 'in' },
    ];
  }
  if (kind === 'side') {
    const y = rand(-H * 0.45, H * 0.5), edge = dir * (W + 1.3), inX = dir * (W - 0.45);
    return [
      { d: 0.6, anim: 'Idle', ry: -dir * 0.7, from: { x: edge, y }, to: { x: inX }, ease: 'out' },
      { d: 3, anim: pick(['Wave', 'Yes', 'ThumbsUp', 'Dance']) },
      { d: 0.55, anim: 'Idle', to: { x: edge }, ease: 'in' },
    ];
  }
  const x = rand(-W * 0.7, W * 0.7), ex = (x > 0 ? 1 : -1) * (W + 1);
  return [
    { d: 0.75, anim: 'Jump', ry: 0, from: { x, y: H + 2.5 }, to: { y: floor }, ease: 'in' },
    { d: 3, anim: pick(['Dance', 'Dance', 'ThumbsUp', 'Wave']) },
    { d: Math.abs(ex - x) / 3, anim: 'Running', ry: (ex > 0 ? 1 : -1) * HALF, to: { x: ex } },
  ];
}

function Robot() {
  const { scene, animations } = useGLTF('/models/robot.glb');
  const root = useRef<THREE.Group>(null!);
  const bot = useRef<THREE.Group>(null!);
  const lift = useRef<THREE.Group>(null!);
  const box = useMemo(() => new THREE.Box3(), []);
  const cap = useRef<THREE.Group>(null!);
  const { actions } = useAnimations(animations, bot);
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);
  const size = Math.min(1.45, Math.max(0.9, vw * 0.14));
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const sz = new THREE.Vector3(); box.getSize(sz);
    return { k: size / sz.y, y: -box.min.y };
  }, [scene, size]);
  const head = useMemo(() => scene.getObjectByName('Head') ?? null, [scene]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const st = useRef({
    queue: [] as Step[], cur: null as Step | null, t: 0, wait: 2.2, anim: '',
    pos: { x: 0, y: -99 }, from: { x: 0, y: 0 }, ry: 0, poke: 0, sc: 1, scT: 1,
  });

  const play = (name: string) => {
    const s = st.current; if (s.anim === name) return;
    const a = actions[name]; if (!a) return;
    actions[s.anim]?.fadeOut(0.25);
    a.reset().fadeIn(0.25).play(); s.anim = name;
  };

  useEffect(() => {
    const onGiant = () => {
      const s = st.current; s.queue = giantAct(vw / 2, vh / 2).map((x, i) => (i === 0 ? { ...x, from: { x: x.from!.x, y: -vh / 2 + 0.12 } } : x));
      s.cur = null; s.wait = rand(8, 12); L.owner = 'mascot';
    };
    const onAct = (e: Event) => {
      const s = st.current; s.queue = makeAct(vw / 2, vh / 2, (e as CustomEvent).detail); s.cur = null; s.wait = rand(8, 12); L.owner = 'mascot';
    };
    window.addEventListener('mj:giant', onGiant);
    window.addEventListener('mj:act', onAct);
    return () => { window.removeEventListener('mj:giant', onGiant); window.removeEventListener('mj:act', onAct); };
  }, [vw, vh]);

  useEffect(() => {
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).frustumCulled = false; });
  }, [scene]);

  useFrame((state, dt) => {
    const s = st.current; const W = vw / 2, H = vh / 2;
    dt = Math.min(dt, 0.05);
    if (!s.cur) {
      if (s.queue.length) {
        s.cur = s.queue.shift()!; s.t = 0;
        s.from = { x: s.cur.from?.x ?? s.pos.x, y: s.cur.from?.y ?? s.pos.y };
        if (s.cur.from) { s.pos.x = s.from.x; s.pos.y = s.from.y; }
        play(s.cur.anim);
      } else {
        if (L.owner === 'mascot') L.owner = null;
        s.wait -= dt;
        if (s.wait <= 0) {
          if (L.owner) s.wait = 0.5;
          else { s.queue = makeAct(W, H); s.wait = rand(5, 10); L.owner = 'mascot'; }
        }
        s.scT = 1; s.sc = 1; root.current.visible = false; return;
      }
    }
    const c = s.cur!;
    s.t += dt;
    const e = EASE[c.ease ?? 'lin'](Math.min(1, s.t / c.d));
    if (c.to?.x !== undefined) s.pos.x = M.lerp(s.from.x, c.to.x, e);
    if (c.to?.y !== undefined) s.pos.y = M.lerp(s.from.y, c.to.y, e);
    if (c.ry !== undefined) s.ry = M.damp(s.ry, c.ry, 7, dt);
    s.scT = c.sc ?? 1;
    s.sc = M.damp(s.sc, s.scT, 4, dt);
    if (s.t >= c.d) s.cur = null;

    s.poke = M.damp(s.poke, 0, 5, dt);
    root.current.visible = true;
    root.current.position.set(s.pos.x, s.pos.y, 0);
    root.current.rotation.y = s.ry;
    root.current.scale.setScalar(s.sc * (1 + s.poke * 0.12));
    root.current.updateMatrixWorld(true);
    if (s.anim !== 'Jump') {
      // haqiqiy (skelet bilan) eng past nuqta — doim yer chizig'ida bo'lsin
      box.setFromObject(bot.current, true);
      const minLocal = (box.min.y - root.current.position.y) / Math.max(root.current.scale.y, 1e-3);
      if (Number.isFinite(minLocal)) lift.current.position.y = M.clamp(lift.current.position.y - minLocal * 0.6, -1.5, 1.5);
      root.current.updateMatrixWorld(true);
    }
    if (head && cap.current) {
      head.getWorldPosition(tmp); root.current.worldToLocal(tmp);
      cap.current.position.set(tmp.x, tmp.y + 0.42, tmp.z);
    }
    void state;
  });

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const s = st.current; const W = vw / 2;
    const dir = s.pos.x >= 0 ? 1 : -1;
    s.poke = 1;
    s.queue = [
      { d: 1.8, anim: pick(['Jump', 'ThumbsUp', 'Dance', 'Yes', 'Punch']), ry: 0, sc: s.scT },
      { d: Math.abs(dir * (W + 1.5) - s.pos.x) / 3, anim: 'Running', ry: dir * HALF, sc: s.scT, to: { x: dir * (W + 1.5 * (s.scT > 1.5 ? 2.2 : 1)) } },
    ];
    s.cur = null; s.wait = rand(6, 10);
  };

  return (
    <group ref={root} visible={false} onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}>
      <group ref={lift}><group scale={fit.k} position={[0, fit.y * fit.k, 0]}><primitive ref={bot} object={scene} /></group></group>
      <group ref={cap} scale={0.22}><Cap /></group>
    </group>
  );
}

export default function Mascot() {
  return (
    <div id="mascot" aria-hidden>
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined} eventPrefix="client">
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 5, 6]} intensity={3} />
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={4} position={[0, 5, 5]} scale={[12, 5, 1]} />
          <Lightformer form="rect" intensity={3} position={[-6, 0, 3]} scale={[4, 8, 1]} color="#8b5cf6" />
        </Environment>
        <Robot />
        <Peekers />
        <Rocket />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/robot.glb');
