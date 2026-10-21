'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WORD = 'MAKTABJON'.split('');

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const word = ref.current!.querySelector('.foot-word')!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { word.classList.add('in'); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(word);
    const ctx = gsap.context(() => {
      gsap.from('.foot-top > *', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.foot-top', start: 'top 90%' } });
    }, ref);
    return () => { ctx.revert(); io.disconnect(); };
  }, []);

  return (
    <footer className="foot" ref={ref}>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <a href="#top" className="logo"><img src="/logo.png" alt="" />Maktabjon</a>
            <p>Smartfonni haqiqiy o‘quv qurolga aylantiruvchi platforma: nazorat, ta’lim va kasbga yo‘naltirish — bitta ilovada.</p>
            <a href="#" className="store mini magnet" aria-label="Google Play'dan yuklab olish">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="#00c3ff" d="M3.6 2.4 13.3 12 3.6 21.6c-.4-.3-.6-.7-.6-1.2V3.6c0-.5.2-.9.6-1.2Z" />
                <path fill="#00e676" d="M3.6 2.4c.3-.2.8-.2 1.3.1L16.5 9l-3.2 3L3.6 2.4Z" />
                <path fill="#ff3d57" d="m3.6 21.6 9.7-9.6 3.2 3-11.6 6.5c-.5.3-1 .3-1.3.1Z" />
                <path fill="#ffc400" d="m16.5 9 3.7 2.1c.7.4.7 1.4 0 1.8L16.5 15l-3.2-3 3.2-3Z" />
              </svg>
              <span><small>YUKLAB OLISH</small><b>Google Play</b></span>
            </a>
          </div>
          <nav className="foot-col" aria-label="Bo‘limlar">
            <h4>Bo‘limlar</h4>
            <a href="#muammo">Nima uchun</a><a href="#nazorat">Nazorat</a><a href="#talim">Ta’lim</a><a href="#kasb">Kasblar</a><a href="#narx">Narxlar</a>
          </nav>
          <nav className="foot-col" aria-label="Ilova">
            <h4>Ilova</h4>
            <a href="#nazorat">Ota-ona uchun</a><a href="#talim">O‘quvchi uchun</a><a href="#ilova">Ilova ichida</a><a href="#sinab">Sinab ko‘ring</a><a href="#faq">Savollar</a>
          </nav>
        </div>
        <div className="foot-word" aria-hidden>{WORD.map((l, i) => <b key={i} style={{ '--d': `${i * 55}ms` } as React.CSSProperties}><span>{l}</span></b>)}</div>
        <div className="foot-bottom">
          <span>© 2026 Maktabjon. Barcha huquqlar himoyalangan.</span>
          <span>Nazorat • Ta’lim • Kasb • Kelajak</span>
        </div>
      </div>
    </footer>
  );
}
