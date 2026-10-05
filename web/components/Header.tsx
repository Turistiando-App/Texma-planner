'use client';
/* ============================================================
   HEADER · mega-menú estilo SaaS
   ------------------------------------------------------------
   «Mercería» y «La app» abren un panel ancho al pasar el mouse
   (o con foco / click en pantallas táctiles). El panel entra y sale
   con framer-motion (opacidad + un poco de desplazamiento vertical).
   El tema sigue a lo que hay DEBAJO de la barra, no a la ruta:
     · oscuro: mientras la barra está sobre una sección marcada con
       data-nav="oscuro" (el hero de la portada) va transparente, con
       texto claro y logo en blanco.
     · claro (todo lo demás): texto oscuro, logo original y, al scrollear
       o con un menú abierto, vidrio papel. Así el contraste no depende
       del scroll: fondo claro ⇄ texto oscuro, fondo oscuro ⇄ texto claro.
   El mega-menú se cierra solo al sacar el mouse del panel o del header.
============================================================ */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BookOpen, CalendarClock, ChevronDown, CircleDot, LineChart, ListChecks, Menu,
  MessageCircle, Package, Ruler, Scissors, Smartphone, Store, Truck, Wallet, Waves, X, type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { WA_COMPRAR_APP, waLink } from '@/lib/sitio';

type Item = { href: string; t: string; d: string; i: LucideIcon; externo?: boolean };
type Columna = { titulo: string; items: Item[] };
type Mega = { id: string; txt: string; href: string; columnas: Columna[]; destacado: { kicker: string; t: string; d: string; cta: string; href: string } };

const MEGA: Mega[] = [
  {
    id: 'merceria', txt: 'Mercería', href: '/merceria',
    columnas: [
      {
        titulo: 'Categorías',
        items: [
          { href: '/merceria?cat=Hilos', t: 'Hilos', d: 'Poliéster, algodón y de bordar', i: Scissors },
          { href: '/merceria?cat=Botones', t: 'Botones', d: 'Para camisa, saco y fantasía', i: CircleDot },
          { href: '/merceria?cat=Cierres', t: 'Cierres', d: 'Comunes, invisibles y de metal', i: ListChecks },
          { href: '/merceria?cat=Elásticos', t: 'Elásticos', d: 'Planos, redondos y de cintura', i: Waves },
        ],
      },
      {
        titulo: 'Comprar',
        items: [
          { href: '/merceria', t: 'Todo el catálogo', d: 'Con stock real, al día', i: Store },
          { href: waLink('¡Hola TEXMA! Quiero armar un pedido de mercería.'), t: 'Pedido por WhatsApp', d: 'Te asesora una modista', i: MessageCircle, externo: true },
          { href: '/contacto', t: 'Envíos', d: 'A todo el país o en moto', i: Truck },
        ],
      },
    ],
    destacado: { kicker: 'Mercería', t: 'Lo que ves es lo que hay en el taller.', d: 'El stock se actualiza solo cuando algo se vende.', cta: 'Ver productos', href: '/merceria' },
  },
  {
    id: 'app', txt: 'La app', href: '/app',
    columnas: [
      {
        titulo: 'Funciones',
        items: [
          { href: '/app#funciones', t: 'Medidas por clienta', d: 'Con calculadora de patrón', i: Ruler },
          { href: '/app#funciones', t: 'Entregas con alarma', d: 'Agenda semanal y mensual', i: CalendarClock },
          { href: '/app#funciones', t: 'Cobros y señas', d: 'Lo que te deben, a la vista', i: Wallet },
          { href: '/app#funciones', t: 'Stock y finanzas', d: 'Ventas, gastos y ganancia', i: LineChart },
        ],
      },
      {
        titulo: 'Empezar',
        items: [
          { href: '/app#como', t: 'Cómo la conseguís', d: 'Pago único, sin suscripción', i: Package },
          { href: '/login', t: 'Abrir la app', d: 'Android, iPhone o compu', i: Smartphone },
          { href: '/blog', t: 'Guías y consejos', d: 'Para ordenar tu taller', i: BookOpen },
        ],
      },
    ],
    destacado: { kicker: 'Texma Planner', t: 'Tu taller, ordenado en el celular.', d: 'Pago único. Funciona sin internet.', cta: 'Comprar la app', href: WA_COMPRAR_APP },
  },
];

