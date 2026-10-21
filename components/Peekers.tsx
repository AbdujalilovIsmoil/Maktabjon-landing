'use client';
import { useFrame, useThree } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { robotLock as L } from '@/lib/robotLock';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

const M = THREE.MathUtils;
type Edge = 'top' | 'left' | 'right';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const EDGES: Edge[] = ['top', 'left', 'right'];

/** Ekran chetidan kallasini chiqarib "meni top" deydigan BITTA robot: chiqadi, yo'qoladi, boshqa joydan yana chiqadi. */
function Peeker() {
  const { scene, animations } = useGLTF('/models/robot.glb');
  const obj = useMemo(() => cloneSkinned(scene), [scene]);
  const outer = useRef<THREE.Group>(null!);
  const turn = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const { actions } = useAnimations(animations, body);
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);
  const h = Math.min(1.25, Math.max(0.85, vw * 0.11));
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(obj); const sz = new THREE.Vector3(); box.getSize(sz);
    return { k: h / sz.y, y: -box.min.y };
  }, [obj, h]);
  const s = useRef({ amt: 0, phase: 'wait' as 'wait' | 'show' | 'pop', timer: 4.5, edge: 'top' as Edge, frac: 0.5, hover: false, anim: '', idle: 'No' });

  const play = (n: string) => {
    if (s.current.anim === n) return; const a = actions[n]; if (!a) return;
    actions[s.current.anim]?.fadeOut(0.2); a.reset().fadeIn(0.2).play(); s.current.anim = n;
  };
  useEffect(() => { obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).frustumCulled = false; }); }, [obj]);
  useEffect(() => {
    const onPeek = (e: Event) => {
      const q = s.current; q.edge = ((e as CustomEvent).detail as Edge) ?? 'top'; q.frac = 0.5; q.phase = 'show'; q.timer = 8; L.owner = 'peeker'; play('No');
    };
    window.addEventListener('mj:peek', onPeek);
    return () => window.removeEventListener('mj:peek', onPeek);
  }); // eslint-disable-line

  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05);
    const q = s.current;
    q.timer -= dt;
    if (q.phase === 'wait' && q.amt < 0.05 && L.owner === 'peeker') L.owner = null;
    if (q.phase === 'wait' && q.timer <= 0 && L.owner) q.timer = 0.5;
    else if (q.phase === 'wait' && q.timer <= 0) {
      L.owner = 'peeker';
      const prev = q.edge;
      q.edge = pick(EDGES.filter((e) => e !== prev || Math.random() < 0.25));
      q.frac = rand(0.15, 0.85);
      q.idle = pick(['No', 'Yes', 'Idle', 'No']);
      play(q.idle);
      q.phase = 'show'; q.timer = rand(4, 6.5);
    } else if (q.phase === 'show' && q.timer <= 0) { q.phase = 'wait'; q.timer = rand(2.2, 4.5); }
    else if (q.phase === 'pop' && q.timer <= 0) { q.phase = 'wait'; q.timer = rand(3, 5); }

    const target = q.phase === 'wait' ? 0 : q.phase === 'pop' ? 1.25 : q.hover ? 0.95 : 0.7;
    q.amt = M.damp(q.amt, target, q.phase === 'wait' ? 6 : 4.5, dt);
    const v = h * q.amt, W = vw / 2, H = vh / 2;
    outer.current.visible = q.amt > 0.02;
    if (q.edge === 'top') { outer.current.position.set((q.frac - 0.5) * 2 * W * 0.9, H + h - v, 0); outer.current.rotation.z = Math.PI; }
    else if (q.edge === 'left') { outer.current.position.set(-W - h + v, (q.frac - 0.5) * 2 * H * 0.8, 0); outer.current.rotation.z = -Math.PI / 2; }
    else { outer.current.position.set(W + h - v, (q.frac - 0.5) * 2 * H * 0.8, 0); outer.current.rotation.z = Math.PI / 2; }
    outer.current.rotation.z += Math.sin(st.clock.elapsedTime * 1.6) * 0.1 * Math.min(1, q.amt);
    const look = q.edge === 'top' ? st.pointer.x : st.pointer.y * (q.edge === 'left' ? 1 : -1);
    turn.current.rotation.y = M.damp(turn.current.rotation.y, M.clamp(look, -1, 1) * 0.7 * (q.edge === 'top' ? -1 : 1), 6, dt);
  });

  return (
    <group ref={outer} visible={false}
      onPointerOver={(e) => { e.stopPropagation(); if (s.current.phase !== 'wait') { s.current.hover = true; document.body.style.cursor = 'pointer'; } }}
      onPointerOut={() => { s.current.hover = false; document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); if (s.current.phase === 'wait') return; s.current.phase = 'pop'; s.current.timer = 1.6; play('Wave'); }}>
      <group ref={turn}>
        <group scale={fit.k} position={[0, fit.y * fit.k, 0]}><primitive ref={body} object={obj} /></group>
      </group>
    </group>
  );
}

export default function Peekers() {
  return <Peeker />;
}
