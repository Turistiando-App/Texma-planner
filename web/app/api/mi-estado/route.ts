/* ============================================================
   GET /api/mi-estado  + Authorization: Bearer <sesión de Google>
   → { email, licencia, preventa }
   Lo usa la PWA (/app) en el muro de activación para armar el embudo:
     · sin licencia y sin pre-venta → /checkout (solo pide el WhatsApp)
     · con pre-venta y sin licencia → «Ya tenemos tus datos…»
     · con licencia                 → pedir el código como siempre
   «licencia» = alguna licencia ya atada a este mail (se ata al activar).
============================================================ */
import { dbAdmin, json, seguro, verificarSesion } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

export const GET = seguro(async req => {
  const s = await verificarSesion(req);
  if (s instanceof Response) return s;
  const email = s.email.toLowerCase();
  const db = dbAdmin();
  const [lic, pre] = await Promise.all([
    db.from('licenses').select('code', { count: 'exact', head: true }).eq('app_id', 'texma').eq('email', email).neq('status', 'revoked'),
    db.from('pre_ventas').select('estado').eq('email', email).order('created_at', { ascending: false }).limit(1),
  ]);
  if (lic.error) throw lic.error;
  if (pre.error) throw pre.error;
  return json({ email, licencia: (lic.count ?? 0) > 0, preventa: (pre.data?.length ?? 0) > 0 });
});
