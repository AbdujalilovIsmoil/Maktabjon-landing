'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Atom, Book, BookStack, BookTower, Cap, Earth, Interactive, Pencil, Shield } from './models';
import { S, STAGE_GAP } from '@/lib/scrollState';
import { useTheme } from '@/lib/useTheme';

const M = THREE.MathUtils;
const smooth = (a: number, b: number, x: number) => { const t = M.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** Scrollni kamera yo'liga aylantiradi: har bir "stage" — bitta bo'lim. */
function Rig() {
  const smoothF = useRef(0);
  const frames = useRef(0);
  const sm = useRef({ x: 0, y: 0 });
  useFrame((state, dt) => {
    if (frames.current < 12 && ++frames.current === 12) window.__mjScene = true;
    const els = document.querySelectorAll<HTMLElement>('[data-stage]');
    if (els.length) {
      const vh = window.innerHeight;
      const mid = vh / 2;
      els.forEach((e, i) => { S.h[i] = e.offsetHeight; const cs = getComputedStyle(e); S.pt[i] = parseFloat(cs.paddingTop) || 0; S.pb[i] = parseFloat(cs.paddingBottom) || 0; });
      const centers = Array.from(els).map((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 - mid; });
      let f = 0;
      if (centers[0] < 0) {
        f = centers.length - 1;
        for (let i = 0; i < centers.length - 1; i++) {
          if (centers[i + 1] > 0) { f = i + -centers[i] / (centers[i + 1] - centers[i]); break; }
        }
      }
      const prev = smoothF.current;
      smoothF.current = M.damp(smoothF.current, f, 3.2, dt);
      S.vel = M.damp(S.vel, (smoothF.current - prev) / Math.max(dt, 1e-3), 6, dt);
      S.f = smoothF.current;
      const last = centers[centers.length - 1];
      const fade = 1 - 0.96 * smooth(0.05, 0.6, -last / vh);
      const canvas = document.getElementById('scene');
      if (canvas) canvas.style.opacity = String(fade * (state.size.width <= 860 || state.size.width / state.size.height < 1.1 ? 0.5 : 1));
    }
    sm.current.x = M.damp(sm.current.x, state.pointer.x, 3, dt);
    sm.current.y = M.damp(sm.current.y, state.pointer.y, 3, dt);
    const cam = state.camera;
    cam.position.set(sm.current.x * 0.7, -S.f * STAGE_GAP + sm.current.y * 0.4, 11);
    cam.lookAt(0, -S.f * STAGE_GAP, 0);
    cam.rotation.z += M.clamp(S.vel * 0.02, -0.05, 0.05);
  });
  return null;
}

function Stage({ i, side, k0 = 1, children }: { i: number; side: 1 | -1; k0?: number; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const vw = useThree((s) => s.viewport.width);
  const vhU = useThree((s) => s.viewport.height);
  const size = useThree((s) => s.size);
  useFrame(() => {
    const d = S.f - i;
    const k = 1 - smooth(0, 1.15, Math.abs(d));
    const narrow = size.width <= 860 || size.width / size.height < 1.1;
    const pxU = size.height / vhU;
    const hh = S.h[i] ?? size.height;
    // tor ekranda model matn tepasida (hero'da — pastida) turadi
    const ny = 0;
    g.current.visible = Math.abs(d) < 2;
    g.current.scale.setScalar((0.25 + 0.75 * k) * k0 * (narrow ? M.clamp(vw / 9, 0.38, 0.6) : 1));
    g.current.rotation.y = d * 1.3;
    g.current.rotation.x = d * 0.25;
    g.current.position.x = side * (narrow ? vw * 0.2 : Math.min(3.6, vw * 0.27)) - d * side * 1.2;
    g.current.position.y = -i * STAGE_GAP + ny + d * 1.4;
  });
  return <group ref={g}>{children}</group>;
}

const isDark = () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';

/** Mavzu o'zgarganda yorug'lik silliq o'tadi. */
function Lights() {
  const amb = useRef<THREE.AmbientLight>(null!);
  const dir = useRef<THREE.DirectionalLight>(null!);
  const pt = useRef<THREE.PointLight>(null!);
  const c = useMemo(() => ({ a: new THREE.Color('#ffffff'), b: new THREE.Color('#bcd7ff') }), []);
  useFrame((_, dt) => {
    const d = isDark();
    amb.current.intensity = M.damp(amb.current.intensity, d ? 1.5 : 1.1, 4, dt);
    dir.current.intensity = M.damp(dir.current.intensity, d ? 3.2 : 2.8, 4, dt);
    dir.current.color.lerp(d ? c.b : c.a, 1 - Math.exp(-4 * dt));
    pt.current.intensity = M.damp(pt.current.intensity, d ? 40 : 18, 4, dt);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={1.3} />
      <directionalLight ref={dir} position={[5, 8, 6]} intensity={3} />
      <pointLight ref={pt} position={[-6, -2, 4]} intensity={30} color="#8b5cf6" />
    </>
  );
}

/** Mavzuga qarab ikki modelni almashtiradi: biri kichrayib aylanib ketadi, ikkinchisi kattalashib chiqadi. */
function Swap({ when, children }: { when: 'dark' | 'light'; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const v = useRef<number | null>(null);
  useFrame((_, dt) => {
    const on = (isDark() ? 'dark' : 'light') === when ? 1 : 0;
    v.current = v.current === null ? on : M.damp(v.current, on, 3.5, dt);
    const k = v.current;
    g.current.visible = k > 0.01;
    g.current.scale.setScalar(Math.max(0.0001, k * k * (3 - 2 * k)));
    g.current.rotation.y = (1 - k) * (when === 'dark' ? -2.2 : 2.2);
  });
  return <group ref={g}>{children}</group>;
}

function Props() {
  const items: { p: [number, number, number]; node: React.ReactNode }[] = [
    { p: [-5.5, -3, -2], node: <group rotation={[0.3, 0, 1]}><Pencil /></group> },
    { p: [6, -9, -3], node: <Book color="#8b5cf6" w={1.2} d={0.9} /> },
    { p: [-6.5, -16, -2], node: <group rotation={[0, 0, -0.8]}><Pencil color="#10b981" /></group> },
    { p: [6.4, -23, -3], node: <Book color="#e67e22" w={1.2} d={0.9} /> },
    { p: [-5.8, -30, -2], node: <group rotation={[0.4, 0, 0.7]}><Pencil color="#2f86eb" /></group> },
    { p: [5.8, -36, -3], node: <Book color="#10b981" w={1.2} d={0.9} /> },
  ];
  return <>{items.map((it, i) => (
    <Float key={i} speed={1.4} rotationIntensity={1.6} floatIntensity={1.8} position={it.p}>{it.node}</Float>
  ))}</>;
}

export default function Scene() {
  const theme = useTheme();
  const dark = theme === 'dark';
  return (
    <div id="scene" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <Lights />
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={dark ? 5 : 5} position={[0, 5, 5]} scale={[14, 6, 1]} />
            <Lightformer form="rect" intensity={4} position={[-6, 0, 3]} scale={[4, 8, 1]} color="#8b5cf6" />
            <Lightformer form="rect" intensity={4} position={[6, 0, 3]} scale={[4, 8, 1]} color="#00c2ff" />
          </Environment>
          <Rig />
          <Stage i={0} side={1} k0={0.95}>
            <Swap when="dark"><Earth /></Swap>
            <Swap when="light"><group scale={0.85}><BookTower /></group></Swap>
          </Stage>
          <Stage i={1} side={-1}><Interactive speed={0.25}><Shield /></Interactive></Stage>
          <Stage i={2} side={1}>
            <Interactive><BookStack /></Interactive>
            <group position={[0, 1.9, 0]}><Atom /></group>
          </Stage>
          <Stage i={3} side={-1}><Interactive speed={0.5}><group scale={1.1}><Cap /></group></Interactive></Stage>
          <Props />
          <Sparkles count={260} scale={[22, 56, 10]} position={[0, -18, -2]} size={3.2} speed={0.35} opacity={dark ? 0.9 : 0.7} color={dark ? '#9bd1ff' : '#2f86eb'} />
        </Suspense>
      </Canvas>
    </div>
  );
}
