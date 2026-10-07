/* ============================================================
   POST /api/activate  {code, device}  [+ Authorization: Bearer <sesión Google>]
   → { token }
   La PWA (/app) canjea el código: queda atado a ESE dispositivo y,
   si hay sesión de Google, a ese mail. Devuelve la licencia firmada
   que la app valida offline.

   Anti-piratería (bloqueo por dispositivo):
     · código ya usado en otro dispositivo         → 409 BLOQUEO
     · código atado a otro mail de Google          → 409 BLOQUEO
   El dispositivo es el id al azar que la app guarda en ese navegador
   (texma_dev). La IP y el navegador se guardan para auditoría, pero NO
   bloquean: en el celular la IP cambia sola (wifi ↔ datos) y dejaría
   afuera a clientas legítimas.
============================================================ */
import { dbAdmin, verificarSesion } from '@/lib/admin-server';
import { BLOQUEO_DISPOSITIVO, firmarLicencia, ipDe, jsonCors, preflight } from '@/lib/licencias-server';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

const DEVICE = /^[a-f0-9]{16,64}$/i;

function normCodigo(code: unknown) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 12 ? c.match(/.{4}/g)!.join('-') : String(code || '').trim().toUpperCase();
}

export async function POST(req: Request) {
  try {
    /* sesión de Google: opcional para el servidor (el APK no la tiene);
       si viene, tiene que ser válida y el mail queda atado a la licencia */
    let email: string | null = null;
    if (req.headers.get('authorization')) {
      const s = await verificarSesion(req);
      if (s instanceof Response) {
        const j = await s.json().catch(() => ({}));
        return jsonCors({ error: j.error || 'Tu sesión venció. Volvé a iniciar sesión con Google.', sesion: false }, 401);
      }
      email = s.email.toLowerCase();
    }

    const b = await req.json().catch(() => ({}));
    const code = normCodigo(b.code);
    const device = String(b.device || '').trim();
    if (!code || !DEVICE.test(device)) return jsonCors({ error: 'Faltan datos' }, 400);

    const db = dbAdmin();
    const { data: lic, error } = await db.from('licenses').select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    if (!lic) return jsonCors({ error: 'Código inexistente. Revisalo o escribinos.' }, 404);
    if (lic.status === 'revoked') return jsonCors({ error: 'Licencia dada de baja' }, 403);

    const otroDispositivo = lic.device && lic.device !== device;
    const otroMail = email && lic.email && String(lic.email).toLowerCase() !== email;
    if (otroDispositivo || otroMail) {
      console.warn('activate bloqueado', { code, motivo: otroDispositivo ? 'dispositivo' : 'mail', ip: ipDe(req) });
      return jsonCors({ error: BLOQUEO_DISPOSITIVO, bloqueo: true }, 409);
    }

    /* el filtro «device libre o este mismo» evita que dos dispositivos
       canjeando el mismo código a la vez se queden los dos con la licencia */
    const ahora = new Date().toISOString();
    const { data: filas, error: e2 } = await db.from('licenses')
      .update({
        device, status: 'active',
        activated_at: lic.activated_at || ahora,
        last_seen_at: ahora,
        opens: (lic.opens || 0) + 1,
        ...(email && !lic.email ? { email } : {}),
      })
      .eq('code', code).neq('status', 'revoked').or(`device.is.null,device.eq.${device}`)
      .select('code');
    if (e2) throw e2;
    if (!filas?.length) return jsonCors({ error: BLOQUEO_DISPOSITIVO, bloqueo: true }, 409);

    /* auditoría (supabase/licencias_dispositivo.sql): si la columna no está, no frena */
    const { error: e3 } = await db.from('licenses')
      .update({ last_ip: ipDe(req), user_agent: (req.headers.get('user-agent') || '').slice(0, 300) })
      .eq('code', code);
    if (e3) console.warn('activate: sin columnas de auditoría', e3.message);

    const token = await firmarLicencia({ id: code, device, name: lic.nombre || '', email: email || lic.email || '', ts: Date.now(), v: 1 });
    return jsonCors({ token });
  } catch (e) {
    console.error('activate', e);
    /* `detalle` es el motivo técnico: la app lo imprime en la consola */
    return jsonCors({ error: 'No pude activar ahora. Probá en un rato.', detalle: e instanceof Error ? e.message : String(e) }, 500);
  }
}
