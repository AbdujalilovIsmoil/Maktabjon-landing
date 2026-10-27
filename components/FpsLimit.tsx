'use client';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/** frameloop="demand" bilan birga ishlatiladi: kadr tezligini cheklaydi (zaif qurilmalar uchun 30fps). */
export default function FpsLimit({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let id = 0, last = 0;
    const gap = 1000 / fps - 3;
    const loop = (t: number) => { id = requestAnimationFrame(loop); if (t - last >= gap) { last = t; invalidate(); } };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [fps, invalidate]);
  return null;
}
