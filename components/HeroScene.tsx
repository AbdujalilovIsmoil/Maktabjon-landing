'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, useTexture } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const PHONES = [
  { src: '/phones/student-2.png', pos: [-1.9, -0.2, -0.8], rot: 0.35, h: 3.9 },
  { src: '/phones/student-1.png', pos: [0, 0.1, 0.4], rot: 0, h: 4.6 },
  { src: '/phones/student-3.png', pos: [1.9, -0.2, -0.8], rot: -0.35, h: 3.9 },
] as const;

function Phone({ src, pos, rot, h }: (typeof PHONES)[number]) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const w = h * (1013 / 2004);
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={1.1}>
      <group position={pos as unknown as [number, number, number]} rotation={[0, rot, 0]}>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

const COLORS = ['#2f86eb', '#8b5cf6', '#10b981', '#e67e22', '#009bf3'];

function Shapes() {
  const items = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      p: [(Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5.5, -2.5 + Math.random() * 3.5] as [number, number, number],
      s: 0.12 + Math.random() * 0.22,
      c: COLORS[i % COLORS.length],
      k: i % 3,
    })),
    [],
  );
  return (
    <>
      {items.map((it, i) => (
        <Float key={i} speed={1 + (i % 4) * 0.4} floatIntensity={2} rotationIntensity={2}>
          <mesh position={it.p} scale={it.s}>
            {it.k === 0 ? <icosahedronGeometry args={[1, 0]} /> : it.k === 1 ? <torusGeometry args={[1, 0.38, 16, 40]} /> : <octahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color={it.c} roughness={0.25} metalness={0.1} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    const scroll = typeof window !== 'undefined' ? window.scrollY / 600 : 0;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, s.pointer.x * 0.35 + scroll * 0.6, 0.06);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -s.pointer.y * 0.15, 0.06);
  });
  return <group ref={g}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 5]} intensity={2} />
      <Environment preset="city" />
      <Rig>
        {PHONES.map((p) => <Phone key={p.src} {...p} />)}
        <Shapes />
      </Rig>
    </Canvas>
  );
}
