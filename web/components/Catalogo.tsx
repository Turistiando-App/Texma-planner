'use client';
/* ============================================================
   Catálogo de mercería · estilo e-commerce
   ------------------------------------------------------------
   · Barra superior pegajosa: buscador + pastillas de categoría con
     scroll horizontal (y las subcategorías cuando hay una elegida).
   · Sin filtros: «Lo más pedido» (fila deslizable), banners por rubro
     y el catálogo completo.
   · Con filtros (categoría o búsqueda): solo los resultados.
   Todo filtra del lado del cliente sobre la lista del servidor, y los
   filtros viajan en la URL (?cat=&sub=&q=&orden=) para compartir un
   link filtrado y volver atrás sin perderlos.
   Banners: cada uno espera su foto en /public (banner-hilos.jpg, …).
   Mientras no esté, se ve el degradado de color de la categoría.
============================================================ */
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, CircleDot, LayoutGrid, ListChecks, Scissors, Search, Waves, X, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Producto } from '@/lib/tipos';
import ProductoCard from './ProductoCard';

type Filtros = { cat: string; sub: string; q: string; orden: string };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* rubros: ícono de la pastilla + banner (foto, degradado de respaldo y bajada) */
const RUBROS: Record<string, { i: LucideIcon; img: string; fondo: string; bajada: string }> = {
  Hilos: { i: Scissors, img: '/banner-hilos.jpg', fondo: 'from-[#EC1968] to-[#A61048]', bajada: 'Para cada costura, del ruedo al bordado' },
  Botones: { i: CircleDot, img: '/banner-botones.jpg', fondo: 'from-[#2B2622] to-[#5A4B3F]', bajada: 'El detalle que cierra el look' },
  Cierres: { i: ListChecks, img: '/banner-cierres.jpg', fondo: 'from-[#8C7F68] to-[#5C5344]', bajada: 'Invisibles, metálicos y por metro' },
  Elásticos: { i: Waves, img: '/banner-elasticos.jpg', fondo: 'from-[#F2803C] to-[#C2531A]', bajada: 'Cinturas, breteles y lencería' },
};

