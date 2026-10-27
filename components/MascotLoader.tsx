'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Mascot = dynamic(() => import('./Mascot'), { ssr: false });
// Maskot muhim emas: sahifa band bo'lmaganda (idle) yuklanadi.
export default function MascotLoader() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(() => setGo(true), { timeout: 3000 }) : setGo(true)), 1200);
    return () => clearTimeout(t);
  }, []);
  return go ? <Mascot /> : null;
}
