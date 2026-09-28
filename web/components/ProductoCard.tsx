import Link from 'next/link';
import type { Producto } from '@/lib/tipos';
import { pesos, precioPor } from '@/lib/sitio';
import { ProductoVisual } from './dibujos';
import { StockBadge } from './StockEnVivo';

export default function ProductoCard({ p }: { p: Producto }) {
  return (
    <Link href={`/merceria/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-linea bg-papel shadow-[0_1px_2px_rgba(43,38,34,.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(43,38,34,.10)]">
      <div className="relative grid aspect-square place-items-center bg-[radial-gradient(circle_at_50%_40%,#FFFFFF,#F3EEE5)]">
        <ProductoVisual p={p} className="transition duration-500 group-hover:scale-105 group-hover:-rotate-3" />
        <div className="absolute left-3 top-3"><StockBadge slug={p.slug} stock={p.stock} unidad={p.unidad} /></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-tinta-suave">{p.categoria} · {p.subcategoria}</p>
        <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug">{p.titulo}</h3>
        <div className="mt-auto pt-3">
          <p className="font-mono text-xl font-bold">{pesos(p.precio)}</p>
          <p className="font-mono text-[11px] text-rosa">{precioPor(p.unidad)}</p>
        </div>
      </div>
    </Link>
  );
}
