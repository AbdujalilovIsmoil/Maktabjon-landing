'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SceneLoader from './SceneLoader';
import MascotLoader from './MascotLoader';
import Loader from './Loader';
import FaqChat from './FaqChat';
import Footer from './Footer';
import BackToTop from './BackToTop';
import ThemeToggle from './ThemeToggle';
import Simulator from './Simulator';
import CareerFinder from './CareerFinder';

const words = (s: string) => s.split(' ').map((w, i) => <span className="w" key={i}><span>{w}&nbsp;</span></span>);

const problems = [
  { i: '📱', t: 'Smartfon — o‘yin maydoni', d: 'Bolalar telefonni o‘yin va ijtimoiy tarmoq uchun ishlatadi. Yechim: Nazorat + Ta’lim rejimi.' },
  { i: '🧭', t: 'Kasb noma’lum', d: 'O‘quvchi kelajak kasbini bilmay, maqsadsiz o‘qiydi. Yechim: kasbiy yo‘naltirilgan reja.' },
  { i: '🗺️', t: '1→7-sinf yo‘l xaritasi', d: 'Kasbga tayyorgarlik 1-sinfdan boshlanadi: har yil uchun shaxsiy reja.' },
  { i: '📍', t: 'Sifatli markazlar', d: 'Viloyat bo‘yicha tasdiqlangan o‘quv markazlari katalogi.' },
  { i: '🏆', t: 'Motivatsiya', d: 'Gamifikatsiya: XP, streak, sertifikat va reyting.' },
];

const NAV: [string, string][] = [['muammo', 'Nima uchun'], ['nazorat', 'Nazorat'], ['talim', 'Ta’lim'], ['kasb', 'Kasblar'], ['narx', 'Narxlar'], ['faq', 'Savollar']];
const SPY: Record<string, string | null> = { muammo: 'muammo', nazorat: 'nazorat', talim: 'talim', kasb: 'kasb', ilova: 'kasb', sinab: 'kasb', narx: 'narx', faq: 'faq', yuklash: null };