const SIMPLES = [
  { href: '/blog', txt: 'Blog' },
  { href: '/contacto', txt: 'Contacto' },
];

const esExterno = (href: string) => href.startsWith('http');

const ALTO_BARRA = 64; // h-16

/* ¿la barra está encima de una sección oscura (data-nav="oscuro")? */
const sobreSeccionOscura = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-nav="oscuro"]')).some(el => {
    const r = el.getBoundingClientRect();
    return r.top < ALTO_BARRA && r.bottom > ALTO_BARRA / 2;
  });

const TEMA = {
  oscuro: {
    texto: 'text-gray-200', activo: 'text-white', hover: 'hover:text-white',
    logo: 'brightness-0 invert', // el PNG es gris oscuro: así queda blanco puro
    borde: 'border-white/25 text-white hover:border-white/60 hover:bg-white/5',
  },
  claro: {
    texto: 'text-gray-900', activo: 'text-rosa', hover: 'hover:text-rosa',
    fondo: 'bg-papel/90 shadow-[0_1px_0_#E4DCCD] backdrop-blur-lg',
    logo: '',
    borde: 'border-linea bg-papel/60 text-gray-900 hover:border-rosa hover:text-rosa',
  },
};

function Enlace({ href, className, children, onClick }: { href: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  return esExterno(href)
    ? <a href={href} target="_blank" rel="noopener" className={className} onClick={onClick}>{children}</a>
    : <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

export default function Header() {
  const ruta = usePathname();
  const quieto = useReducedMotion();
  const [abierto, setAbierto] = useState(false);       // menú mobile
  const [panel, setPanel] = useState<string | null>(null); // mega-menú desktop
  const [bajo, setBajo] = useState(false);
  const [sobreOscuro, setSobreOscuro] = useState(false);
  const cierre = useRef<ReturnType<typeof setTimeout>>(undefined);
  const caja = useRef<HTMLElement>(null); // todo el header: barra + mega-menú + menú mobile

  useEffect(() => { setAbierto(false); setPanel(null); }, [ruta]);
  useEffect(() => {
    const f = () => { setBajo(window.scrollY > 12); setSobreOscuro(sobreSeccionOscura()); };
    f();
    window.addEventListener('scroll', f, { passive: true });
    window.addEventListener('resize', f);
    return () => { window.removeEventListener('scroll', f); window.removeEventListener('resize', f); };
  }, [ruta]);
  /* click afuera: cualquier mousedown fuera del header cierra el mega-menú y el menú mobile */
  useEffect(() => {
    if (!panel && !abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) { setPanel(null); setAbierto(false); }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [panel, abierto]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPanel(null); setAbierto(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  /* un respiro antes de cerrar, para poder cruzar del botón al panel */
  const abrir = (id: string) => { clearTimeout(cierre.current); setPanel(id); };
  const cerrarLuego = () => { clearTimeout(cierre.current); cierre.current = setTimeout(() => setPanel(null), 120); };

  const activo = MEGA.find(m => m.id === panel);
  const menu = !!panel || abierto;
  /* texto claro solo sobre el hero oscuro y sin menú abierto (el menú lleva vidrio papel) */
  const T = sobreOscuro && !menu ? TEMA.oscuro : TEMA.claro;
  const transparente = !menu && (sobreOscuro || !bajo);
  const anim = quieto
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

  return (
    <header
      ref={caja}
      onMouseLeave={cerrarLuego}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${T.texto} ${transparente ? '' : TEMA.claro.fondo}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Principal">
        <Link href="/" className="shrink-0" aria-label="TEXMA, inicio">
          <Image src="/logo-texma.png" alt="TEXMA" width={800} height={144} priority
            sizes="160px" className={`h-6 w-auto transition md:h-7 ${T.logo}`} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {MEGA.map(m => {
            const on = panel === m.id || ruta.startsWith(m.href);
            return (
              <li key={m.id} onMouseEnter={() => abrir(m.id)}>
                <button
                  className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition ${T.hover} ${on ? T.activo : T.texto}`}
                  aria-expanded={panel === m.id} aria-controls={`mega-${m.id}`}
                  onFocus={() => abrir(m.id)}
                  onClick={() => setPanel(p => (p === m.id ? null : m.id))}>
                  {m.txt}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${panel === m.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </li>
            );
          })}
          {SIMPLES.map(l => (
            <li key={l.href} onMouseEnter={cerrarLuego}>
              <Link href={l.href} className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${T.hover} ${ruta.startsWith(l.href) ? T.activo : T.texto}`}>
                {l.txt}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex" onMouseEnter={cerrarLuego}>
          <Link href="/login"
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${T.borde}`}>
            Abrir la app
          </Link>
          <a href={WA_COMPRAR_APP} target="_blank" rel="noopener"
            className="rounded-full bg-rosa px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rosa/30 transition hover:-translate-y-0.5 hover:bg-rosa-oscuro">
            Comprar App
          </a>
        </div>

        <button
          className={`grid h-11 w-11 place-items-center rounded-2xl border md:hidden ${T.borde}`}
          aria-label="Menú" aria-expanded={abierto} onClick={() => setAbierto(v => !v)}>
          {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ---- mega-menú (desktop) ---- */}
      <AnimatePresence>
        {activo && (
          <motion.div
            key={activo.id} id={`mega-${activo.id}`}
            {...anim} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-full hidden px-5 md:block">
            {/* solo el panel recibe el mouse: al salir de él se contrae (el margen lateral no cuenta) */}
            <div
              onMouseEnter={() => abrir(activo.id)}
              onMouseLeave={cerrarLuego}
              className="pointer-events-auto mx-auto grid max-w-6xl grid-cols-[1fr_1fr_1.1fr] gap-8 rounded-3xl border border-linea bg-white p-8 text-tinta shadow-[0_30px_80px_-20px_rgba(43,38,34,.28)]">
              {activo.columnas.map(c => (
                <div key={c.titulo}>
                  <p className="kicker text-tinta-suave">{c.titulo}</p>
                  <ul className="mt-4 space-y-1">
                    {c.items.map(it => (
                      <li key={it.t}>
                        <Enlace href={it.href} onClick={() => setPanel(null)}
                          className="group flex items-start gap-3 rounded-2xl p-2.5 transition hover:bg-lino">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rosa-claro/60 text-rosa-oscuro transition group-hover:bg-rosa group-hover:text-white">
                            <it.i className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-bold">{it.t}</span>
                            <span className="block text-xs text-tinta-suave">{it.d}</span>
                          </span>
                        </Enlace>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#140E10] p-6 text-white">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rosa/40 blur-3xl" />
                <div className="relative">
                  <p className="kicker text-rosa-claro/80">{activo.destacado.kicker}</p>
                  <p className="titulo mt-2 text-3xl leading-tight">{activo.destacado.t}</p>
                  <p className="mt-2 text-sm text-white/70">{activo.destacado.d}</p>
                </div>
                <Enlace href={activo.destacado.href} onClick={() => setPanel(null)}
                  className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-rosa px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rosa-oscuro">
                  {activo.destacado.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Enlace>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- menú mobile ---- */}
      <AnimatePresence>
        {abierto && (
          <motion.div {...anim} transition={{ duration: 0.2 }}
            className="mx-4 mb-3 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl border border-linea bg-papel p-3 text-tinta shadow-xl md:hidden">
            {MEGA.map(m => (
              <div key={m.id} className="mb-2">
                <p className="kicker px-3 pb-1 pt-2 text-tinta-suave">{m.txt}</p>
                {m.columnas[0].items.concat(m.columnas[1].items.slice(0, 1)).map(it => (
                  <Enlace key={it.t} href={it.href} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold hover:bg-lino">
                    <it.i className="h-5 w-5 text-rosa" strokeWidth={1.8} aria-hidden="true" /> {it.t}
                  </Enlace>
                ))}
              </div>
            ))}
            {SIMPLES.map(l => (
              <Link key={l.href} href={l.href} className="block rounded-2xl px-3 py-2.5 font-semibold hover:bg-lino">{l.txt}</Link>
            ))}
            <div className="mt-2 grid gap-2">
              <a href={WA_COMPRAR_APP} target="_blank" rel="noopener" className="block rounded-2xl bg-rosa px-4 py-3 text-center font-bold text-white shadow-lg shadow-rosa/30">Comprar App</a>
              <Link href="/login" className="block rounded-2xl border border-linea px-4 py-3 text-center font-bold">Abrir la app</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
