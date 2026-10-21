'use client';
import { useEffect, useState } from 'react';

/** O'ng pastda fixed turadi, scroll qilinganda chiqadi; atrofidagi halqa sahifa progressini ko'rsatadi. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setShow(scrollY > 400);
      setP(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const C = 2 * Math.PI * 22;
  return (
    <a href="#top" className={`to-top ${show ? 'show' : ''}`} aria-label="Yuqoriga" tabIndex={show ? 0 : -1}>
      <svg viewBox="0 0 52 52" aria-hidden>
        <circle cx="26" cy="26" r="22" className="trk" />
        <circle cx="26" cy="26" r="22" className="bar" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
      </svg>
      <svg viewBox="0 0 24 24" className="arr" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </a>
  );
}
