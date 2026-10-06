/* /api/admin/pre-ventas (solo admin)
     GET                                  → últimos 300 leads de /checkout
     PATCH {id, estado?, license_code?}   → cambia el estado y/o vincula el código */
import { dbAdmin, json, seguro, verificarAdmin } from '@/lib/admin-server';
import type { PreVenta } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const ESTADOS: PreVenta['estado'][] = ['pendiente', 'vendida', 'descartada'];
const CODIGO = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export const GET = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const { data, error } = await dbAdmin().from('pre_ventas').select('*')
    .order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return json(data as PreVenta[]);
});

export const PATCH = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || '');
  const cambios: Partial<PreVenta> = {};
  if (ESTADOS.includes(b.estado)) cambios.estado = b.estado;
  if (typeof b.license_code === 'string' && CODIGO.test(b.license_code)) cambios.license_code = b.license_code;
  if (!id || !Object.keys(cambios).length) return json({ error: 'Faltan datos' }, 400);
  const { data, error } = await dbAdmin().from('pre_ventas').update(cambios).eq('id', id).select('*').single();
  if (error) throw error;
  return json(data as PreVenta);
});
