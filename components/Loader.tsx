'use client';
import { useEffect, useRef, useState } from 'react';

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; c: string; s: number; d: number; a: number };

const STOPS = [[47, 134, 235], [139, 92, 246], [247, 37, 133]];
const grad = (u: number) => {
  const k = Math.min(0.999, Math.max(0, u)) * (STOPS.length - 1); const i = Math.floor(k), f = k - i;
  const a = STOPS[i], b = STOPS[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
};

/** Sayt ochilganda: zarrachalar qalpoq va "Maktabjon" yozuvini yig'adi, tayyor bo'lgach portlab ochiladi. */
export default function Loader() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finishNow = () => { window.__mjLoaded = true; window.dispatchEvent(new Event('mj:loaded')); setGone(true); };
    if (window.__mjLoaded) { setGone(true); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finishNow(); return; }

    const html = document.documentElement;
    html.classList.add('loading');
    const canvas = cv.current!; const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, dpr = 1, raf = 0, alive = true, built = false;
    let parts: P[] = [];
    const L = { cx: 0, cy: 0, fs: 0 };
    const mouse = { x: -9999, y: -9999 };
    let pr = 0, phase: 'in' | 'out' = 'in', outT = 0, announced = false, hidden = false;
    let loadDone = document.readyState === 'complete';
    const onLoad = () => { loadDone = true; };
    window.addEventListener('load', onLoad);
    const t0 = performance.now(); let last = t0;
    const ink = () => getComputedStyle(html).getPropertyValue('--ink').trim() || '#00141f';
    const muted = () => getComputedStyle(html).getPropertyValue('--muted').trim() || '#5d6b78';

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.round(innerWidth * dpr); H = canvas.height = Math.round(innerHeight * dpr);
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d', { willReadFrequently: true })!;
      const fs = Math.min(innerWidth * 0.125, 150) * dpr;
      const cx = W / 2, cy = H / 2 + fs * 0.45;
      L.cx = cx; L.cy = cy; L.fs = fs;
      o.fillStyle = '#000'; o.strokeStyle = '#000';
      o.font = `800 ${fs}px Jakarta, system-ui, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle';
      o.fillText('Maktabjon', cx, cy);
      // bitiruvchi qalpoq
      const cs = fs * 1.05, x = cx, y = cy - fs * 1.05;
      o.beginPath(); o.moveTo(x, y - cs * 0.38); o.lineTo(x + cs * 0.8, y - cs * 0.08); o.lineTo(x, y + cs * 0.22); o.lineTo(x - cs * 0.8, y - cs * 0.08); o.closePath(); o.fill();
      o.beginPath(); o.moveTo(x - cs * 0.45, y + cs * 0.04); o.lineTo(x - cs * 0.45, y + cs * 0.3); o.quadraticCurveTo(x, y + cs * 0.54, x + cs * 0.45, y + cs * 0.3); o.lineTo(x + cs * 0.45, y + cs * 0.04); o.lineTo(x, y + cs * 0.22); o.closePath(); o.fill();
      o.lineWidth = cs * 0.045; o.beginPath(); o.moveTo(x + cs * 0.7, y - cs * 0.04); o.lineTo(x + cs * 0.7, y + cs * 0.36); o.stroke();
      o.beginPath(); o.arc(x + cs * 0.7, y + cs * 0.42, cs * 0.055, 0, Math.PI * 2); o.fill();

      const img = o.getImageData(0, 0, W, H).data;
      const g = Math.max(3, Math.round(3.4 * dpr));
      const pts: P[] = [];
      const R = Math.hypot(W, H) * 0.6;
      for (let py = 0; py < H; py += g) for (let px = 0; px < W; px += g) {
        if (img[(py * W + px) * 4 + 3] > 110) {
          const ang = Math.random() * Math.PI * 2, r = R * (0.75 + Math.random() * 0.5);
          pts.push({
            x: W / 2 + Math.cos(ang) * r, y: H / 2 + Math.sin(ang) * r, vx: 0, vy: 0,
            tx: px + (Math.random() - 0.5) * g * 0.5, ty: py + (Math.random() - 0.5) * g * 0.5,
            c: grad((px - (cx - fs * 2.6)) / (fs * 5.2)), s: (1.5 + Math.random() * 1.3) * dpr, d: Math.random() * 1.1, a: ang,
          });
        }
      }
      parts = pts; built = true;
    };

    const start = () => {
      build();
      if (alive) raf = requestAnimationFrame(frame);
    };
    const fontsReady = Promise.race([
      document.fonts?.load('800 100px Jakarta') ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
    fontsReady.then(() => { if (alive) { last = performance.now(); start(); } });

    const frame = (now: number) => {
      if (!alive) return;
      now = Math.max(now, performance.now());
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      const el = Math.max(0, (now - t0) / 1000);
      const ready = (loadDone && window.__mjScene) || el > 7;
      const fake = Math.min(0.88, el / 2.8);
      const target = ready && el > 2 ? 1 : fake;
      pr += (target - pr) * Math.min(1, dt * 3);
      if (phase === 'in' && target === 1 && pr > 0.995) { phase = 'out'; outT = 0; }
      if (phase === 'out') {
        outT += dt;
        if (!announced && outT > 0.3) { announced = true; window.__mjLoaded = true; window.dispatchEvent(new Event('mj:loaded')); html.classList.remove('loading'); }
        if (!hidden && outT > 0.45) { hidden = true; wrap.current?.classList.add('out'); }
        if (outT > 1.2) { setGone(true); return; }
      }

      ctx.clearRect(0, 0, W, H);
      const col = ink();
      // pulsatsiyalanuvchi halqalar
      const maxR = Math.hypot(W, H) * 0.32;
      for (let i = 0; i < 3; i++) {
        const k = Math.abs((el * 0.28 + i / 3) % 1);
        ctx.globalAlpha = (1 - k) * 0.16 * (phase === 'out' ? Math.max(0, 1 - outT * 3) : 1);
        ctx.strokeStyle = grad(i / 2); ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.arc(L.cx, L.cy - L.fs * 0.5, Math.max(0, k * maxR), 0, Math.PI * 2); ctx.stroke();
      }

      // zarrachalar
      const rep = 110 * dpr;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        let alpha = 1;
        if (phase === 'out') {
          const dx = p.x - W / 2, dy = p.y - H / 2, dd = Math.hypot(dx, dy) || 1;
          p.vx += (dx / dd) * 2600 * dpr * dt * (0.6 + p.d); p.vy += (dy / dd) * 2600 * dpr * dt * (0.6 + p.d);
          alpha = Math.max(0, 1 - outT / 0.75);
        } else {
          const t = el - p.d;
          if (t > 0) {
            const wob = Math.sin(el * 2 + p.d * 9) * 1.1 * dpr;
            const dx = p.tx + wob - p.x, dy = p.ty + wob - p.y;
            p.vx += dx * 38 * dt; p.vy += dy * 38 * dt;
            const sw = Math.max(0, 1 - t / 1.1) * 900 * dpr;      // dastlab aylanib keladi
            p.vx += (-dy / (Math.hypot(dx, dy) || 1)) * sw * dt;
            p.vy += (dx / (Math.hypot(dx, dy) || 1)) * sw * dt;
            const mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.hypot(mx, my);
            if (md < rep) { const f = (1 - md / rep) * 5200 * dpr * dt; p.vx += (mx / (md || 1)) * f; p.vy += (my / (md || 1)) * f; }
            const damp = Math.exp(-7.5 * dt); p.vx *= damp; p.vy *= damp;
          }
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = alpha * Math.min(1, Math.max(0, el - p.d + 0.2) * 3);
        ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
      }

      // progress
      if (built && phase === 'in') {
        const bw = Math.min(W * 0.5, 420 * dpr), bh = 4 * dpr, bx = L.cx - bw / 2, by = L.cy + L.fs * 0.78;
        ctx.globalAlpha = 0.14; ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh); ctx.fill();
        const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        gr.addColorStop(0, '#2f86eb'); gr.addColorStop(0.5, '#8b5cf6'); gr.addColorStop(1, '#f72585');
        ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 14 * dpr;
        ctx.beginPath(); ctx.roundRect(bx, by, Math.max(bh, bw * pr), bh, bh); ctx.fill(); ctx.shadowBlur = 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.font = `700 ${15 * dpr}px Jakarta, system-ui, sans-serif`;
        ctx.fillText(`${Math.round(pr * 100)}%`, L.cx, by + 18 * dpr);
        ctx.fillStyle = muted(); ctx.globalAlpha = Math.min(1, Math.max(0, el - 1)) * 0.9; ctx.font = `500 ${13 * dpr}px Jakarta, system-ui, sans-serif`;
        ctx.fillText('Nazorat • Ta’lim • Kasb • Kelajak', L.cx, by + 46 * dpr);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; };
    let rz = 0;
    const onResize = () => { clearTimeout(rz); rz = window.setTimeout(() => { if (alive && phase === 'in') build(); }, 200); };
    window.addEventListener('pointermove', onMove); window.addEventListener('resize', onResize);

    return () => {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', onResize); window.removeEventListener('load', onLoad);
      html.classList.remove('loading');
    };
  }, []);

  if (gone) return null;
  return <div id="loader" ref={wrap} aria-hidden><canvas ref={cv} /></div>;
}
