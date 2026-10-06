'use client';
/* ============================================================
   BLOG GRID · chips de categoría + grilla de tarjetas (/blog)
   ------------------------------------------------------------
   El filtro es del lado del cliente: la página sigue siendo
   estática y TODOS los artículos quedan en el HTML (bueno para
   buscadores y asistentes de IA). «Todo» muestra la grilla entera.
============================================================ */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Articulo } from '@/content/blog';

const fecha = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

export default function BlogGrid({ articulos, categorias }: { articulos: Articulo[]; categorias: string[] }) {
  const quieto = !!useReducedMotion();
  const [cat, setCat] = useState('');
  const lista = cat ? articulos.filter(a => a.categoria === cat) : articulos;

  const chip = (on: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
      on ? 'bg-tinta text-white' : 'bg-white text-tinta ring-1 ring-linea hover:ring-tinta-suave'}`;

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Categorías del blog">
        <button type="button" role="tab" aria-selected={!cat} className={chip(!cat)} onClick={() => setCat('')}>Todo</button>
        {categorias.map(c => (
          <button key={c} type="button" role="tab" aria-selected={cat === c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <motion.ul layout={!quieto} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {lista.map(a => (
            <motion.li key={a.slug} layout={!quieto}
              initial={quieto ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={`/blog/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-linea bg-papel transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(43,38,34,.1)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={a.imagen.src} alt={a.imagen.alt} fill sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-rosa-oscuro">{a.categoria}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="kicker text-tinta-suave"><time dateTime={a.fecha}>{fecha(a.fecha)}</time> · {a.lectura} min</p>
                  <h3 className="titulo mt-2 text-2xl leading-tight group-hover:text-rosa">{a.titulo}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-tinta-suave">{a.descripcion}</p>
                  <span className="mt-auto pt-5 text-sm font-bold text-rosa">Leer artículo →</span>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
