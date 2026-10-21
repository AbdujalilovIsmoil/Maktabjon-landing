'use client';
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme(): Theme {
  const [t, setT] = useState<Theme>('light');
  useEffect(() => {
    const read = () => setT(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return t;
}
