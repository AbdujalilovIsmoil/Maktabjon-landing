'use client';
import dynamic from 'next/dynamic';

const Mascot = dynamic(() => import('./Mascot'), { ssr: false });
export default function MascotLoader() { return <Mascot />; }
