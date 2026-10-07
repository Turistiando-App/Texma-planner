/* /api/admin/tickets (solo admin)
     GET                          → { tickets: últimos 200, mail: ¿SMTP configurado? }
     PATCH {id, estado}           → pendiente ⇄ resuelto
     POST  {id, respuesta}        → le manda la respuesta por MAIL al cliente
                                    y, si salió, marca el ticket «resuelto» */
import { dbAdmin, json, seguro, verificarAdmin } from '@/lib/admin-server';
import type { Ticket } from '@/lib/admin';
import { enviarRespuesta, mailConfigurado } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export const GET = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const { data, error } = await dbAdmin().from('tickets').select('*')
    .order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return json({ tickets: data as Ticket[], mail: mailConfigurado() });
});

export const POST = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || '');
  const respuesta = String(b.respuesta || '').trim().slice(0, 8000);
  if (!id || respuesta.length < 2) return json({ error: 'Escribí la respuesta' }, 400);

  const db = dbAdmin();
  const { data: t, error } = await db.from('tickets').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!t) return json({ error: 'No encontré ese ticket' }, 404);
  const email = String(t.email || (String(t.contacto || '').includes('@') ? t.contacto : '')).trim();
  if (!email) return json({ error: 'Este ticket es viejo y no tiene mail: respondelo por WhatsApp' }, 422);

  /* primero el mail: si no sale, el ticket NO se marca resuelto */
  try { await enviarRespuesta({ nombre: t.nombre, email, motivo: t.motivo, mensaje: t.mensaje }, respuesta); }
  catch (e) {
    console.error('tickets: no salió la respuesta', e);
    return json({ error: `No pude mandar el mail: ${e instanceof Error ? e.message : String(e)}` }, 502);
  }
  const ahora = new Date().toISOString();
  const { data, error: e2 } = await db.from('tickets')
    .update({ estado: 'resuelto', resuelto_at: ahora, respuesta, respondido_at: ahora })
    .eq('id', id).select('*').single();
  if (e2) throw e2;
  return json(data as Ticket);
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
