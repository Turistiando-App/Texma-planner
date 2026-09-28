'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITIO } from '@/lib/sitio';

const LINKS = [
  { href: '/merceria', txt: 'Mercería' },
  { href: '/app', txt: 'La app' },
  { href: '/blog', txt: 'Blog' },
  { href: '/contacto', txt: 'Contacto' },
];

export default function Header() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [bajo, setBajo] = useState(false);
  useEffect(() => { setAbierto(false); }, [ruta]);
  useEffect(() => {
    const f = () => setBajo(window.scrollY > 12);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition ${bajo ? 'bg-papel/85 shadow-[0_1px_0_#E4DCCD] backdrop-blur-lg' : ''}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Principal">
        <Link href="/" className="titulo text-2xl tracking-[.08em]" aria-label="TEXMA, inicio">
          <span className="text-rosa">T</span>EXMA
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={`text-sm font-semibold transition hover:text-rosa ${ruta.startsWith(l.href) ? 'text-rosa' : ''}`}>
                {l.txt}
              </Link>
            </li>
          ))}
          <li>
            <a href={SITIO.pwa} className="rounded-full bg-tinta px-4 py-2 text-sm font-bold text-papel transition hover:bg-rosa">
              Abrir la app
            </a>
          </li>
        </ul>
        <button className="grid h-11 w-11 place-items-center rounded-2xl border border-linea bg-papel md:hidden"
          aria-label="Menú" aria-expanded={abierto} onClick={() => setAbierto(v => !v)}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>
      </nav>
      {abierto && (
        <ul className="mx-4 mb-3 space-y-1 rounded-3xl border border-linea bg-papel p-3 shadow-xl md:hidden">
          {LINKS.map(l => (
            <li key={l.href}><Link href={l.href} className="block rounded-2xl px-4 py-3 font-semibold hover:bg-lino">{l.txt}</Link></li>
          ))}
          <li><a href={SITIO.pwa} className="block rounded-2xl bg-rosa px-4 py-3 text-center font-bold text-white">Abrir la app</a></li>
        </ul>
      )}
    </header>
  );
}
