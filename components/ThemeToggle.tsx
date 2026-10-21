'use client';
import { useTheme } from '@/lib/useTheme';

export default function ThemeToggle() {
  const theme = useTheme();
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = document.documentElement;
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => { el.dataset.theme = next; try { localStorage.setItem('theme', next); } catch {} };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }).startViewTransition;
    if (!vt || reduce) {
      el.classList.add('theming'); apply(); setTimeout(() => el.classList.remove('theming'), 600); return;
    }
    // tugma joyidan doira shaklida yoyilib o'tadi
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = vt.call(document, apply);
    t.ready.then(() => {
      el.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.65,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  };
  return (
    <button className="theme-btn" onClick={toggle} aria-label="Mavzuni almashtirish" data-dark={theme === 'dark'}>
      <svg viewBox="0 0 24 24" className="sun" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg viewBox="0 0 24 24" className="moon" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    </button>
  );
}
