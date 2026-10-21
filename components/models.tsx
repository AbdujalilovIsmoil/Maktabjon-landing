'use client';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const M = THREE.MathUtils;

/** Hover'da kattalashadi, bosilganda aylanib ketadi, doim sekin aylanadi. */
export function Interactive({ children, speed = 0.35 }: { children: React.ReactNode; speed?: number }) {
  const g = useRef<THREE.Group>(null!);
  const hov = useRef(false);
  const spin = useRef(0);
  useFrame((_, dt) => {
    g.current.rotation.y += dt * (speed + spin.current);
    spin.current = M.damp(spin.current, 0, 2.2, dt);
    g.current.scale.setScalar(M.damp(g.current.scale.x, hov.current ? 1.14 : 1, 6, dt));
  });
  return (
    <group
      ref={g}
      onPointerOver={(e) => { e.stopPropagation(); hov.current = true; document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { hov.current = false; document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); spin.current = 10; }}
    >
      {children}
    </group>
  );
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
  <meshStandardMaterial color={color} roughness={0.42} metalness={0.04} {...extra} />
);

/* ---------- Bitiruvchi qalpoq ---------- */
export function Cap() {
  return (
    <group rotation={[0.28, 0, 0.05]}>
      <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[3, 0.14, 3]} />{std('#2a4d80', { roughness: 0.35 })}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.95, 1.1, 1.1, 40, 1, true]} />
        <meshStandardMaterial color="#3a6cb0" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.12, 0.12, 0.08, 24]} />{std('#ffc83d')}</mesh>
      <mesh position={[1.08, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 2.1, 8]} />{std('#ffc83d')}</mesh>
      <mesh position={[2.1, 0.2, 0]}><cylinderGeometry args={[0.025, 0.025, 1, 8]} />{std('#ffc83d')}</mesh>
      <mesh position={[2.1, -0.4, 0]}><coneGeometry args={[0.16, 0.45, 16]} />{std('#ffc83d')}</mesh>
    </group>
  );
}

/* ---------- Kitob ---------- */
export function Book({ color = '#2f86eb', position = [0, 0, 0], rotY = 0, w = 1.9, d = 1.35 }: {
  color?: string; position?: [number, number, number]; rotY?: number; w?: number; d?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[w, 0.08, d]} />{std(color)}</mesh>
      <mesh position={[0.04, 0.18, 0]}><boxGeometry args={[w - 0.1, 0.28, d - 0.08]} />{std('#f6f1e4', { roughness: 0.8, metalness: 0 })}</mesh>
      <mesh position={[0, 0.36, 0]}><boxGeometry args={[w, 0.08, d]} />{std(color)}</mesh>
      <mesh position={[-w / 2, 0.18, 0]}><boxGeometry args={[0.1, 0.44, d]} />{std(color)}</mesh>
    </group>
  );
}

export function BookStack() {
  return (
    <group>
      <Book color="#2f86eb" position={[0, -1.1, 0]} rotY={0.1} />
      <Book color="#8b5cf6" position={[0.1, -0.62, 0]} rotY={-0.25} w={1.7} />
      <Book color="#10b981" position={[-0.1, -0.14, 0]} rotY={0.3} w={1.8} />
      <Book color="#e67e22" position={[0.05, 0.34, 0]} rotY={-0.1} w={1.5} d={1.1} />
    </group>
  );
}

/* ---------- Atom ---------- */
function Electron({ radius, speed, tilt, color }: { radius: number; speed: number; tilt: [number, number, number]; color: string }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => { g.current.rotation.z += dt * speed; });
  return (
    <group rotation={tilt}>
      <mesh><torusGeometry args={[radius, 0.012, 8, 96]} /><meshBasicMaterial color={color} transparent opacity={0.55} /></mesh>
      <group ref={g}><mesh position={[radius, 0, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} /></mesh></group>
    </group>
  );
}

export function Atom() {
  return (
    <group>
      <mesh><sphereGeometry args={[0.38, 32, 32]} /><meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.9} /></mesh>
      <Electron radius={1.15} speed={1.6} tilt={[Math.PI / 2.2, 0, 0]} color="#00c2ff" />
      <Electron radius={1.15} speed={-1.3} tilt={[Math.PI / 2.2, 0, Math.PI / 3]} color="#f72585" />
      <Electron radius={1.15} speed={1.9} tilt={[Math.PI / 2.2, 0, -Math.PI / 3]} color="#ffc83d" />
    </group>
  );
}

