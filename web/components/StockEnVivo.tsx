'use client';
/* ============================================================
   Stock en tiempo real
   ------------------------------------------------------------
   Las páginas salen del servidor con el stock de ese momento (ISR,
   60 s). Este proveedor se suscribe UNA vez a Supabase Realtime y,
   cada vez que cambia una fila de `productos`, actualiza el número
   en todas las tarjetas visibles sin recargar la página.
   Sin Supabase configurado no hace nada (queda el stock de la página).
============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

const Ctx = createContext<Record<string, number>>({});

export function StockEnVivoProvider({ children }: { children: ReactNode }) {
  const [vivo, setVivo] = useState<Record<string, number>>({});
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    const canal = sb
      .channel('productos-stock')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'productos' }, pl => {
        const n = pl.new as { slug?: string; stock?: number | string };
        if (n.slug !== undefined && n.stock !== undefined) setVivo(v => ({ ...v, [n.slug as string]: Number(n.stock) }));
      })
      .subscribe();
    return () => { sb.removeChannel(canal); };
  }, []);
  return <Ctx.Provider value={vivo}>{children}</Ctx.Provider>;
}

/* el badge de stock de una tarjeta: usa el valor en vivo si llegó uno */
export function StockBadge({ slug, stock, unidad }: { slug: string; stock: number; unidad: string }) {
  const vivo = useContext(Ctx);
  const n = vivo[slug] ?? stock;
  const u = unidad === 'mts' ? 'mts' : unidad === 'pack' ? (n === 1 ? 'pack' : 'packs') : 'u';
  if (n <= 0) return <span className="rounded-full bg-[#FBE3DF] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#B3261E]">Sin stock</span>;
  if (n <= 5) return <span className="rounded-full bg-[#FFF1E5] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#B45309]">Últimos {n} {u}</span>;
  return <span className="rounded-full bg-[#E3F2EA] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#256B47]">En stock</span>;
}
