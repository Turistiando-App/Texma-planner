/* /api/admin/tickets (solo admin)
     GET                          → últimos 200 tickets
     PATCH {id, estado}           → pendiente ⇄ resuelto */
import { dbAdmin, json, seguro, verificarAdmin } from '@/lib/admin-server';
import type { Ticket } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export const GET = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const { data, error } = await dbAdmin().from('tickets').select('*')
    .order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return json(data as Ticket[]);
});

export const PATCH = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || '');
  const estado = b.estado === 'resuelto' ? 'resuelto' : b.estado === 'pendiente' ? 'pendiente' : null;
  if (!id || !estado) return json({ error: 'Faltan datos' }, 400);
  const { data, error } = await dbAdmin().from('tickets')
    .update({ estado, resuelto_at: estado === 'resuelto' ? new Date().toISOString() : null })
    .eq('id', id).select('*').single();
  if (error) throw error;
  return json(data as Ticket);
});
