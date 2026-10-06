/* ============================================================
   /api/licencia/verificar · paso previo a entrar a la app (/login)
     POST {code}  [+ Authorization: Bearer <access_token de Google>]
   Regla híbrida (la decide /login): en PC se exige sesión de Google y
   el código; en el celular, solo el código. Acá se COMPRUEBA que el
   código exista (creado desde /admin) y no esté dado de baja: NO se
   canjea. El canje lo hace la PWA (/api/activate) porque la licencia
   queda atada a ESE dispositivo.
   Si viene sesión, el mail de Google queda guardado en la licencia
   (columna `email`, ver supabase/licencias_email.sql).
============================================================ */
import { dbAdmin, json, seguro, verificarSesion } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

const FORMATO = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export const POST = seguro(async req => {
  let email: string | null = null;
  if (req.headers.get('authorization')) {
    const sesion = await verificarSesion(req);
    if (sesion instanceof Response) return sesion;
    email = sesion.email;
  }

  const b = await req.json().catch(() => ({}));
  const code = String(b.code || '').trim().toUpperCase();
  if (!FORMATO.test(code)) return json({ error: 'El código tiene 12 caracteres: XXXX-XXXX-XXXX.' }, 400);

  const db = dbAdmin();
  const { data, error } = await db.from('licenses').select('status')
    .eq('app_id', 'texma').eq('code', code).maybeSingle();
  if (error) throw error;
  if (!data) return json({ error: 'Ese código no existe. Revisalo o escribinos por WhatsApp.' }, 404);
  if (data.status === 'revoked') return json({ error: 'Ese código fue dado de baja. Escribinos por WhatsApp.' }, 403);

  if (email) {
    /* no frena el acceso si la columna todavía no existe en la base */
    const { error: e } = await db.from('licenses').update({ email }).eq('app_id', 'texma').eq('code', code).is('email', null);
    if (e) console.error('verificar: no pude guardar el mail en la licencia', e.message);
  }
  return json({ ok: true });
});