const fila: Variants = { oculto: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Catalogo({ productos, inicial }: { productos: Producto[]; inicial: Partial<Filtros> }) {
  const quieto = useReducedMotion();
  const barra = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<Filtros>({
    cat: inicial.cat ?? '', sub: inicial.sub ?? '', q: inicial.q ?? '', orden: inicial.orden ?? 'rel',
  });
  const set = (x: Partial<Filtros>) => setF(v => ({ ...v, ...x }));

  const cats = useMemo(() => [...new Set(productos.map(p => p.categoria))], [productos]);
  const subs = useMemo(
    () => (f.cat ? [...new Set(productos.filter(p => p.categoria === f.cat).map(p => p.subcategoria))] : []),
    [productos, f.cat],
  );
  const masPedido = useMemo(() => {
    const d = productos.filter(p => p.destacado);
    return (d.length >= 4 ? d : [...d, ...productos.filter(p => !p.destacado)]).slice(0, 8);
  }, [productos]);

  const lista = useMemo(() => {
    const w = norm(f.q.trim());
    const r = productos.filter(p =>
      (!f.cat || p.categoria === f.cat) &&
      (!f.sub || p.subcategoria === f.sub) &&
      (!w || norm(`${p.titulo} ${p.categoria} ${p.subcategoria}`).includes(w)),
    );
    if (f.orden === 'menor') r.sort((a, b) => a.precio - b.precio);
    if (f.orden === 'mayor') r.sort((a, b) => b.precio - a.precio);
    if (f.orden === 'az') r.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    return r;
  }, [productos, f]);

  /* los filtros viajan en la URL (sin recargar ni re-pedir nada) */
  useEffect(() => {
    const u = new URLSearchParams();
    if (f.cat) u.set('cat', f.cat);
    if (f.sub) u.set('sub', f.sub);
    if (f.q) u.set('q', f.q);
    if (f.orden !== 'rel') u.set('orden', f.orden);
    const qs = u.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  const filtrando = Boolean(f.cat || f.q.trim());
  const elegirRubro = (cat: string) => {
    set({ cat, sub: '' });
    const y = (barra.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });
  };

  const pill = (on: boolean) =>
    `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition ${
      on ? 'bg-tinta text-white shadow-[0_8px_20px_-8px_rgba(43,38,34,.6)]' : 'bg-white text-tinta ring-1 ring-linea hover:ring-tinta-suave'}`;
  const anim = (extra?: object) => (quieto ? {} : { variants: fila, initial: 'oculto', whileInView: 'visible', viewport: { once: true, amount: 0.3 }, ...extra });

  return (
    <div>
      {/* ---- barra superior: buscador + pastillas ---- */}
      <div ref={barra} className="sticky top-16 z-30 -mx-5 border-b border-linea/60 bg-lino/85 px-5 py-3 backdrop-blur-lg">
        <div className="flex gap-3">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
            <input type="search" value={f.q} onChange={e => set({ q: e.target.value })} placeholder="Buscá hilos, cierres de 18 cm, elástico negro…"
              className="h-12 w-full rounded-full bg-white pl-11 pr-11 text-[15px] shadow-[0_1px_2px_rgba(43,38,34,.05)] outline-none ring-1 ring-linea transition placeholder:text-tinta-suave/70 focus:ring-2 focus:ring-rosa"
              aria-label="Buscar productos" />
            {f.q && (
              <button onClick={() => set({ q: '' })} aria-label="Borrar búsqueda"
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-lino text-tinta-suave hover:text-tinta">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <select value={f.orden} onChange={e => set({ orden: e.target.value })} aria-label="Ordenar"
            className="hidden h-12 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-linea sm:block">
            <option value="rel">Destacados</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
            <option value="az">A → Z</option>
          </select>
        </div>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Categorías">
          <button role="tab" aria-selected={!f.cat} className={pill(!f.cat)} onClick={() => set({ cat: '', sub: '' })}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" /> Todo
          </button>
          {cats.map(c => {
            const I = RUBROS[c]?.i ?? LayoutGrid;
            return (
              <button key={c} role="tab" aria-selected={f.cat === c} className={pill(f.cat === c)} onClick={() => set({ cat: c, sub: '' })}>
                <I className={`h-4 w-4 ${f.cat === c ? 'text-rosa' : 'text-rosa-oscuro'}`} aria-hidden="true" /> {c}
              </button>
            );
          })}
        </div>
        <AnimatePresence initial={false}>
          {subs.length > 0 && (
            <motion.div key={f.cat} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['', ...subs].map(s => (
                <button key={s || 'todas'} onClick={() => set({ sub: s })}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    f.sub === s ? 'bg-rosa text-white' : 'text-tinta-suave hover:bg-white hover:text-tinta'}`}>
                  {s || 'Todas'}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!filtrando && (
        <>
          {/* ---- lo más pedido ---- */}
          <section className="mt-12" aria-labelledby="mas-pedido">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker text-rosa">Favoritos del taller</p>
                <h2 id="mas-pedido" className="titulo mt-2 text-3xl md:text-4xl">Lo más pedido</h2>
              </div>
            </div>
            <motion.div {...anim()}
              className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {masPedido.map(p => (
                <motion.div key={p.slug} variants={item} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[calc(25%-12px)]">
                  <ProductoCard p={p} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ---- banners por rubro ---- */}
          <section className="mt-14" aria-labelledby="rubros">
            <p className="kicker text-rosa">Comprá por rubro</p>
            <h2 id="rubros" className="titulo mt-2 text-3xl md:text-4xl">¿Qué estás cosiendo hoy?</h2>
            <motion.div {...anim()} className="mt-6 grid gap-4 md:grid-cols-2">
              {cats.map((c, i) => {
                const r = RUBROS[c];
                const cant = productos.filter(p => p.categoria === c).length;
                return (
                  <motion.button key={c} variants={item} onClick={() => elegirRubro(c)}
                    className={`group relative isolate flex h-56 flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-left text-white md:h-72 ${
                      r?.fondo ?? 'from-tinta to-tinta-suave'} ${i === 0 ? 'md:col-span-2 md:h-80' : ''}`}>
                    {/* la foto del banner (si existe) tapa el degradado */}
                    {r && (
                      <span aria-hidden="true" style={{ backgroundImage: `url(${r.img})` }}
                        className="absolute inset-0 -z-10 bg-cover bg-center transition duration-700 group-hover:scale-105" />
                    )}
                    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                    <span className="font-mono text-[11px] uppercase tracking-[.18em] text-white/75">{cant} productos</span>
                    <span className="titulo mt-1 text-4xl md:text-5xl">{c}</span>
                    <span className="mt-1 max-w-sm text-sm text-white/85">{r?.bajada}</span>
                    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-tinta transition group-hover:bg-rosa group-hover:text-white">
                      Ver {c.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </section>
        </>
      )}

      {/* ---- catálogo / resultados ---- */}
      <section className={filtrando ? 'mt-8' : 'mt-16'} aria-live="polite" aria-labelledby="todo">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="todo" className={filtrando ? 'text-sm text-tinta-suave' : 'titulo text-3xl md:text-4xl'}>
            {filtrando
              ? <><b className="text-tinta">{lista.length}</b> producto{lista.length === 1 ? '' : 's'}{f.cat ? ` en ${f.cat}` : ''}{f.q.trim() ? ` para «${f.q.trim()}»` : ''}</>
              : 'Todo el catálogo'}
          </h2>
          {filtrando && (
            <button className="text-sm font-semibold text-rosa underline-offset-4 hover:underline"
              onClick={() => setF({ cat: '', sub: '', q: '', orden: 'rel' })}>Limpiar filtros</button>
          )}
        </div>
        {lista.length ? (
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {lista.map(p => (
                <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                  <ProductoCard p={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <p className="rounded-[2rem] bg-white p-10 text-center text-tinta-suave ring-1 ring-linea">
            No encontramos nada con esa búsqueda. Probá con otra palabra o preguntanos por WhatsApp.
          </p>
        )}
      </section>
    </div>
  );
}
