'use client';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const M = THREE.MathUtils;
const N = 40;
const DUR = 3.6;

/** Sayt ochilganda (va yuklash bo'limiga kelganda) ekran bo'ylab uchib o'tadigan raketa. */
export default function Rocket() {
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);
  const root = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const flame = useRef<THREE.Group>(null!);
  const puffs = useRef<(THREE.Mesh | null)[]>([]);
  const st = useRef({
    t: -1, mirror: 1, emit: 0, idx: 0,
    life: new Float32Array(N).fill(9), p0: new THREE.Vector3(), p1: new THREE.Vector3(), p2: new THREE.Vector3(),
  });
  const tmp = useRef({ pos: new THREE.Vector3(), tan: new THREE.Vector3() });
  const dims = useRef({ W: 0, H: 0 });
  dims.current = { W: vw / 2, H: vh / 2 };

  useEffect(() => {
    const go = () => {
      const s = st.current; if (s.t >= 0) return;
      const { W, H } = dims.current;
      s.mirror = Math.random() < 0.5 ? 1 : -1;
      s.p0.set(-s.mirror * (W + 1.8), -H - 0.8, 0);
      s.p1.set(s.mirror * W * 0.15, -H * 0.8, 0);
      s.p2.set(s.mirror * (W + 1.8), H + 1.2, 0);
      s.t = 0;
    };
    let id: ReturnType<typeof setTimeout> | undefined;
    const arm = () => { id = setTimeout(go, 1100); };
    if (window.__mjLoaded) arm(); else window.addEventListener('mj:loaded', arm, { once: true });
    window.addEventListener('mj:rocket', go);
    return () => { clearTimeout(id); window.removeEventListener('mj:loaded', arm); window.removeEventListener('mj:rocket', go); };
  }, []);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const s = st.current; const { pos, tan } = tmp.current;
    if (s.t >= 0) {
      s.t += dt;
      const u = M.smootherstep(Math.min(1, s.t / DUR), 0, 1) * 0.7 + Math.min(1, s.t / DUR) * 0.3;
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      pos.set(0, 0, 0).addScaledVector(s.p0, a).addScaledVector(s.p1, b).addScaledVector(s.p2, c);
      tan.set(0, 0, 0).addScaledVector(s.p1.clone().sub(s.p0), 2 * (1 - u)).addScaledVector(s.p2.clone().sub(s.p1), 2 * u);
      root.current.visible = true;
      root.current.position.copy(pos);
      root.current.rotation.z = Math.atan2(tan.y, tan.x) - Math.PI / 2;
      spin.current.rotation.y += dt * 5;
      flame.current.scale.set(1 + Math.sin(state.clock.elapsedTime * 40) * 0.12, 1 + Math.random() * 0.45, 1);
      s.emit += dt;
      while (s.emit > 0.028) {
        s.emit -= 0.028;
        const i = s.idx++ % N; const m = puffs.current[i]; if (!m) continue;
        const back = tan.clone().normalize().multiplyScalar(-0.85);
        m.position.copy(pos).add(back).add(new THREE.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, 0));
        s.life[i] = 0;
      }
      if (s.t > DUR) { s.t = -1; root.current.visible = false; }
    }
    for (let i = 0; i < N; i++) {
      const m = puffs.current[i]; if (!m) continue;
      if (s.life[i] > 1) { m.visible = false; continue; }
      s.life[i] += dt * 1.15; const k = s.life[i];
      m.visible = true;
      m.scale.setScalar(0.07 + k * 0.26);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - k) * (1 - k) * 0.6;
      mat.color.setRGB(1, 0.75 - k * 0.35, 0.3 + k * 0.5);
    }
  });

  return (
    <>
      <group ref={root} visible={false} scale={0.95}>
        <group ref={spin}>
          <mesh><cylinderGeometry args={[0.28, 0.28, 1.2, 32]} /><meshStandardMaterial color="#f4f7fb" metalness={0.3} roughness={0.3} /></mesh>
          <mesh position={[0, 0.9, 0]}><coneGeometry args={[0.28, 0.65, 32]} /><meshStandardMaterial color="#f72585" metalness={0.2} roughness={0.35} /></mesh>
          <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.295, 0.295, 0.14, 32]} /><meshStandardMaterial color="#2f86eb" /></mesh>
          <mesh position={[0, 0.28, 0.255]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.13, 0.03, 12, 32]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} /></mesh>
          <mesh position={[0, 0.28, 0.25]} scale={[1, 1, 0.5]}><sphereGeometry args={[0.125, 24, 24]} /><meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.8} /></mesh>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
              <mesh position={[0.36, -0.5, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.34, 0.55, 0.05]} /><meshStandardMaterial color="#f72585" roughness={0.4} /></mesh>
            </group>
          ))}
          <mesh position={[0, -0.7, 0]}><cylinderGeometry args={[0.15, 0.22, 0.18, 24]} /><meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} /></mesh>
        </group>
        <group ref={flame} position={[0, -0.8, 0]}>
          <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.8, 20]} /><meshBasicMaterial color="#ff8a1f" transparent opacity={0.9} /></mesh>
          <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.11, 0.5, 20]} /><meshBasicMaterial color="#ffe27a" /></mesh>
        </group>
      </group>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i} ref={(el) => { puffs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[1, 12, 12]} /><meshBasicMaterial transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
