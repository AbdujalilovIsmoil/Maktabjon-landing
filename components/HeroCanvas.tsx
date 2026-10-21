'use client';
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

export default function HeroCanvas() {
  return <div className="canvas-wrap"><HeroScene /></div>;
}
