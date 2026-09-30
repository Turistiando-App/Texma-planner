import { Flame } from 'lucide-react';
import Link from 'next/link';
import type { Producto } from '@/lib/tipos';
import { pesos, precioPor } from '@/lib/sitio';
import { ProductoVisual } from './dibujos';
import { StockBadge } from './StockEnVivo';

/* tarjeta limpia de e-commerce: la imagen manda, título sutil, tags y precio destacado */
export default function ProductoCard({ p }: { p: Producto }) {
  return (
    <Link href={`/merceria/${p.slug}`}
      className="group flex h-full flex-col rounded-[1.75rem] bg-white p-2.5 shadow-[0_1px_2px_rgba(43,38,34,.05)] ring-1 ring-linea/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(43,38,34,.22)]">
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_50%_38%,#FFFFFF,#F3EEE5_75%)]">
        <ProductoVisual p={p} className="transition duration-500 group-hover:scale-105 group-hover:-rotate-3" />
        <div className="absolute left-2.5 top-2.5"><StockBadge slug={p.slug} stock={p.stock} unidad={p.unidad} /></div>
        {p.destacado && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-tinta px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            <Flame className="h-3 w-3 text-rosa" aria-hidden="true" /> Top
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-tinta/85">{p.titulo}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-lino px-2 py-0.5 text-[11px] font-semibold text-tinta-suave">{p.subcategoria}</span>
          {p.unidad === 'mts' && <span className="rounded-full bg-rosa-claro/70 px-2 py-0.5 text-[11px] font-semibold text-rosa-oscuro">Por metro</span>}
          {p.unidad === 'pack' && <span className="rounded-full bg-rosa-claro/70 px-2 py-0.5 text-[11px] font-semibold text-rosa-oscuro">Pack</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-mono text-[22px] font-bold leading-none tracking-tight">{pesos(p.precio)}</p>
            <p className="mt-1 text-[11px] text-tinta-suave">{precioPor(p.unidad)}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tinta text-lg text-white transition group-hover:bg-rosa" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
