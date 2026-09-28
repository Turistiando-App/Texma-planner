/* POST /api/activate  {code, device} → { token }
   La app canjea el código: queda atado a ese celular y se devuelve la
   licencia firmada que después se valida offline. */
import {
  json, preflight, leerJson, licPorCodigo, licPatch, signToken,
} from './_lib/lic.mjs';

export const OPTIONS = preflight;

export async function POST(req) {
  try {
    const b = await leerJson(req);
    const code = String(b.code || '').trim().toUpperCase();
    const device = String(b.device || '').trim();
    if (!code || !device) return json({ error: 'Faltan datos' }, 400);

    const lic = await licPorCodigo(code);
    if (!lic) return json({ error: 'Código inexistente' }, 404);
    if (lic.status === 'revoked') return json({ error: 'Licencia dada de baja' }, 403);
    if (lic.device && lic.device !== device)
      return json({ error: 'Ese código ya se usó en otro celular' }, 409);

    /* el filtro `device libre o este mismo` hace que dos celulares canjeando
       el mismo código a la vez no puedan quedarse los dos con la licencia */
    const ahora = new Date().toISOString();
    const rows = await licPatch(
      `code=eq.${encodeURIComponent(code)}&status=neq.revoked&or=(device.is.null,device.eq.${encodeURIComponent(device)})`,
      {
        device, status: 'active',
        activated_at: lic.activated_at || ahora,
        last_seen_at: ahora,
        opens: (lic.opens || 0) + 1,
      }
    );
    if (!rows.length) return json({ error: 'Ese código ya se usó en otro celular' }, 409);

    const token = await signToken({ id: code, device, name: lic.nombre || '', ts: Date.now(), v: 1 });
    return json({ token });
  } catch (e) {
    console.error('activate', e);
    /* `detalle` es el motivo técnico (Falta LIC_PRIV, error de Supabase, …):
       la app lo imprime en la consola, a la clienta le muestra `error` */
    return json({ error: 'No pude activar ahora. Probá en un rato.', detalle: String(e && e.message || e) }, 500);
  }
}
