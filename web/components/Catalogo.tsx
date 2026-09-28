'use client';
/* ============================================================
   Catálogo con filtros dinámicos
   ------------------------------------------------------------
   Categoría → sus subcategorías (se arman solas con lo que hay),
   rango de precio, búsqueda y orden. Todo del lado del cliente sobre
   la lista que manda el servidor: filtra al instante. Los filtros se
   reflejan en la URL (?cat=&sub=&min=&max=&q=) para poder compartir
   un link filtrado y volver atrás sin perderlos.
============================================================ */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { Producto } from '@/lib/tipos';
import { pesos } from '@/lib/sitio';
import ProductoCard from './ProductoCard';

type Filtros = { cat: string; sub: string; min: number; max: number; q: string; orden: string };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Catalogo({ productos, inicial }: { productos: Producto[]; inicial: Partial<Filtros> }) {
  const tope = useMemo(() => Math.ceil(Math.max(...productos.map(p => p.precio), 0) / 500) * 500, [productos]);
  const [f, setF] = useState<Filtros>({
    cat: inicial.cat ?? '', sub: inicial.sub ?? '', q: inicial.q ?? '', orden: inicial.orden ?? 'rel',
    min: inicial.min ?? 0, max: inicial.max ?? tope,
  });
  const set = (x: Partial<Filtros>) => setF(v => ({ ...v, ...x }));

  const cats = useMemo(() => [...new Set(productos.map(p => p.categoria))], [productos]);
  const subs = useMemo(
    () => [...new Set(productos.filter(p => !f.cat || p.categoria === f.cat).map(p => p.subcategoria))],
    [productos, f.cat],
  );

  const lista = useMemo(() => {
    const w = norm(f.q.trim());
    const r = productos.filter(p =>
      (!f.cat || p.categoria === f.cat) &&
      (!f.sub || p.subcategoria === f.sub) &&
      p.precio >= f.min && p.precio <= f.max &&
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
    if (f.min > 0) u.set('min', String(f.min));
    if (f.max < tope) u.set('max', String(f.max));
    if (f.orden !== 'rel') u.set('orden', f.orden);
    const qs = u.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [f, tope]);

  const chip = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? 'border-tinta bg-tinta text-papel' : 'border-linea bg-papel hover:border-tinta-suave'}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* ---- filtros ---- */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Filtros">
        <input type="search" value={f.q} onChange={e => set({ q: e.target.value })} placeholder="Buscá: cierre, 17 mm, rojo…"
          className="h-12 w-full rounded-full border border-linea bg-papel px-5 outline-none focus:border-rosa" aria-label="Buscar productos" />
        <div>
          <p className="kicker mb-3 text-tinta-suave">Categoría</p>
          <div className="flex flex-wrap gap-2">
            <button className={chip(!f.cat)} onClick={() => set({ cat: '', sub: '' })}>Todo</button>
            {cats.map(c => <button key={c} className={chip(f.cat === c)} onClick={() => set({ cat: c, sub: '' })}>{c}</button>)}
          </div>
        </div>
        <div>
          <p className="kicker mb-3 text-tinta-suave">Subcategoría</p>
          <div className="flex flex-wrap gap-2">
            <button className={chip(!f.sub)} onClick={() => set({ sub: '' })}>Todas</button>
            {subs.map(s => <button key={s} className={chip(f.sub === s)} onClick={() => set({ sub: s })}>{s}</button>)}
          </div>
        </div>
        <div>
          <p className="kicker mb-3 text-tinta-suave">Precio</p>
          <div className="space-y-3 rounded-3xl border border-linea bg-papel p-4">
            <label className="block text-sm">Desde <b className="font-mono">{pesos(f.min)}</b>
              <input type="range" min={0} max={tope} step={100} value={f.min} className="mt-1 w-full accent-rosa"
                onChange={e => set({ min: Math.min(+e.target.value, f.max) })} />
            </label>
            <label className="block text-sm">Hasta <b className="font-mono">{pesos(f.max)}</b>
              <input type="range" min={0} max={tope} step={100} value={f.max} className="mt-1 w-full accent-rosa"
                onChange={e => set({ max: Math.max(+e.target.value, f.min) })} />
            </label>
          </div>
        </div>
        <button className="text-sm font-semibold text-rosa underline-offset-4 hover:underline"
          onClick={() => setF({ cat: '', sub: '', q: '', orden: 'rel', min: 0, max: tope })}>Limpiar filtros</button>
      </aside>

      {/* ---- resultados ---- */}
      <section aria-live="polite">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-tinta-suave"><b className="text-tinta">{lista.length}</b> producto{lista.length === 1 ? '' : 's'}</p>
          <select value={f.orden} onChange={e => set({ orden: e.target.value })} aria-label="Ordenar"
            className="rounded-full border border-linea bg-papel px-4 py-2 text-sm font-semibold">
            <option value="rel">Destacados</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
            <option value="az">A → Z</option>
          </select>
        </div>
        {lista.length ? (
          <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
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
          <p className="rounded-3xl border border-linea bg-papel p-10 text-center text-tinta-suave">
            No hay productos con esos filtros. Probá ampliando el precio o limpiando la búsqueda.
          </p>
        )}
      </section>
    </div>
  );
}
