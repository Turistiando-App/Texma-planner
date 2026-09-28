import Link from 'next/link';
import { SITIO } from '@/lib/sitio';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-linea bg-papel">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="titulo text-3xl"><span className="text-rosa">T</span>EXMA</p>
          <p className="mt-3 text-sm text-tinta-suave">{SITIO.lema}.</p>
          <p className="mt-3 text-sm text-tinta-suave">{SITIO.ciudad}</p>
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
            <li><Link href="/app" className="hover:text-rosa">La app para modistas</Link></li>
            <li><Link href="/blog" className="hover:text-rosa">Blog de costura</Link></li>
            <li><Link href="/contacto" className="hover:text-rosa">Contacto</Link></li>
            <li><a href={SITIO.pwa} className="hover:text-rosa">Abrir la app</a></li>
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
