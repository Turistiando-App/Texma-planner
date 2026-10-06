/* GET /api/admin/metricas → tarjetas del dashboard (solo admin) */
import { dbAdmin, json, seguro, verificarAdmin } from '@/lib/admin-server';
import type { Metricas } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const TREINTA_DIAS = 30 * 864e5;

export const GET = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const db = dbAdmin();

  const [{ data: lics, error }, { count: ticketsPendientes }] = await Promise.all([
    db.from('licenses').select('status,precio,device,activated_at,last_seen_at').eq('app_id', 'texma'),
    db.from('tickets').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
  ]);
  if (error) throw error;

  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
  const m: Metricas = { ventas: 0, facturado: 0, facturadoMes: 0, activas: 0, activas30: 0, pendientes: 0, ticketsPendientes: ticketsPendientes ?? 0 };
  for (const l of lics ?? []) {
    if (l.status === 'revoked') continue;
    m.ventas++;
    if (l.status === 'pending') m.pendientes++;
    /* igual que el panel viejo: se factura cuando la licencia se activa en un celular */
    if (l.device) {
      m.activas++;
      m.facturado += +l.precio || 0;
      if (l.activated_at && new Date(l.activated_at) >= inicioMes) m.facturadoMes += +l.precio || 0;
      if (l.last_seen_at && Date.now() - new Date(l.last_seen_at).getTime() < TREINTA_DIAS) m.activas30++;
    }
  }
  return json(m);
});
