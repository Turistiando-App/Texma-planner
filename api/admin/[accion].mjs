/* ============================================================
   /api/admin/<accion> · lo que usa el panel (/admin)
   ------------------------------------------------------------
     POST /api/admin/login    {pass, nombre}          → { token, yo }
     GET  /api/admin/lista                            (sesión)
     POST /api/admin/nueva    {nombre,contacto,precio} → { code, link, mensaje }
     GET  /api/admin/entrega?code=XXXX                → mensaje de entrega armado
     POST /api/admin/reset    {code}   libera el celular
     POST /api/admin/revocar  {code}   da de baja / reactiva
   La contraseña es una sola y vive en la variable ADMIN_PASS.
============================================================ */
import {
  json, preflight, leerJson, env, APP_ID, db, licPorCodigo, licPatch, apkInfo,
  newCode, newClaimToken, passOk, makeSession, session, mensajeEntrega, origen, appUrl,
} from '../_lib/lic.mjs';

export const OPTIONS = preflight;

const accion = req => new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();
const TREINTA_DIAS = 30 * 864e5;
const enTreintaDias = () => new Date(Date.now() + TREINTA_DIAS).toISOString();
const codeDe = s => String(s || '').trim().toUpperCase();

async function entrega(req, lic) {
  const link = origen(req) + '/d/' + lic.claim_token;
  const info = await apkInfo();
  const pwa = appUrl(req);
  return {
    code: lic.code, link, apk: info.url, pwa, version: info.version,
    nombre: lic.nombre || '', contacto: lic.contacto || '',
    mensaje: mensajeEntrega({ code: lic.code, link, apk: info.url, pwa, version: info.version, nombre: lic.nombre }),
  };
}

async function manejar(req, metodo) {
  const a = accion(req);

  /* ---------- entrar ---------- */
  if (a === 'login' && metodo === 'POST') {
    if (!env('ADMIN_PASS')) return json({ error: 'El servidor no tiene ADMIN_PASS configurada' }, 500);
    const b = await leerJson(req);
    if (!passOk(String(b.pass || ''))) {
      await new Promise(r => setTimeout(r, 700));      // frena un poco la fuerza bruta
      return json({ error: 'Contraseña incorrecta' }, 401);
    }
    const nombre = String(b.nombre || '').trim().slice(0, 40) || 'Admin';
    return json({ token: await makeSession(nombre), yo: { nombre } });
  }

  /* de acá para abajo hace falta sesión */
  const yo = await session(req);
  if (!yo) return json({ error: 'Sesión vencida — volvé a entrar' }, 401);

  if (a === 'lista' && metodo === 'GET') {
    const lics = await db(`licenses?app_id=eq.${encodeURIComponent(APP_ID())}&select=*&order=created_at.desc`);
    const porVendedor = {};
    let activadas = 0, facturado = 0;
    for (const l of lics) {
      const v = l.vendedor || '—';
      const x = porVendedor[v] = porVendedor[v] || { vendidas: 0, activadas: 0, facturado: 0 };
      x.vendidas++;
      if (l.device) { x.activadas++; x.facturado += +l.precio || 0; activadas++; facturado += +l.precio || 0; }
    }
    return json({ yo: { nombre: yo.n }, total: lics.length, activadas, facturado, porVendedor, licencias: lics });
  }

  if (a === 'nueva' && metodo === 'POST') {
    const b = await leerJson(req);
    const fila = {
      app_id: APP_ID(),
      nombre: String(b.nombre || '').trim(),
      contacto: String(b.contacto || '').trim(),
      precio: Math.round(+b.precio) || 30000,
      vendedor: yo.n || '',
      status: 'pending',
      claim_token: newClaimToken(),
      claim_expires_at: enTreintaDias(),
    };
    /* el código es al azar: si justo choca con uno existente, se tira otro */
    let lic = null;
    for (let i = 0; i < 4 && !lic; i++) {
      try {
        [lic] = await db('licenses', { method: 'POST', body: { ...fila, code: newCode() }, prefer: 'return=representation' });
      } catch (e) { if (e.code !== '23505') throw e; }
    }
    if (!lic) return json({ error: 'No pude generar un código, probá de nuevo' }, 500);
    return json(await entrega(req, lic));
  }

  /* rearmar el mensaje de una licencia ya vendida (para reenviarlo).
     Se renueva el link por 30 días más; el código no cambia. */
  if (a === 'entrega' && metodo === 'GET') {
    const code = codeDe(new URL(req.url).searchParams.get('code'));
    const lic = await licPorCodigo(code);
    if (!lic) return json({ error: 'No existe esa licencia' }, 404);
    const [act] = await licPatch(`code=eq.${encodeURIComponent(code)}`, {
      claim_token: lic.claim_token || newClaimToken(),
      claim_expires_at: enTreintaDias(),
      claimed_at: lic.claimed_at || lic.activated_at || null,
    });
    return json(await entrega(req, act));
  }

  if ((a === 'reset' || a === 'revocar') && metodo === 'POST') {
    const code = codeDe((await leerJson(req)).code);
    const lic = await licPorCodigo(code);
    if (!lic) return json({ error: 'No existe' }, 404);
    const cambios = a === 'reset'
      ? { device: null, activated_at: null, status: lic.status === 'revoked' ? 'revoked' : 'pending' }
      : { status: lic.status === 'revoked' ? (lic.device ? 'active' : 'pending') : 'revoked' };
    const [act] = await licPatch(`code=eq.${encodeURIComponent(code)}`, cambios);
    return json({ ok: true, lic: act });
  }

  return json({ error: 'No encontrado' }, 404);
}

const envolver = metodo => async req => {
  try { return await manejar(req, metodo); }
  catch (e) {
    console.error('admin', e);
    return json({ error: e.message || 'Error del servidor' }, 500);
  }
};
export const GET = envolver('GET');
export const POST = envolver('POST');