const panels = [
  { r: 'Ota-ona', img: 'parent-1', t: 'Nazoratni qo‘lingizga oling', d: 'Barcha vazifalar, natijalar va muhim jarayonlarni bitta platformada kuzating.' },
  { r: 'Ota-ona', img: 'parent-2', t: 'Ilovalarni o‘zingiz boshqaring', d: 'Ilovalarni bloklang va kunlik foydalanish vaqtini belgilang.' },
  { r: 'Ota-ona', img: 'parent-3', t: 'Ta’limdagi rivojlanishni kuzating', d: 'O‘rganilgan mavzular, XP ballari va kunlik streaklar bir joyda.' },
  { r: 'Ota-ona', img: 'parent-4', t: 'Eng yaxshi markazlarni toping', d: 'Yo‘nalish, joylashuv va sifat bo‘yicha o‘quv markazlarini solishtiring.' },
  { r: 'O‘quvchi', img: 'student-1', t: 'Qiziqarli darslar sari yo‘l oling', d: 'Kasbingizga mos darslarni bosqichma-bosqich o‘rganing.' },
  { r: 'O‘quvchi', img: 'student-2', t: 'O‘zingizga mos kasbni toping', d: 'Qiziqish va qobiliyatingiz asosida ongli tanlov qiling.' },
  { r: 'O‘quvchi', img: 'student-3', t: 'Bilim sari ishonchli qadam', d: 'Zamonaviy imkoniyatlar bilan salohiyatingizni oshiring.' },
];

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const [yearly, setYearly] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.085, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let introFn: () => void = () => {};
    const heroCounters: gsap.core.Tween[] = [];
    const ctx = gsap.context(() => {
      // Kirish animatsiyasi: loader tugagach boshlanadi
      gsap.set('.hero h1 .w > span', { yPercent: 115 });
      gsap.set('.hero-fade', { y: 30, opacity: 0 });
      gsap.set('.nav', { yPercent: -100 });
      introFn = () => {
        gsap.to('.nav', { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.1 });
        gsap.to('.hero h1 .w > span', { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07, delay: 0.1 });
        gsap.to('.hero-fade', { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.5 });
        heroCounters.forEach((tw) => tw.delay(0.8).play());
      };

      // Yuqoridagi progress
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

      // Hero parallax chiqish
      gsap.to('.hero-copy', { yPercent: -18, opacity: 0, scale: 0.96, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });

      // Umumiy reveal
      gsap.utils.toArray<HTMLElement>('.rv').forEach((el) => {
        gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      gsap.utils.toArray<HTMLElement>('.split').forEach((el) => {
        gsap.from(el.querySelectorAll('.w > span'), { yPercent: 115, duration: 1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%' } });
      });

      // Kartalar: 3D burilib kiradi
      gsap.from('.pcard', { y: 120, rotateX: -50, opacity: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: '.pgrid', start: 'top 80%' } });

      // Hisoblagichlar
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = +el.dataset.count!; const o = { v: 0 }; const inHero = !!el.closest('.hero');
        const tw = gsap.to(o, { v: end, duration: 2, ease: 'power2.out', paused: inHero, scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 95%' }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
        if (inHero) heroCounters.push(tw);
      });

      // Telefonlar: scrollga qarab suzadi
      gsap.utils.toArray<HTMLElement>('.float-phone').forEach((el) => {
        gsap.fromTo(el, { y: 80, rotate: -4 }, { y: -80, rotate: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });

      // Gorizontal pin: ilova ekranlari
      const track = root.current!.querySelector<HTMLElement>('.h-track');
      if (track && window.matchMedia('(min-width: 861px) and (min-aspect-ratio: 11/10)').matches) {
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.h-pin', start: 'top top', end: () => '+=' + dist() * 0.85, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
        gsap.utils.toArray<HTMLElement>('.h-panel .ph').forEach((ph) => {
          gsap.fromTo(ph, { rotateY: 28, scale: 0.86 }, { rotateY: -18, scale: 1.04, ease: 'none', scrollTrigger: { trigger: ph, containerAnimation: tween, start: 'left 100%', end: 'right 0%', scrub: true } });
        });
      }

      // Kasblar tasmasi: scroll tezligiga qarab qiyshayadi
      const skew = gsap.quickTo('.marquee-track', 'skewX', { duration: 0.6, ease: 'power3' });
      lenis.on('scroll', ({ velocity }: { velocity: number }) => skew(gsap.utils.clamp(-14, 14, -velocity * 0.9)));
      ScrollTrigger.addEventListener('scrollEnd', () => skew(0));

      // CTA
      gsap.from('.get', { scale: 0.9, y: 60, ease: 'none', scrollTrigger: { trigger: '.get', start: 'top 100%', end: 'top 45%', scrub: true } });
      gsap.fromTo('.get-phones img', { yPercent: 18 }, { yPercent: -4, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '.get', start: 'top 90%', end: 'bottom 60%', scrub: 1 } });
    }, root);

    const runIntro = () => { introFn(); setTimeout(() => ScrollTrigger.refresh(), 1600); };
    if (window.__mjLoaded) runIntro(); else window.addEventListener('mj:loaded', runIntro, { once: true });

    // Menyuda faol bo'lim + silliq anchor
    const spyIds = Object.keys(SPY);
    const spy = () => {
      if (window.scrollY < 200) { setActive(null); return; }
      const line = innerHeight * 0.45; let cur: string | null = null;
      for (const id of spyIds) { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= line) cur = SPY[id]; }
      setActive(cur);
    };
    lenis.on('scroll', spy); spy();
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href')!;
      if (id.length < 2) { e.preventDefault(); return; }
      const t = document.querySelector<HTMLElement>(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(id === '#top' ? 0 : t, { offset: id === '#top' ? 0 : -60, duration: 1.5 });
    };
    document.addEventListener('click', onAnchor);

    // Maskot va raketa uchun hodisalar
    const fire = (sel: string, ev: string) => {
      const el = root.current!.querySelector(sel); if (!el) return () => {};
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { window.dispatchEvent(new Event(ev)); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(el); return () => io.disconnect();
    };
    const offObs = [fire('#sinab', 'mj:giant'), fire('#yuklash', 'mj:rocket')];

    // Kursor nuri + magnit tugmalar
    const glow = root.current!.querySelector<HTMLElement>('.cursor-glow');
    const gx = glow ? gsap.quickTo(glow, 'x', { duration: 0.5, ease: 'power3' }) : null;
    const gy = glow ? gsap.quickTo(glow, 'y', { duration: 0.5, ease: 'power3' }) : null;
    const onMove = (e: PointerEvent) => { gx?.(e.clientX); gy?.(e.clientY); };
    window.addEventListener('pointermove', onMove);

    const magnets = Array.from(root.current!.querySelectorAll<HTMLElement>('.magnet'));
    const offs = magnets.map((m) => {
      const move = (e: PointerEvent) => { const r = m.getBoundingClientRect(); gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 }); };
      const leave = () => gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
      m.addEventListener('pointermove', move); m.addEventListener('pointerleave', leave);
      return () => { m.removeEventListener('pointermove', move); m.removeEventListener('pointerleave', leave); };
    });

    // Kartalar 3D tilt
    const tilts = Array.from(root.current!.querySelectorAll<HTMLElement>('.tilt'));
    const toffs = tilts.map((c) => {
      const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; gsap.to(c, { rotateY: x * 14, rotateX: -y * 14, duration: 0.4, transformPerspective: 800 }); };
      const leave = () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
      c.addEventListener('pointermove', move); c.addEventListener('pointerleave', leave);
      return () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerleave', leave); };
    });

    return () => {
      ctx.revert(); lenis.destroy(); gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mj:loaded', runIntro); document.removeEventListener('click', onAnchor);
      offs.forEach((f) => f()); toffs.forEach((f) => f()); offObs.forEach((f) => f());
    };
  }, []);

  // Narx almashganda raqam animatsiyasi
  const priceRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = priceRef.current; if (!el) return;
    const target = yearly ? 290000 : 29990; const o = { v: parseInt(el.textContent!.replace(/\D/g, '')) || 0 };
    const t = gsap.to(o, { v: target, duration: 0.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en').replace(/,/g, ' '); } });
    return () => { t.kill(); };
  }, [yearly]);

  return (
    <div ref={root}>
      <Loader />
      <div className="progress" />
      <div className="cursor-glow" />
      <SceneLoader />
      <MascotLoader />

      <nav className="nav">
        <div className="container">
          <a href="#top" className="logo"><img src="/logo.png" alt="" />Maktabjon</a>
          <div className="links">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>)}
          </div>
          <div className="nav-r">
            <ThemeToggle />
            <a href="#yuklash" className="btn btn-primary magnet">Yuklab olish</a>
          </div>
        </div>
      </nav>

      <main>
        <header className="hero" id="top" data-stage>
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow hero-fade">Nazorat • Ta’lim • Kasb • Kelajak</span>
              <h1>{words('Smartfonni')} <span className="grad">{words('o‘quv qurolga')}</span> {words('aylantiring')}</h1>
              <p className="lead hero-fade">Ota-ona farzandining raqamli hayotini nazorat qiladi, o‘quvchi esa 1-sinfdan 7-sinfgacha o‘z kasbiga mos shaxsiy ta’lim yo‘l xaritasini oladi.</p>
              <div className="hero-actions hero-fade">
                <a href="#yuklash" className="btn btn-primary magnet">Bepul boshlash →</a>
                <a href="#sinab" className="btn btn-ghost magnet">Sinab ko‘ring</a>
              </div>
              <div className="stats hero-fade">
                <div><b><i data-count="20">0</i>+</b><span>kasb yo‘nalishi</span></div>
                <div><b><i data-count="7">0</i></b><span>sinf dasturi</span></div>
                <div><b><i data-count="50">0</i>+</b><span>hamkor markaz</span></div>
              </div>
            </div>
          </div>
        </header>

        <section id="muammo">
          <div className="container">
            <div className="center">
              <span className="eyebrow rv">Muammo va yechim</span>
              <h2 className="split">{words('Bolangiz kelajagi uchun bitta platforma')}</h2>
            </div>
            <div className="pgrid">
              {problems.map((p) => (
                <div className="pcard tilt glass" key={p.t}>
                  <div className="ico">{p.i}</div><h3>{p.t}</h3><p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="nazorat" data-stage>
          <div className="container split-grid right">
            <div />
            <div>
              <span className="eyebrow rv">Ota-ona uchun</span>
              <h2 className="split">{words('Nazoratni qo‘lingizga oling')}</h2>
              <p className="lead rv">Barcha vazifalar, natijalar va muhim jarayonlarni bitta platformada kuzating.</p>
              <ul className="checks rv">
                <li>Ilovalarni bloklash va kunlik vaqt limiti</li>
                <li>Real-time joylashuv va xavfsiz zonalar</li>
                <li>Dars jadvali va ekran vaqti statistikasi</li>
                <li>QR yoki PIN orqali qurilmani tez ulash</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="talim" data-stage>
          <div className="container split-grid">
            <div>
              <span className="eyebrow rv">O‘quvchi uchun</span>
              <h2 className="split">{words('Qiziqarli darslar sari yo‘l oling')}</h2>
              <p className="lead rv">Duolingo uslubidagi vizual yo‘l: video, matn, test va natija. Har bir dars bilan XP yig‘ing va streakni davom ettiring.</p>
              <ul className="checks rv">
                <li>Fanlar bo‘yicha bosqichma-bosqich yo‘l</li>
                <li>AI repetitor va kasb testi</li>
                <li>Sertifikatlar, yutuqlar va reyting</li>
                <li>Ota-ona farzand natijalarini kuzatadi</li>
              </ul>
            </div>
            <div />
          </div>
        </section>

        <section id="kasb" data-stage>
          <div className="container split-grid right">
            <div />
            <div>
              <span className="eyebrow rv">Kasb tanlash</span>
              <h2 className="split">{words('O‘zingizga mos kasbni toping')}</h2>
              <p className="lead rv">Qiziqishingizni tanlang — tizim mos kasbni va kerakli fanlarni ko‘rsatadi.</p>
              <div className="rv"><CareerFinder /></div>
            </div>
          </div>
        </section>

        <section className="h-pin" id="ilova">
          <div className="h-head"><span className="eyebrow">Ilova ichida</span><h2>Har bir ekran — o‘ylangan</h2></div>
          <div className="h-track">
            {panels.map((p) => (
              <div className="h-panel" key={p.img}>
                <div className="h-copy"><small>{p.r}</small><h3>{p.t}</h3><p>{p.d}</p></div>
                <img className="ph" src={`/phones/${p.img}.png`} alt={p.t} />
              </div>
            ))}
          </div>
        </section>

        <section id="sinab">
          <div className="container">
            <div className="center">
              <span className="eyebrow rv">Interaktiv</span>
              <h2 className="split">{words('Nazoratni o‘zingiz sinab ko‘ring')}</h2>
              <p className="lead rv">Limitni suring, ilovalarni bloklang — natijani darhol ko‘ring.</p>
            </div>
            <div className="rv"><Simulator /></div>
          </div>
        </section>

        <div className="marquee">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, k) => ['Shifokor', 'Muhandis', 'Dasturchi', 'O‘qituvchi', 'Huquqshunos', 'Arxitektor', 'Iqtisodchi', 'Jurnalist', 'Diplomat', 'Fermer'].map((n) => <span key={n + k}>{n} <em>✦</em></span>))}
          </div>
        </div>

        <section id="narx">
          <div className="container">
            <div className="center">
              <span className="eyebrow rv">Premium</span>
              <h2 className="split">{words('Oddiy va shaffof narxlar')}</h2>
            </div>
            <div className="plan glass tilt rv">
              <div className="seg">
                <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>Yillik</button>
                <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>Oylik</button>
                <i style={{ transform: `translateX(${yearly ? 0 : 100}%)` }} />
              </div>
              <div className="price"><span ref={priceRef}>290 000</span> <small>so‘m / {yearly ? 'yil' : 'oy'}</small></div>
              <p className="soft">{yearly ? '≈ 24 167 so‘m / oy · 20% tejaysiz' : 'Har 30 kunda yangilanadi'}</p>
              <ul className="checks">
                <li>5 tagacha qurilma ulash</li><li>Barcha nazorat funksiyalari</li>
                <li>Barcha kurslarga cheksiz kirish</li><li>Real-time joylashuv nazorati</li>
              </ul>
              <a href="#yuklash" className="btn btn-primary magnet">Premium tanlash</a>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="container narrow">
            <div className="center">
              <span className="eyebrow rv">Yordamchi</span>
              <h2 className="split">{words('Ko‘p so‘raladigan savollar')}</h2>
              <p className="lead rv">Savolni tanlang yoki yozing — yordamchi darhol javob beradi.</p>
            </div>
            <div className="rv"><FaqChat /></div>
          </div>
        </section>

        <section id="yuklash">
          <div className="container">
            <div className="get">
              <i className="blob b1" /><i className="blob b2" />
              <div className="get-copy">
                <span className="eyebrow">Hoziroq yuklab oling</span>
                <h2>Farzandingiz kelajagini <span className="grad">bugundan</span> boshlang</h2>
                <p>Nazorat, ta’lim va kasb tanlash — bitta ilovada. Ro‘yxatdan o‘ting, qurilmani QR orqali ulang va boshlang.</p>
                <div className="stores">
                  <a href="#" className="store magnet" aria-label="Google Play'dan yuklab olish">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path fill="#00c3ff" d="M3.6 2.4 13.3 12 3.6 21.6c-.4-.3-.6-.7-.6-1.2V3.6c0-.5.2-.9.6-1.2Z" />
                      <path fill="#00e676" d="M3.6 2.4c.3-.2.8-.2 1.3.1L16.5 9l-3.2 3L3.6 2.4Z" />
                      <path fill="#ff3d57" d="m3.6 21.6 9.7-9.6 3.2 3-11.6 6.5c-.5.3-1 .3-1.3.1Z" />
                      <path fill="#ffc400" d="m16.5 9 3.7 2.1c.7.4.7 1.4 0 1.8L16.5 15l-3.2-3 3.2-3Z" />
                    </svg>
                    <span><small>YUKLAB OLISH</small><b>Google Play</b></span>
                  </a>
                </div>
                <ul className="get-meta"><li>✓ Android 7.0+</li><li>✓ Bepul boshlash</li><li>✓ Ota-ona va o‘quvchi uchun</li></ul>
              </div>
              <div className="get-phones" aria-hidden>
                <img className="gp1" src="/phones/student-2.png" alt="" />
                <img className="gp2" src="/phones/student-1.png" alt="" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