/* ---------- Globus ---------- */
function useEarthTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const x = c.getContext('2d')!;
    x.fillStyle = '#2f86eb'; x.fillRect(0, 0, 1024, 512);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      x.fillStyle = i % 3 ? '#34c38f' : '#7ed957';
      x.beginPath();
      x.ellipse(rnd() * 1024, 90 + rnd() * 330, 24 + rnd() * 70, 14 + rnd() * 40, rnd() * 3, 0, Math.PI * 2);
      x.fill();
    }
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1;
    for (let i = 0; i <= 16; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 512); x.stroke(); }
    for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(0, i * 64); x.lineTo(1024, i * 64); x.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
}

export function Globe() {
  const tex = useEarthTexture();
  const sat = useRef<THREE.Group>(null!);
  useFrame((_, dt) => { sat.current.rotation.y += dt * 0.9; });
  const pins = [[0.4, 0.5], [2.3, 0.2], [4.1, -0.3]];
  return (
    <group rotation={[0.35, 0, 0.2]}>
      <mesh><sphereGeometry args={[1.5, 64, 64]} /><meshStandardMaterial map={tex} roughness={0.55} /></mesh>
      <mesh><sphereGeometry args={[1.62, 32, 32]} /><meshBasicMaterial color="#7cc4ff" transparent opacity={0.12} side={THREE.BackSide} /></mesh>
      {pins.map(([lon, lat], i) => {
        const r = 1.5;
        const p = new THREE.Vector3(r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
        return (
          <group key={i} position={p} quaternion={q}>
            <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />{std('#ffffff')}</mesh>
            <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={1} /></mesh>
          </group>
        );
      })}
      <group ref={sat} rotation={[0.5, 0, 0.3]}>
        <mesh><torusGeometry args={[2.2, 0.008, 8, 128]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.4} /></mesh>
        <mesh position={[2.2, 0, 0]}><boxGeometry args={[0.22, 0.12, 0.12]} />{std('#ffc83d')}</mesh>
      </group>
    </group>
  );
}

/* ---------- Qalqon + joylashuv belgisi (nazorat) ---------- */
function PinMarker() {
  const ring = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const k = (clock.elapsedTime % 1.6) / 1.6;
    ring.current.scale.setScalar(0.4 + k * 1.6);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - k);
  });
  return (
    <group position={[1.9, -0.9, 0.5]}>
      <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.38, 32, 32]} />{std('#f72585')}</mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.34, 0.8, 32]} />{std('#f72585')}</mesh>
      <mesh position={[0, 0.78, 0.3]}><sphereGeometry args={[0.13, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh ref={ring} position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.5, 48]} /><meshBasicMaterial color="#f72585" transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Shield() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.6); s.lineTo(1.3, 1.15); s.lineTo(1.3, 0.1);
    s.quadraticCurveTo(1.3, -1, 0, -1.7); s.quadraticCurveTo(-1.3, -1, -1.3, 0.1);
    s.lineTo(-1.3, 1.15); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.09, bevelSegments: 4, curveSegments: 24 });
  }, []);
  return (
    <group>
      <mesh geometry={geo} position={[0, 0, -0.15]}><meshStandardMaterial color="#2f7bd1" roughness={0.35} metalness={0.05} /></mesh>
      <mesh position={[-0.28, -0.12, 0.34]} rotation={[0, 0, -0.78]}><boxGeometry args={[0.2, 0.55, 0.12]} />{std('#ffffff', { roughness: 0.2 })}</mesh>
      <mesh position={[0.28, 0.12, 0.34]} rotation={[0, 0, 0.78]}><boxGeometry args={[0.2, 1.1, 0.12]} />{std('#ffffff', { roughness: 0.2 })}</mesh>
      <PinMarker />
    </group>
  );
}

