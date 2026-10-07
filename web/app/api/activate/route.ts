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
import { BLOQUEO_DISPOSITIVO, claveQueValida, firmarLicencia, ipDe, jsonCors, preflight, SIN_PAREJA } from '@/lib/licencias-server';

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

    /* se firma ANTES de tocar la base: si falta LIC_PRIV, el código no queda
       atado a medias a un dispositivo que después no recibe su licencia */
    const token = await firmarLicencia({ id: code, device, name: lic.nombre || '', email: email || lic.email || '', ts: Date.now(), v: 1 });
    /* y se comprueba que la app la va a aceptar: si no, NO se marca nada
       en la base (antes quedaba «Activa» con una licencia que la app rechazaba) */
    if (await claveQueValida(token) < 0) throw new Error(SIN_PAREJA);

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

    return jsonCors({ token });
  } catch (e) {
    const motivo = motivoReal(e);
    console.error('activate', motivo, e);
    /* el motivo real va al frontend (pedido explícito, para depurar si es
       un tema de credenciales, de base o de código viejo) */
    return jsonCors({ error: `No pude activar: ${motivo}`, detalle: motivo }, 500);
  }
}

/* traduce la excepción a algo legible. Ojo: los errores de supabase-js NO son
   instancias de Error (son objetos {message, code, details, hint}) */
function motivoReal(e: unknown): string {
  const o = (e && typeof e === 'object' ? e : {}) as { message?: string; code?: string; details?: string; hint?: string };
  const msg = String(o.message || (typeof e === 'string' ? e : '') || 'error desconocido');
  if (msg === SIN_PAREJA) return msg;
  if (/LIC_PRIV/.test(msg)) return `Faltan variables de entorno (${msg})`;
  if (/SUPABASE|SERVICE_ROLE/.test(msg)) return `Faltan variables de entorno (${msg})`;
  if (o.code) {
    const extra = [o.details, o.hint].filter(Boolean).join(' · ');
    return `Error en base de datos [${o.code}]: ${msg}${extra ? ` (${extra})` : ''}`;
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|timeout/i.test(msg)) return `Sin conexión con la base de datos (${msg})`;
  return msg;
}

/* GET /api/activate → diagnóstico de configuración (solo dice SI están las
   variables, nunca sus valores). Para revisar el deploy sin gastar un código. */
export async function GET() {
  let base = 'sin probar';
  try {
    const { error } = await dbAdmin().from('licenses').select('code', { head: true, count: 'exact' }).limit(1);
    base = error ? `error: ${motivoReal(error)}` : 'ok';
  } catch (e) { base = `error: ${motivoReal(e)}`; }
  /* firma: no alcanza con que LIC_PRIV se pueda leer, tiene que ser PAREJA
     de alguna clave pública de la app */
  let firma = 'ok';
  try {
    const i = await claveQueValida(await firmarLicencia({ prueba: true }));
    firma = i < 0 ? `error: ${SIN_PAREJA}` : `ok (valida con la clave pública #${i + 1} de la app)`;
  } catch (e) { firma = `error: ${motivoReal(e)}`; }
  return jsonCors({
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    service_role: !!process.env.SUPABASE_SERVICE_ROLE,
    lic_priv: !!process.env.LIC_PRIV,
    base, firma,
  });
}
