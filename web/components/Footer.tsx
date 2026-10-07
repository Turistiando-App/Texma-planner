import Image from 'next/image';
import Link from 'next/link';
import { SITIO } from '@/lib/sitio';

/* lucide-react v1 ya no trae íconos de marca: mismos trazos que Lucide (24px, stroke 2, redondeado) */
type Ico = { className?: string };
const Instagram = ({ className }: Ico) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const TikTok = ({ className }: Ico) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M16 3a5 5 0 0 0 5 5M16 3v12a5 5 0 1 1-5-5" />
  </svg>
);

const REDES = [
  { href: SITIO.redes.instagram, t: 'Instagram', I: Instagram },
  { href: SITIO.redes.tiktok, t: 'TikTok', I: TikTok },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-linea bg-papel">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" aria-label="TEXMA, ir al inicio" className="inline-block">
            <Image src="/logo-texma.png" alt="TEXMA" width={800} height={144} className="h-9 w-auto" />
          </Link>
          <p className="mt-3 text-sm text-tinta-suave">{SITIO.lema}.</p>
          <p className="mt-3 text-sm text-tinta-suave">{SITIO.ciudad}</p>
          <ul className="mt-5 flex gap-2">
            {REDES.map(r => (
              <li key={r.t}>
                <a href={r.href} target="_blank" rel="noopener" aria-label={`TEXMA en ${r.t}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-linea text-tinta transition hover:border-rosa hover:bg-rosa hover:text-white">
                  <r.I className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-tinta-suave">Tienda</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/merceria?cat=Hilos" className="hover:text-rosa">Hilos</Link></li>
            <li><Link href="/merceria?cat=Botones" className="hover:text-rosa">Botones</Link></li>
            <li><Link href="/merceria?cat=Cierres" className="hover:text-rosa">Cierres</Link></li>
            <li><Link href="/merceria?cat=Elásticos" className="hover:text-rosa">Elásticos</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker text-tinta-suave">TEXMA</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/planner" className="hover:text-rosa">La app para modistas</Link></li>
            <li><Link href="/blog" className="hover:text-rosa">Blog de costura</Link></li>
            <li><Link href="/contacto" className="hover:text-rosa">Contacto</Link></li>
            <li><Link href="/login" className="hover:text-rosa">Abrir la app</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker text-tinta-suave">Escribinos</p>
          <ul className="mt-4 space-y-2 text-sm">
            {SITIO.whatsapp.map(w => (
              <li key={w.numero}><a href={`https://wa.me/${w.numero}`} className="hover:text-rosa" rel="noopener" target="_blank">WhatsApp {w.lindo}</a></li>
            ))}
            <li><a href={`mailto:${SITIO.mail}`} className="hover:text-rosa">{SITIO.mail}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-linea">
        <p className="kicker mx-auto max-w-6xl px-5 py-5 text-tinta-suave">
          © {new Date().getFullYear()} TEXMA · Hecho con amor ♥
        </p>
      </div>
    </footer>
  );
}
