/* ============================================================
   Link de entrega · next.config reescribe /d/<token> → acá
     GET   SOLO dibuja la página (no consume nada)
     POST  reclamo explícito → { code, apk, app, version }
   Por qué el GET no consume: WhatsApp, Telegram y Gmail piden una vista
   previa del link (un GET hecho por un bot). Si el GET quemara el link,
   la licencia se gastaría sola. Los bots no hacen POST.
   (Portado de api/claim.mjs del proyecto viejo de la PWA.)
============================================================ */
import { dbAdmin } from '@/lib/admin-server';
import { apkInfo, jsonCors, origen, preflight } from '@/lib/licencias-server';
import { paginaLink, type EstadoLink } from '@/lib/pagina-licencia';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

type Params = { params: Promise<{ token: string }> };
const TOKEN_RE = /^[a-f0-9]{16,64}$/i;
const vencido = (lic: { claim_expires_at?: string | null }) =>
  !!lic.claim_expires_at && Date.now() > Date.parse(lic.claim_expires_at);

async function licPorToken(t: string) {
  const { data, error } = await dbAdmin().from('licenses').select('*').eq('claim_token', t).maybeSingle();
  if (error) throw error;
  return data;
}

export async function GET(req: Request, { params }: Params) {
  const t = (await params).token;
  const pwa = `${origen(req)}/app`;
  if (!TOKEN_RE.test(t)) return paginaLink({ estado: 'muerto', pwa });
  try {
    const lic = await licPorToken(t);
    const estado: EstadoLink = !lic || lic.status === 'revoked' ? 'muerto'
      : vencido(lic) ? 'vencido'
      : lic.claimed_at ? 'listo' : 'nuevo';
    const info = estado === 'listo' || estado === 'nuevo' ? await apkInfo() : { url: '', version: '' };
    return paginaLink({ estado, token: t, pwa, code: estado === 'listo' ? lic.code : '', apk: info.url, version: info.version });
  } catch (e) {
    console.error('claim GET', e);
    return paginaLink({ estado: 'muerto', pwa });
  }
}

export async function POST(req: Request, { params }: Params) {
  const t = (await params).token;
  if (!TOKEN_RE.test(t)) return jsonCors({ error: 'Link inválido' }, 400);
  try {
    const lic = await licPorToken(t);
    if (!lic || lic.status === 'revoked')
      return jsonCors({ error: 'No encontré este link. Escribinos y te mandamos otro.' }, 410);
    if (vencido(lic))
      return jsonCors({ error: 'El link venció. Escribinos y te mandamos uno nuevo — tu licencia no se perdió.' }, 410);
    /* reclamar de nuevo devuelve siempre el mismo código: el uso único de
       verdad lo hace /api/activate, que ata el código a un dispositivo */
    if (!lic.claimed_at)
      await dbAdmin().from('licenses').update({ claimed_at: new Date().toISOString() }).eq('code', lic.code);
    const info = await apkInfo();
    return jsonCors({ code: lic.code, app: `${origen(req)}/app`, apk: info.url, version: info.version });
  } catch (e) {
    console.error('claim POST', e);
    return jsonCors({ error: 'No pude abrir tu licencia ahora. Probá en un rato.' }, 500);
  }
}