/* ---------- Qalam ---------- */
export function Pencil({ color = '#ffc83d' }: { color?: string }) {
  return (
    <group>
      <mesh><cylinderGeometry args={[0.12, 0.12, 1.6, 6]} />{std(color)}</mesh>
      <mesh position={[0, 0.98, 0]}><coneGeometry args={[0.12, 0.38, 6]} />{std('#f1c99a')}</mesh>
      <mesh position={[0, 1.15, 0]}><coneGeometry args={[0.04, 0.1, 6]} />{std('#222')}</mesh>
      <mesh position={[0, -0.88, 0]}><cylinderGeometry args={[0.125, 0.125, 0.18, 12]} />{std('#f72585')}</mesh>
    </group>
  );
}

/* ---------- Uchqunlar ---------- */
export function Burst({ trigger, origin }: { trigger: number; origin: [number, number, number] }) {
  const N = 56;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const data = useRef(Array.from({ length: N }, () => ({ v: new THREE.Vector3(), t: 9 })));
  const colors = ['#ffd66b', '#00c2ff', '#f72585', '#8b5cf6', '#34d399'];
  const last = useRef(0);
  useFrame((_, dt) => {
    if (trigger !== last.current) {
      last.current = trigger;
      data.current.forEach((d, i) => {
        d.v.set(Math.random() - 0.5, Math.random() * 0.8 + 0.1, Math.random() - 0.5).normalize().multiplyScalar(2.5 + Math.random() * 3);
        d.t = 0;
        refs.current[i]?.position.set(...origin);
      });
    }
    data.current.forEach((d, i) => {
      const m = refs.current[i]; if (!m) return;
      if (d.t > 1.4) { m.visible = false; return; }
      d.t += dt; m.visible = true;
      m.position.addScaledVector(d.v, dt);
      d.v.multiplyScalar(1 - dt * 1.6);
      d.v.y -= dt * 1.2;
      m.scale.setScalar(Math.max(0, 1 - d.t / 1.4) * 0.09);
    });
  });
  return <>{Array.from({ length: N }, (_, i) => (
    <mesh key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
      <icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color={colors[i % colors.length]} />
    </mesh>
  ))}</>;
}



/* ---------- Hero: realistik Yer + bilim orbitalari ---------- */
const ATMOS_VERT = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const ATMOS_FRAG = 'varying vec3 vN; uniform vec3 uColor; uniform float uK; void main(){ float i = pow(max(0.0, 0.68 - dot(vN, vec3(0.0,0.0,1.0))), 3.0) * uK; gl_FragColor = vec4(uColor, 1.0) * i; }';

function Orbiter({ radius, speed, tilt, phase, children }: { radius: number; speed: number; tilt: [number, number, number]; phase: number; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const item = useRef<THREE.Group>(null!);
  useFrame((st, dt) => {
    g.current.rotation.y += dt * speed;
    item.current.rotation.y -= dt * speed;
    item.current.rotation.x = Math.sin(st.clock.elapsedTime * 1.4 + phase) * 0.35;
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.006, 8, 160]} /><meshBasicMaterial color="#9bd1ff" transparent opacity={0.28} /></mesh>
      <group ref={g} rotation={[0, phase, 0]}><group position={[radius, 0, 0]}><group ref={item}>{children}</group></group></group>
    </group>
  );
}

