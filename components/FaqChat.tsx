'use client';
import { useEffect, useRef, useState } from 'react';

type QA = { q: string; a: string; k: string[] };
const QAS: QA[] = [
  { q: 'Qurilmani qanday ulayman?', k: ['qurilma', 'ulash', 'ulay', 'qr', 'pin', 'skaner'], a: 'Ota-ona ilovasida QR kod yoki 6 xonali PIN ko‘rsatiladi. Farzandingiz uni o‘z telefonida skanerlaydi yoki kiritadi — shu zahoti qurilma ulanadi.' },
  { q: 'Qaysi sinflar uchun?', k: ['sinf', 'yosh', 'klass'], a: 'Hozir 1-sinfdan 7-sinfgacha. Dastur tanlangan kasbga qarab yillik reja bo‘yicha tuziladi.' },
  { q: 'Farzandim kasbni o‘zi tanlasa-chi?', k: ['kasb', 'tanlas', 'tasdiq'], a: 'O‘quvchi kasbni tanlagach, sizga bildirishnoma keladi. «Ha, tasdiqlayman» desangiz, tizim 1→7-sinf yillik rejani avtomatik tuzadi.' },
  { q: 'Qancha turadi? Bepulmi?', k: ['narx', 'pul', 'bepul', 'qancha', 'obuna', 'premium', 'to‘lov', 'tolov'], a: 'Boshlash bepul. Premium: yillik 290 000 so‘m (oyiga ≈ 24 167) yoki oylik 29 990 so‘m. Yillik tarif 20% tejaydi.' },
  { q: 'Nechta qurilma ulash mumkin?', k: ['nechta', 'bir nechta', 'farzand', 'bola'], a: 'Premium obunada 5 tagacha qurilma ulash mumkin — barcha farzandlaringizni bitta joydan boshqarasiz.' },
  { q: 'Nimalarni nazorat qilaman?', k: ['nazorat', 'ilova', 'limit', 'joylashuv', 'blok', 'vaqt', 'jadval'], a: 'Ilovalarni bloklash va kunlik vaqt limiti, real-time joylashuv va xavfsiz zonalar, dars jadvali hamda ekran vaqti statistikasi.' },
];
const FALLBACK = 'Bu savolga hozircha aniq javobim yo‘q 🤔 Pastdagi tayyor savollardan birini tanlab ko‘ring.';

function Bot({ text, onTick }: { text: string; onTick: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const id = setTimeout(() => { setN((v) => v + 2); onTick(); }, 16);
    return () => clearTimeout(id);
  }, [n, text, onTick]);
  return <>{text.slice(0, n)}{n < text.length && <i className="caret" />}</>;
}

/** Savol-javob: yordamchi bilan chat uslubida. */
export default function FaqChat() {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: 'Salom! Men Maktabjon yordamchisiman 👋 Savolingizni tanlang yoki o‘zingiz yozing.' },
  ]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const [val, setVal] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const scroll = () => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; };
  useEffect(() => { scroll(); }, [msgs, typing]);

  // Chat ichida aylanadigan joy bo'lsa — chat aylanadi; chetiga yetsa — sahifa (Lenis) aylanadi.
  useEffect(() => {
    const el = box.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const canScroll = el.scrollHeight > el.clientHeight + 1;
      const up = e.deltaY < 0;
      const room = up ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      if (canScroll && room) el.setAttribute('data-lenis-prevent', ''); else el.removeAttribute('data-lenis-prevent');
    };
    el.addEventListener('wheel', onWheel, { passive: true, capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const ask = (text: string, qa?: QA) => {
    if (typing || !text.trim()) return;
    const found = qa ?? QAS.find((x) => x.k.some((k) => text.toLowerCase().includes(k)));
    setMsgs((m) => [...m, { me: true, text }]);
    if (found) setAsked((a) => (a.includes(found.q) ? a : [...a, found.q]));
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { me: false, text: found ? found.a : FALLBACK }]); }, 900 + Math.random() * 500);
  };

  return (
    <div className="chat glass">
      <div className="chat-head">
        <span className="chat-av"><img src="/logo.png" alt="" /></span>
        <div><b>Maktabjon yordamchisi</b><small><i /> onlayn</small></div>
      </div>
      <div className="chat-body" ref={box}>
        {msgs.map((m, i) => (
          <div key={i} className={`bub ${m.me ? 'me' : 'bot'}`}>
            {m.me || i === 0 ? m.text : <Bot text={m.text} onTick={scroll} />}
          </div>
        ))}
        {typing && <div className="bub bot dots"><i /><i /><i /></div>}
      </div>
      <div className="chat-chips">
        {QAS.map((x) => (
          <button key={x.q} disabled={typing} className={asked.includes(x.q) ? 'done' : ''} onClick={() => ask(x.q, x)}>{x.q}</button>
        ))}
      </div>
      <form className="chat-in" onSubmit={(e) => { e.preventDefault(); ask(val); setVal(''); }}>
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Savolingizni yozing…" aria-label="Savol" />
        <button type="submit" disabled={typing || !val.trim()} aria-label="Yuborish">➤</button>
      </form>
    </div>
  );
}
