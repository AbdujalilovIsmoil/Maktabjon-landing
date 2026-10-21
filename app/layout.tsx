import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maktabjon — Bolalar raqamli xavfsizligi va kasbiy ta’lim',
  description: 'Nazorat • Ta’lim • Kasb • Kelajak. Smartfonni haqiqiy o‘quv qurolga aylantiring.',
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
