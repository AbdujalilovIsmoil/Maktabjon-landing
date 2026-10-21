'use client';
import { useState } from 'react';

const APPS = [
  { id: 'yt', n: 'YouTube', e: '▶️', m: 42 },
  { id: 'ig', n: 'Instagram', e: '📸', m: 31 },
  { id: 'rb', n: 'Roblox', e: '🎮', m: 55 },
  { id: 'tg', n: 'Telegram', e: '✈️', m: 18 },
  { id: 'ed', n: 'Maktabjon darslari', e: '📚', m: 22, locked: true },
];

const fmt = (m: number) => `${Math.floor(m / 60)}s ${String(m % 60).padStart(2, '0')}d`;

export default function Simulator() {
  const [limit, setLimit] = useState(180);
  const [blocked, setBlocked] = useState<Record<string, boolean>>({ rb: true });
  const used = APPS.reduce((a, x) => a + (blocked[x.id] ? 0 : x.m), 0) + 20;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const over = used > limit;
  const C = 2 * Math.PI * 54;

  return (
    <div className="sim glass">
      <div className="sim-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" className="trk" />
          <circle cx="60" cy="60" r="54" className={`bar ${over ? 'over' : ''}`} strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100} />
        </svg>
        <div className="sim-ring-txt"><b>{fmt(used)}</b><span>{pct}% / {fmt(limit)}</span></div>
      </div>
      <div className="sim-body">
        <label className="sim-lbl">Kunlik limit: <b>{fmt(limit)}</b></label>
        <input type="range" min={30} max={300} step={15} value={limit} onChange={(e) => setLimit(+e.target.value)} />
        <p className={`sim-msg ${over ? 'bad' : 'ok'}`}>
          {over ? 'Limit oshib ketdi — ilovalar bloklanadi!' : `Yana ${fmt(limit - used)} qoldi. Hammasi nazorat ostida.`}
        </p>
        <div className="sim-apps">
          {APPS.map((a) => (
            <button key={a.id} disabled={a.locked} className={`app ${blocked[a.id] ? 'off' : ''}`} onClick={() => setBlocked((b) => ({ ...b, [a.id]: !b[a.id] }))}>
              <span className="em">{a.e}</span>
              <span className="nm">{a.n}</span>
              <span className="st">{a.locked ? 'Doim ochiq' : blocked[a.id] ? 'Bloklangan' : `${a.m} daq`}</span>
              <span className={`sw ${blocked[a.id] ? '' : 'on'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
