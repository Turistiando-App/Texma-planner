/* ============================================================
   /api/admin/licencias (solo admin)
     GET                               → últimas 100 licencias
     POST {nombre, contacto, precio, email?}   → crea un código nuevo
     PATCH {code, accion: 'liberar'}   → suelta el dispositivo para reactivar
                                       (email: el del lead de /checkout, si vino de Pre-ventas)
   Escribe en la MISMA tabla `licenses` que usa la PWA (/api/activate),
   con los mismos campos que el panel viejo, así el código funciona
   en la app y el link de entrega /d/<claim_token> también.
============================================================ */
import { dbAdmin, json, nuevoClaimToken, nuevoCodigo, seguro, verificarAdmin } from '@/lib/admin-server';
import { ADMIN_EMAIL, type Licencia } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const TREINTA_DIAS = 30 * 864e5;
const CAMPOS = 'code,status,nombre,contacto,email,precio,vendedor,device,activated_at,last_seen_at,claim_token,created_at';

export const GET = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const { data, error } = await dbAdmin().from('licenses').select(CAMPOS)
    .eq('app_id', 'texma').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return json(data as Licencia[]);
});

export const POST = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const b = await req.json().catch(() => ({}));
  const nombre = String(b.nombre || '').trim().slice(0, 80);
  if (!nombre) return json({ error: 'Poné el nombre de la clienta' }, 400);

  const fila = {
    app_id: 'texma',
    nombre,
    contacto: String(b.contacto || '').trim().slice(0, 80),
    precio: Math.max(0, Math.round(+b.precio)) || 30000,
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(b.email || '')) ? { email: String(b.email).trim().toLowerCase().slice(0, 120) } : {}),
    vendedor: ADMIN_EMAIL,
    status: 'pending',
    claim_token: nuevoClaimToken(),
    claim_expires_at: new Date(Date.now() + TREINTA_DIAS).toISOString(),
  };
  /* el código es al azar: si justo choca con uno existente (23505), se tira otro */
  for (let i = 0; i < 4; i++) {
    const { data, error } = await dbAdmin().from('licenses').insert({ ...fila, code: nuevoCodigo() }).select(CAMPOS).single();
    if (!error) return json(data as Licencia, 201);
    if (error.code !== '23505') throw error;
  }
  return json({ error: 'No pude generar un código, probá de nuevo' }, 500);
});

/* PATCH {code, accion: 'liberar'} → suelta el dispositivo (y el mail) de una
   licencia para que la clienta la vuelva a activar en otro equipo. Es la
   respuesta a los tickets del bloqueo por dispositivo de /api/activate. */
export const PATCH = seguro(async req => {
  const corte = await verificarAdmin(req);
  if (corte) return corte;
  const b = await req.json().catch(() => ({}));
  const code = String(b.code || '').trim().toUpperCase();
  if (!code || b.accion !== 'liberar') return json({ error: 'Faltan datos' }, 400);
  const { data, error } = await dbAdmin().from('licenses')
    .update({ device: null, email: null, status: 'pending' })
    .eq('app_id', 'texma').eq('code', code).neq('status', 'revoked')
    .select(CAMPOS).single();
  if (error) throw error;
  return json(data as Licencia);
});
