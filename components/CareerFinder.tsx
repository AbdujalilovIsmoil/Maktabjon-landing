'use client';
import { useState } from 'react';

const INTERESTS = [
  { id: 'num', e: '🔢', t: 'Raqamlar', c: 'economist', n: 'Iqtisodchi', s: 'Matematika, Ijtimoiy fanlar, Ingliz tili' },
  { id: 'people', e: '🩺', t: 'Odamlarga yordam', c: 'doctor', n: 'Shifokor', s: 'Biologiya, Kimyo, Ona tili' },
  { id: 'tech', e: '⚙️', t: 'Texnika', c: 'engineer', n: 'Muhandis', s: 'Fizika, Matematika, Chizmachilik' },
  { id: 'code', e: '💻', t: 'Kod yozish', c: 'developer', n: 'Dasturchi', s: 'Informatika, Matematika, Ingliz tili' },
  { id: 'nature', e: '🌱', t: 'Tabiat', c: 'farmer', n: 'Agronom / Fermer', s: 'Biologiya, Kimyo, Geografiya' },
  { id: 'word', e: '✍️', t: 'So‘z va yozuv', c: 'journalist', n: 'Jurnalist', s: 'Ona tili, Adabiyot, Tarix' },
  { id: 'teach', e: '🍎', t: 'O‘rgatish', c: 'teacher', n: 'O‘qituvchi', s: 'Ona tili, Psixologiya, Pedagogika' },
  { id: 'law', e: '⚖️', t: 'Adolat', c: 'lawyer', n: 'Huquqshunos', s: 'Huquq asoslari, Tarix, Ona tili' },
  { id: 'design', e: '📐', t: 'Dizayn', c: 'architect', n: 'Arxitektor', s: 'Chizmachilik, Matematika, Tasviriy san’at' },
  { id: 'world', e: '🌍', t: 'Dunyo', c: 'diplomat', n: 'Diplomat', s: 'Chet tillari, Tarix, Geografiya' },
];

export default function CareerFinder() {
  const [sel, setSel] = useState(INTERESTS[3]);
  return (
    <div className="finder glass">
      <div className="chips">
        <p className="finder-q">Sizga nima yoqadi?</p>
        {INTERESTS.map((i) => (
          <button key={i.id} className={`chip ${sel.id === i.id ? 'on' : ''}`} onClick={() => setSel(i)}>
            <span>{i.e}</span>{i.t}
          </button>
        ))}
      </div>
      <div className="result" key={sel.id}>
        <img src={`/careers/career-${sel.c}.webp`} alt={sel.n} decoding="async" />
        <div>
          <small>Sizga mos kasb</small>
          <h3>{sel.n}</h3>
          <p><b>Kerakli fanlar:</b> {sel.s}</p>
          <p className="soft">Maktabjon 1→7-sinf uchun yillik reja tuzib beradi.</p>
        </div>
      </div>
    </div>
  );
}
