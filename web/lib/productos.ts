/* Solo se usa desde componentes de servidor (páginas). */
import { cache } from 'react';
import { supabase } from './supabase';
import type { Producto } from './tipos';
import ejemplo from '@/data/productos.json';

const EJEMPLO = ejemplo as Producto[];

/* Todos los productos activos. Supabase si está configurado; si no (o si
   falla), los 50 de ejemplo. Se re-valida cada 60 s (ISR): la página sale
   rápida y el stock fino lo actualiza <StockEnVivo> en tiempo real. */
/* cache(): una sola lectura por request aunque la pidan varias partes de la página */
export const getProductos = cache(async (): Promise<Producto[]> => {
  const sb = supabase();
  if (!sb) return EJEMPLO;
  const { data, error } = await sb
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('categoria')
    .order('titulo');
  if (error || !data) {
    console.error('[productos] Supabase falló, uso los de ejemplo:', error?.message);
    return EJEMPLO;
  }
  return data.map(p => ({ ...p, precio: Number(p.precio), stock: Number(p.stock) })) as Producto[];
});

/* La grilla del Home muestra 11 */
export async function getDestacados(n = 11): Promise<Producto[]> {
  const todos = await getProductos();
  const dest = todos.filter(p => p.destacado);
  return (dest.length >= n ? dest : [...dest, ...todos.filter(p => !p.destacado)]).slice(0, n);
}

export async function getProducto(slug: string): Promise<Producto | null> {
  return (await getProductos()).find(p => p.slug === slug) ?? null;
}