export function Earth() {
  const [day, spec, normal, clouds] = useTexture(['/earth/earth_atmos_2048.jpg', '/earth/earth_specular_2048.jpg', '/earth/earth_normal_2048.jpg', '/earth/earth_clouds_1024.png']);
  day.colorSpace = THREE.SRGBColorSpace; clouds.colorSpace = THREE.SRGBColorSpace;
  [day, spec, normal, clouds].forEach((t) => { t.anisotropy = 8; });
  const root = useRef<THREE.Group>(null!);
  const globe = useRef<THREE.Group>(null!);
  const cl = useRef<THREE.Mesh>(null!);
  const atm = useRef<THREE.ShaderMaterial>(null!);
  const hov = useRef(false);
  const boost = useRef(0);
  const [burst, setBurst] = useState(0);
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#5bb8ff') }, uK: { value: 0.75 } }), []);

  useFrame((st, dt) => {
    boost.current = M.damp(boost.current, 0, 1.6, dt);
    const sp = 0.12 + (hov.current ? 0.25 : 0) + boost.current * 3;
    globe.current.rotation.y += dt * sp;
    cl.current.rotation.y += dt * (sp * 1.25);
    root.current.rotation.y = M.damp(root.current.rotation.y, st.pointer.x * 0.35, 3, dt);
    root.current.rotation.x = M.damp(root.current.rotation.x, 0.25 - st.pointer.y * 0.2, 3, dt);
    root.current.scale.setScalar(M.damp(root.current.scale.x, hov.current ? 1.05 : 1, 5, dt));
    uniforms.uK.value = M.damp(uniforms.uK.value, hov.current ? 1.3 : 0.75, 5, dt);
  });

  return (
    <group
      ref={root}
      onPointerOver={(e) => { e.stopPropagation(); hov.current = true; document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { hov.current = false; document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); boost.current = 1; setBurst((b) => b + 1); }}
    >
      <group ref={globe} rotation={[0, 0, 0.41]}>
        <mesh>
          <sphereGeometry args={[1.8, 96, 96]} />
          <meshPhongMaterial map={day} specularMap={spec} normalMap={normal} normalScale={new THREE.Vector2(0.8, 0.8)} specular={new THREE.Color('#5577aa')} shininess={22} />
        </mesh>
      </group>
      <mesh ref={cl}>
        <sphereGeometry args={[1.84, 96, 96]} />
        <meshPhongMaterial map={clouds} alphaMap={clouds} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh scale={1.13}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <shaderMaterial ref={atm} vertexShader={ATMOS_VERT} fragmentShader={ATMOS_FRAG} uniforms={uniforms} side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </mesh>

      <Orbiter radius={2.75} speed={0.55} tilt={[0.5, 0, 0.35]} phase={0}><group scale={0.2}><Cap /></group></Orbiter>
      <Orbiter radius={3.2} speed={-0.4} tilt={[-0.35, 0, -0.5]} phase={2}><group scale={0.26}><Book color="#f72585" /></group></Orbiter>
      <Orbiter radius={2.45} speed={0.8} tilt={[1.1, 0, 0.1]} phase={4}><group scale={0.34}><Atom /></group></Orbiter>
      <Orbiter radius={3.55} speed={0.32} tilt={[0.15, 0, 0.7]} phase={1}><group scale={0.36} rotation={[0, 0, 0.8]}><Pencil /></group></Orbiter>
      <Burst trigger={burst} origin={[0, 0, 2]} />
    </group>
  );
}

/* ---------- Hero (light rejim): kitoblar minorasi + qalpoq + orbitalar ---------- */
export function BookTower() {
  const root = useRef<THREE.Group>(null!);
  const cap = useRef<THREE.Group>(null!);
  const hov = useRef(false);
  const boost = useRef(0);
  const [burst, setBurst] = useState(0);
  useFrame((st, dt) => {
    boost.current = M.damp(boost.current, 0, 1.5, dt);
    const t = st.clock.elapsedTime;
    root.current.rotation.y += dt * (0.25 + (hov.current ? 0.35 : 0) + boost.current * 5);
    root.current.rotation.x = M.damp(root.current.rotation.x, 0.12 - st.pointer.y * 0.18, 3, dt);
    root.current.scale.setScalar(M.damp(root.current.scale.x, hov.current ? 1.06 : 1, 5, dt));
    cap.current.position.y = 2.15 + Math.sin(t * 1.4) * 0.14 + boost.current * 0.8;
    cap.current.rotation.y = t * 0.8;
  });
  return (
    <group
      ref={root}
      onPointerOver={(e) => { e.stopPropagation(); hov.current = true; document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { hov.current = false; document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); boost.current = 1; setBurst((b) => b + 1); }}
    >
      <group position={[0, -0.5, 0]} scale={1.35}><BookStack /></group>
      <group ref={cap} scale={0.5}><Cap /></group>
      <Orbiter radius={2.9} speed={0.7} tilt={[0.45, 0, 0.3]} phase={0}><group scale={0.4}><Atom /></group></Orbiter>
      <Orbiter radius={3.3} speed={-0.5} tilt={[-0.3, 0, -0.45]} phase={2}><group scale={0.4} rotation={[0, 0, 0.8]}><Pencil /></group></Orbiter>
      <Orbiter radius={3.6} speed={0.35} tilt={[0.2, 0, 0.6]} phase={4}><group scale={0.3}><Book color="#f72585" /></group></Orbiter>
      <Burst trigger={burst} origin={[0, 2, 1]} />
    </group>
  );
}
