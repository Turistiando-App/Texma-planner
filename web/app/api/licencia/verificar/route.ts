/* ============================================================
   /api/licencia/verificar · paso previo a entrar a la app (/login)
     POST {code}  + Authorization: Bearer <access_token de Google>
   Regla: para entrar hace falta sesión de Google Y un código creado
   desde el panel de admin. Acá solo se COMPRUEBA que el código exista
   y no esté dado de baja: NO se canjea. El canje lo hace la PWA
   (/api/activate) porque la licencia queda atada a ESE celular.
============================================================ */
import { dbAdmin, json, seguro, verificarSesion } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

const FORMATO = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export const POST = seguro(async req => {
  const sesion = await verificarSesion(req);
  if (sesion instanceof Response) return sesion;

  const b = await req.json().catch(() => ({}));
  const code = String(b.code || '').trim().toUpperCase();
  if (!FORMATO.test(code)) return json({ error: 'El código tiene 12 caracteres: XXXX-XXXX-XXXX.' }, 400);

  const { data, error } = await dbAdmin().from('licenses').select('status')
    .eq('app_id', 'texma').eq('code', code).maybeSingle();
  if (error) throw error;
  if (!data) return json({ error: 'Ese código no existe. Revisalo o escribinos por WhatsApp.' }, 404);
  if (data.status === 'revoked') return json({ error: 'Ese código fue dado de baja. Escribinos por WhatsApp.' }, 403);
  return json({ ok: true });
});
