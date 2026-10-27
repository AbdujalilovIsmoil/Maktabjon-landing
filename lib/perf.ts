// Qurilma darajasini aniqlash: 'low' | 'mid' | 'high'. Faqat brauzerda ishlatiladi.
export type Tier = 'low' | 'mid' | 'high';
let cached: Tier | null = null;

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

export function getTier(): Tier {
  if (cached) return cached;
  if (typeof window === 'undefined') return 'high';
  const n = navigator as Navigator & { deviceMemory?: number };
  const cores = n.hardwareConcurrency || 4;
  const mem = n.deviceMemory || 4;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t: Tier = 'high';
  if (isTouch() || window.innerWidth <= 860) t = 'mid';
  if (reduce || cores <= 4 || mem <= 2 || (isTouch() && (cores <= 6 || mem <= 4))) t = isTouch() || reduce || cores <= 4 || mem <= 2 ? 'low' : t;
  cached = t;
  return t;
}

/** Canvas uchun dpr oralig'i. */
export const dprFor = (t: Tier): [number, number] => (t === 'high' ? [1, 1.75] : t === 'mid' ? [1, 1.25] : [1, 1]);
