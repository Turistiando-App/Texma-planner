/* El link de entrega. vercel.json reescribe /d/<token> → /api/claim?t=<token>
     GET   SOLO dibuja la página (no consume nada)
     POST  reclamo explícito → { code, apk, app, version }

   Por qué el GET no consume: WhatsApp, Telegram y Gmail piden una vista
   previa del link (un GET hecho por un bot). Si el GET quemara el link, la
   licencia se gastaría sola antes de que la clienta toque nada. Los bots no
   hacen POST. */
import { json, preflight, licPorToken, licPatch, apkInfo, appUrl, TOKEN_RE } from './_lib/lic.mjs';
import { paginaLink } from './_lib/pagina.mjs';

export const OPTIONS = preflight;

function tokenDe(req) {
  const u = new URL(req.url);
  const t = u.searchParams.get('t') || (u.pathname.match(/\/d\/([^/?#]+)/) || [])[1] || '';
  return TOKEN_RE.test(t) ? t : '';
}
const vencido = lic => lic.claim_expires_at && Date.now() > Date.parse(lic.claim_expires_at);

export async function GET(req) {
  const t = tokenDe(req);
  const pwa = appUrl(req);
  if (!t) return paginaLink({ estado: 'muerto', pwa });
  try {
    const lic = await licPorToken(t);
    const estado = !lic || lic.status === 'revoked' ? 'muerto'
      : vencido(lic) ? 'vencido'
      : lic.claimed_at ? 'listo' : 'nuevo';
    const info = estado === 'listo' || estado === 'nuevo' ? await apkInfo() : { url: '', version: '' };
    return paginaLink({
      estado, token: t, pwa,
      code: estado === 'listo' ? lic.code : '',
      apk: info.url, version: info.version,
    });
  } catch (e) {
    console.error('claim GET', e);
    return paginaLink({ estado: 'muerto', pwa });
  }
}

export async function POST(req) {
  const t = tokenDe(req);
  if (!t) return json({ error: 'Link inválido' }, 400);
  try {
    const lic = await licPorToken(t);
    if (!lic || lic.status === 'revoked')
      return json({ error: 'No encontré este link. Escribinos y te mandamos otro.' }, 410);
    if (vencido(lic))
      return json({ error: 'El link venció. Escribinos y te mandamos uno nuevo — tu licencia no se perdió.' }, 410);
    /* reclamar de nuevo devuelve siempre el mismo código: el uso único de
       verdad lo hace /api/activate, que ata el código a un celular */
    if (!lic.claimed_at)
      await licPatch(`code=eq.${encodeURIComponent(lic.code)}`, { claimed_at: new Date().toISOString() });
    const info = await apkInfo();
    return json({ code: lic.code, app: appUrl(req), apk: info.url, version: info.version });
  } catch (e) {
    console.error('claim POST', e);
    return json({ error: 'No pude abrir tu licencia ahora. Probá en un rato.' }, 500);
  }
}
