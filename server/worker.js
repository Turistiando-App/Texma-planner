/* ============================================================
   TEXMA · Worker de licencias (Cloudflare Workers + KV)
   ------------------------------------------------------------
   Cuentas del panel
     GET  /admin/estado                     ¿hay que crear la primera cuenta?
     POST /admin/setup    {user,pass,nombre}  solo si no hay ninguna cuenta
     POST /admin/login    {user,pass}       → { token }
     GET  /admin/usuarios                   (solo dueña/o)
     POST /admin/usuarios/nuevo  {user,pass,nombre}   invitar (solo dueña/o)
     POST /admin/usuarios/clave  {user,pass}          cambiar contraseña
     POST /admin/usuarios/borrar {user}               (solo dueña/o)
   Ventas
     POST /admin/nueva    {nombre,contacto,precio}  → { code, link }
     GET  /admin/lista
     POST /admin/reset    {code}    libera el dispositivo
     POST /admin/revocar  {code}
     GET  /admin/entrega?code=XXXX  → mensaje de entrega armado
   Público
     POST /activate       {code,device}  → { token }
     GET  /d/:token       SOLO dibuja la página (no consume nada)
     POST /d/:token       reclamo explícito → { code, apk, app }
   Secretos (wrangler secret put)
     LIC_PRIV   JWK privada de firma de licencias (server/keygen.mjs)
   Binding KV: LIC
   Las cuentas del panel se crean desde el panel, no hay claves en el código.
============================================================ */

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,authorization',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
};
const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json', ...CORS },
});

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(
  atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)),
  c => c.charCodeAt(0)
);

/* ---------- contraseñas ---------- */
async function derive(pass, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  /* 100.000 es el máximo que soporta Workers; pedir más tira NotSupportedError */
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, k, 256
  );
  return b64u(bits);
}
async function hashPass(pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: b64u(salt), hash: await derive(pass, salt) };
}
async function checkPass(pass, u) {
  const h = await derive(pass, unb64u(u.salt));
  if (h.length !== u.hash.length) return false;
  let d = 0;
  for (let i = 0; i < h.length; i++) d |= h.charCodeAt(i) ^ u.hash.charCodeAt(i);
  return d === 0;
}

/* ---------- sesiones ---------- */
async function sessKey(env) {
  let s = await env.LIC.get('sys:secret');
  if (!s) {
    s = b64u(crypto.getRandomValues(new Uint8Array(32)));
    await env.LIC.put('sys:secret', s);
  }
  return crypto.subtle.importKey('raw', enc.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function makeSession(env, u) {
  const p = b64u(enc.encode(JSON.stringify({
    u: u.user, n: u.nombre || u.user, r: u.role, exp: Date.now() + 30 * 864e5,
  })));
  const sig = b64u(await crypto.subtle.sign('HMAC', await sessKey(env), enc.encode(p)));
  return p + '.' + sig;
}
async function session(env, req) {
  const raw = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!raw) return null;
  const [p, sig] = raw.split('.');
  if (!p || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await sessKey(env), unb64u(sig), enc.encode(p));
    if (!ok) return null;
    const d = JSON.parse(new TextDecoder().decode(unb64u(p)));
    if (Date.now() > d.exp) return null;
    const raw2 = await env.LIC.get('user:' + d.u);
    if (!raw2) return null;                       // cuenta borrada → sesión muerta
    return { ...d, role: JSON.parse(raw2).role };
  } catch (e) { return null; }
}

/* ---------- licencias ---------- */
async function signToken(env, payload) {
  /* .replace(): al cargar el secreto desde un archivo se le puede colar un BOM */
  const jwk = JSON.parse(String(env.LIC_PRIV).replace(/^﻿/, '').trim());
  const key = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(body));
  return body + '.' + b64u(sig);
}
/* código legible tipo TXM4-9K2P-7QW1 (sin letras confundibles) */
function newCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const g = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => A[b % A.length]).join('');
  return `${g()}-${g()}-${g()}`;
}

async function contarUsuarios(env) {
  const ls = await env.LIC.list({ prefix: 'user:' });
  return ls.keys.length;
}
const limpioUser = s => String(s || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

/* ============================================================
   LA VERSIÓN PUBLICADA (APK) — se lee de Supabase
   ------------------------------------------------------------
   El APK vive en el bucket público `apks` y la fila de la tabla `apps`
   guarda `version` + `url_descarga` (lo escribe scripts/deploy.mjs).
   Esa tabla ya es de lectura pública con la anon key, así que el Worker
   la lee igual que la app. Se cachea 10 minutos en KV para no pegarle a
   Supabase en cada link que se abre.
   Si no hay Supabase configurado, cae en la var APK_URL de wrangler.toml.
============================================================ */
async function apkInfo(env) {
  const appId = env.APP_ID || 'texma';
  const cacheK = 'sys:apk:' + appId;
  try {
    const c = await env.LIC.get(cacheK, 'json');
    if (c && Date.now() - c.ts < 6e5) return c.v;
  } catch (e) { /* caché roto: se rearma solo */ }

  const v = { version: '', url: env.APK_URL || '' };
  if (env.SUPA_URL && env.SUPA_ANON) {
    try {
      const r = await fetch(
        `${env.SUPA_URL}/rest/v1/apps?id=eq.${encodeURIComponent(appId)}&select=version,url_descarga`,
        { headers: { apikey: env.SUPA_ANON, authorization: 'Bearer ' + env.SUPA_ANON } }
      );
      const j = await r.json();
      if (Array.isArray(j) && j[0]) {
        v.version = j[0].version || '';
        v.url = j[0].url_descarga || v.url;
      }
    } catch (e) { /* Supabase dormido o sin red: queda el APK_URL de respaldo */ }
  }
  try { await env.LIC.put(cacheK, JSON.stringify({ ts: Date.now(), v }), { expirationTtl: 3600 }); } catch (e) {}
  return v;
}

/* ---------- el mensaje que la vendedora le manda a la clienta ---------- */
function mensajeEntrega({ code, link, apk, pwa, version, nombre }) {
  const hola = (nombre || '').trim() ? `¡Hola ${String(nombre).trim().split(/\s+/)[0]}!` : '¡Hola!';
  const L = [];
  L.push(`${hola} 💗 Acá va tu TEXMA, tu planner personal.`);
  L.push('');
  L.push('1) INSTALÁ LA APP');
  if (apk) L.push(`   • Android${version ? ' (v' + version + ')' : ''}: ${apk}`);
  else L.push('   • Android: (todavía no hay APK publicado — avisale a quien te vendió)');
  L.push(`   • iPhone o compu: ${pwa}`);
  L.push('     (en iPhone: abrilo con Safari → Compartir → «Agregar a inicio»)');
  L.push('');
  L.push('2) TU CÓDIGO DE LICENCIA');
  L.push(`   ${code}`);
  L.push('   Se pega una sola vez, la primera vez que abrís la app.');
  L.push('   Queda atado a ese celular: guardalo igual por las dudas.');
  if (link) {
    L.push('');
    L.push('3) O ENTRÁ DIRECTO POR ACÁ');
    L.push(`   ${link}`);
    L.push('   Ese link te muestra el código y los botones de descarga.');
  }
  L.push('');
  L.push('Cualquier cosa escribime por acá. ¡Que la disfrutes! ♥');
  return L.join('\n');
}

/* ---------- la página del link (HTML, sin consumir nada) ----------
   estado: 'nuevo' | 'listo' | 'vencido' | 'muerto'                */
function paginaLink({ estado, code = '', apk = '', pwa = '', version = '', token = '' }) {
  const esc = s => String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const html = `<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="only light">
<title>TEXMA · Tu licencia</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FBF7F2;color:#2B2622;font-family:system-ui,-apple-system,Segoe UI,sans-serif;
  line-height:1.5;padding:26px 18px 60px;display:flex;justify-content:center}
.wrap{width:100%;max-width:430px}
h1{font-family:Georgia,serif;font-style:italic;font-size:27px;margin-bottom:4px}
.sub{color:#75695C;font-size:13.5px;margin-bottom:20px}
.card{background:#fff;border:1px solid #EFE7DC;border-radius:20px;padding:20px;margin-bottom:14px;
  box-shadow:0 1px 2px rgba(43,38,34,.04),0 6px 18px rgba(43,38,34,.05)}
.lbl{font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#75695C;margin-bottom:10px}
.code{font-family:ui-monospace,SFMono-Regular,monospace;font-size:23px;font-weight:700;letter-spacing:1.5px;
  background:#FBD9E6;color:#A61048;border-radius:14px;padding:15px 10px;text-align:center;word-break:break-all}
button,a.btn{display:block;width:100%;text-align:center;text-decoration:none;font:inherit;font-weight:700;
  border:none;border-radius:14px;padding:15px;margin-top:11px;cursor:pointer}
.p{background:#EC1968;color:#fff;box-shadow:0 4px 14px rgba(236,25,104,.28)}
.g{background:#fff;color:#2B2622;border:1px solid #EFE7DC}
.p:disabled{opacity:.55;box-shadow:none}
.paso{font-size:14px;color:#4A423B;margin-top:12px}
.paso b{display:block;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#75695C;margin-bottom:2px}
.err{color:#9C3B2E;font-size:13.5px;margin-top:12px;min-height:18px}
.hide{display:none!important}
</style></head><body><div class="wrap">
<h1>TEXMA</h1>
<div class="sub" id="sub">Tu planner personal.</div>

<div class="card ${estado === 'nuevo' ? '' : 'hide'}" id="cReclamar">
  <div class="lbl">Tu licencia te está esperando</div>
  <div class="paso">Tocá el botón y te muestro tu código y los links de descarga.
    Se reclama una sola vez, así que hacelo vos desde tu celular.</div>
  <button class="p" id="go">Reclamar mi licencia</button>
  <div class="err" id="err"></div>
</div>

<div class="card ${estado === 'listo' ? '' : 'hide'}" id="cCodigo">
  <div class="lbl">Tu código de licencia</div>
  <div class="code" id="cod">${esc(code)}</div>
  <button class="g" id="copiar">Copiar el código</button>
  <div class="paso" style="margin-top:16px"><b>Guardalo</b>
    Se pega una sola vez, la primera vez que abrís la app, y queda atado a ese celular.</div>
</div>

<div class="card ${estado === 'listo' ? '' : 'hide'}" id="cBajar">
  <div class="lbl">Bajate la app</div>
  <a class="btn p ${apk ? '' : 'hide'}" id="apk" href="${esc(apk)}">Descargar para Android${version ? ' · v' + esc(version) : ''}</a>
  <a class="btn g" id="pwa" href="${esc(pwa)}">Abrir en iPhone o compu</a>
  <div class="paso" style="margin-top:16px"><b>Android</b>
    Al abrir el archivo te va a pedir permiso para «instalar apps desconocidas»: es normal, TEXMA no está en Play Store.</div>
  <div class="paso"><b>iPhone</b>
    Abrilo con Safari → Compartir → «Agregar a inicio».</div>
</div>

<div class="card ${estado === 'vencido' || estado === 'muerto' ? '' : 'hide'}" id="cMuerto">
  <div class="lbl">Este link ya no sirve</div>
  <div class="paso">${estado === 'vencido'
    ? 'El link venció. Escribile a quien te vendió TEXMA y en un minuto te manda uno nuevo — tu licencia no se perdió.'
    : 'No encontré este link. Puede que esté mal copiado o que sea muy viejo. Escribinos y te mandamos otro.'}</div>
</div>

<script>
var T=${JSON.stringify(token)};
var el=function(i){return document.getElementById(i)};
if(el('go')) el('go').onclick=async function(){
  var b=el('go'); b.disabled=true; b.textContent='Un segundo…'; el('err').textContent='';
  try{
    var r=await fetch(location.pathname,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
    var j=await r.json();
    if(!r.ok) throw new Error(j.error||('Error '+r.status));
    el('cod').textContent=j.code;
    if(j.apk){ el('apk').href=j.apk; el('apk').classList.remove('hide'); }
    if(j.app) el('pwa').href=j.app;
    el('cReclamar').classList.add('hide');
    el('cCodigo').classList.remove('hide');
    el('cBajar').classList.remove('hide');
    el('sub').textContent='Listo ♥ Guardá el código y bajate la app.';
  }catch(e){
    b.disabled=false; b.textContent='Reclamar mi licencia';
    el('err').textContent=e.message;
  }
};
if(el('copiar')) el('copiar').onclick=function(){
  var t=el('cod').textContent.trim();
  var ok=function(){ el('copiar').textContent='¡Copiado! ✓'; setTimeout(function(){el('copiar').textContent='Copiar el código'},1800); };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){});
  else{ var a=document.createElement('textarea'); a.value=t; document.body.appendChild(a); a.select();
        try{document.execCommand('copy');ok()}catch(e){} a.remove(); }
};
</script>
</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    /* ================= público ================= */

    if (p === '/activate' && req.method === 'POST') {
      const { code, device } = await req.json().catch(() => ({}));
      if (!code || !device) return json({ error: 'Faltan datos' }, 400);
      const raw = await env.LIC.get('lic:' + code);
      if (!raw) return json({ error: 'Código inexistente' }, 404);
      const lic = JSON.parse(raw);
      if (lic.revoked) return json({ error: 'Licencia dada de baja' }, 403);
      if (lic.device && lic.device !== device)
        return json({ error: 'Ese código ya se usó en otro celular' }, 409);

      lic.device = device;
      lic.activatedAt = lic.activatedAt || Date.now();
      lic.opens = (lic.opens || 0) + 1;
      lic.lastSeen = Date.now();
      await env.LIC.put('lic:' + code, JSON.stringify(lic));

      const token = await signToken(env, {
        id: code, device, name: lic.nombre || '', ts: Date.now(), v: 1,
      });
      return json({ token });
    }

    /* ---------- el link de entrega ----------
       ANTES: el GET quemaba el token y redirigía. Como WhatsApp, Telegram y
       Gmail piden una vista previa del link (un GET hecho por un bot), la
       licencia se gastaba sola antes de que la clienta tocara nada y le
       quedaba «Este link ya se usó o venció».
       AHORA: el GET solo dibuja la página. Consumir es un POST, o sea una
       acción del dedo de la persona. Los bots no hacen POST.               */
    if (p.startsWith('/d/')) {
      const t = p.slice(3);
      if (!t || !/^[a-f0-9]{16,64}$/i.test(t)) {
        return req.method === 'POST'
          ? json({ error: 'Link inválido' }, 400)
          : paginaLink({ estado: 'muerto', pwa: env.APP_URL, token: t });
      }
      const raw = await env.LIC.get('dl:' + t);
      const d = raw ? JSON.parse(raw) : null;
      const vencido = d && Date.now() > d.exp;

      if (req.method === 'GET') {
        const info = await apkInfo(env);
        const estado = !d ? 'muerto' : vencido ? 'vencido' : (d.claimedAt ? 'listo' : 'nuevo');
        return paginaLink({
          estado, token: t,
          code: estado === 'listo' ? d.code : '',
          apk: info.url, version: info.version, pwa: env.APP_URL,
        });
      }

      if (req.method === 'POST') {
        if (!d) return json({ error: 'No encontré este link. Escribinos y te mandamos otro.' }, 410);
        if (vencido) {
          await env.LIC.delete('dl:' + t);
          return json({ error: 'El link venció. Escribinos y te mandamos uno nuevo — tu licencia no se perdió.' }, 410);
        }
        if (!d.claimedAt) {
          d.claimedAt = Date.now();
          /* No se borra: queda 30 días marcado como reclamado. Así, si la
             clienta refresca o vuelve a abrir el link, sigue viendo SU código
             en vez de una pantalla negra. Reclamar de nuevo devuelve siempre
             el mismo código: el uso único de verdad lo hace /activate, que
             ata el código a un celular. */
          await env.LIC.put('dl:' + t, JSON.stringify(d), { expirationTtl: 30 * 86400 });
        }
        const info = await apkInfo(env);
        return json({ code: d.code, app: env.APP_URL, apk: info.url, version: info.version });
      }
    }

    /* ================= cuentas ================= */

    if (p === '/admin/estado') {
      return json({ setup: (await contarUsuarios(env)) === 0 });
    }

    if (p === '/admin/setup' && req.method === 'POST') {
      if ((await contarUsuarios(env)) > 0) return json({ error: 'Ya hay una cuenta creada' }, 409);
      const b = await req.json().catch(() => ({}));
      const user = limpioUser(b.user);
      if (user.length < 3) return json({ error: 'El usuario necesita 3 letras o más' }, 400);
      if (String(b.pass || '').length < 8) return json({ error: 'La contraseña necesita 8 caracteres o más' }, 400);
      const { salt, hash } = await hashPass(b.pass);
      const u = { user, nombre: (b.nombre || '').trim() || user, role: 'owner', salt, hash, createdAt: Date.now() };
      await env.LIC.put('user:' + user, JSON.stringify(u));
      return json({ token: await makeSession(env, u), yo: { user: u.user, nombre: u.nombre, role: u.role } });
    }

    if (p === '/admin/login' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      const user = limpioUser(b.user);
      const raw = await env.LIC.get('user:' + user);
      if (!raw) { await hashPass('x'); return json({ error: 'Usuario o contraseña incorrectos' }, 401); }
      const u = JSON.parse(raw);
      if (!await checkPass(String(b.pass || ''), u)) return json({ error: 'Usuario o contraseña incorrectos' }, 401);
      u.lastLogin = Date.now();
      await env.LIC.put('user:' + user, JSON.stringify(u));
      return json({ token: await makeSession(env, u), yo: { user: u.user, nombre: u.nombre, role: u.role } });
    }

    /* de acá para abajo hace falta sesión */
    if (p.startsWith('/admin/')) {
      const yo = await session(env, req);
      if (!yo) return json({ error: 'Sesión vencida — volvé a entrar' }, 401);
      const dueño = yo.role === 'owner';

      if (p === '/admin/usuarios' && req.method === 'GET') {
        if (!dueño) return json({ error: 'Solo la dueña o el dueño ve las cuentas' }, 403);
        const ls = await env.LIC.list({ prefix: 'user:' });
        const out = [];
        for (const k of ls.keys) {
          const u = JSON.parse(await env.LIC.get(k.name));
          out.push({ user: u.user, nombre: u.nombre, role: u.role, createdAt: u.createdAt, lastLogin: u.lastLogin || 0 });
        }
        out.sort((a, b) => a.createdAt - b.createdAt);
        return json({ usuarios: out });
      }

      if (p === '/admin/usuarios/nuevo' && req.method === 'POST') {
        if (!dueño) return json({ error: 'Solo la dueña o el dueño invita' }, 403);
        const b = await req.json().catch(() => ({}));
        const user = limpioUser(b.user);
        if (user.length < 3) return json({ error: 'El usuario necesita 3 letras o más' }, 400);
        if (String(b.pass || '').length < 8) return json({ error: 'La contraseña necesita 8 caracteres o más' }, 400);
        if (await env.LIC.get('user:' + user)) return json({ error: 'Ese usuario ya existe' }, 409);
        const { salt, hash } = await hashPass(b.pass);
        await env.LIC.put('user:' + user, JSON.stringify({
          user, nombre: (b.nombre || '').trim() || user, role: 'admin',
          salt, hash, createdAt: Date.now(), createdBy: yo.u,
        }));
        return json({ ok: true, user });
      }

      if (p === '/admin/usuarios/clave' && req.method === 'POST') {
        const b = await req.json().catch(() => ({}));
        const user = limpioUser(b.user) || yo.u;
        if (user !== yo.u && !dueño) return json({ error: 'Solo podés cambiar tu propia contraseña' }, 403);
        if (String(b.pass || '').length < 8) return json({ error: 'La contraseña necesita 8 caracteres o más' }, 400);
        const raw = await env.LIC.get('user:' + user);
        if (!raw) return json({ error: 'No existe esa cuenta' }, 404);
        const u = JSON.parse(raw);
        const { salt, hash } = await hashPass(b.pass);
        await env.LIC.put('user:' + user, JSON.stringify({ ...u, salt, hash }));
        return json({ ok: true });
      }

      if (p === '/admin/usuarios/borrar' && req.method === 'POST') {
        if (!dueño) return json({ error: 'Solo la dueña o el dueño borra cuentas' }, 403);
        const { user } = await req.json().catch(() => ({}));
        const u = limpioUser(user);
        if (u === yo.u) return json({ error: 'No podés borrar tu propia cuenta' }, 400);
        const raw = await env.LIC.get('user:' + u);
        if (!raw) return json({ error: 'No existe' }, 404);
        if (JSON.parse(raw).role === 'owner') return json({ error: 'No se puede borrar al dueño' }, 400);
        await env.LIC.delete('user:' + u);
        return json({ ok: true });
      }

      /* ---------- ventas ---------- */

      if (p === '/admin/nueva' && req.method === 'POST') {
        const { nombre, contacto, precio } = await req.json().catch(() => ({}));
        const code = newCode();
        const t = crypto.randomUUID().replace(/-/g, '');
        await env.LIC.put('lic:' + code, JSON.stringify({
          code, nombre: nombre || '', contacto: contacto || '',
          precio: +precio || 30000, createdAt: Date.now(), vendedor: yo.n || yo.u,
          device: '', activatedAt: 0, opens: 0, revoked: false,
          token: t,                       // para poder rearmar el mensaje después
        }));
        await env.LIC.put('dl:' + t, JSON.stringify({ code, exp: Date.now() + 30 * 864e5 }),
          { expirationTtl: 30 * 86400 });
        const link = url.origin + '/d/' + t;
        const info = await apkInfo(env);
        return json({
          code, link, apk: info.url, pwa: env.APP_URL, version: info.version,
          mensaje: mensajeEntrega({ code, link, apk: info.url, pwa: env.APP_URL, version: info.version, nombre }),
        });
      }

      /* rearmar el mensaje de entrega de una licencia que ya existe
         (para reenviárselo a alguien que lo perdió) */
      if (p === '/admin/entrega' && req.method === 'GET') {
        const code = String(url.searchParams.get('code') || '').trim().toUpperCase();
        const raw = await env.LIC.get('lic:' + code);
        if (!raw) return json({ error: 'No existe esa licencia' }, 404);
        const lic = JSON.parse(raw);
        let t = lic.token;
        if (!t) {                          // licencias viejas: se les hace un link nuevo
          t = crypto.randomUUID().replace(/-/g, '');
          lic.token = t;
          await env.LIC.put('lic:' + code, JSON.stringify(lic));
        }
        /* se refresca el link (o se rearma si venció): el código no cambia */
        await env.LIC.put('dl:' + t, JSON.stringify({
          code, exp: Date.now() + 30 * 864e5,
          claimedAt: lic.activatedAt || undefined,
        }), { expirationTtl: 30 * 86400 });
        const link = url.origin + '/d/' + t;
        const info = await apkInfo(env);
        return json({
          code, link, apk: info.url, pwa: env.APP_URL, version: info.version,
          nombre: lic.nombre || '', contacto: lic.contacto || '',
          mensaje: mensajeEntrega({
            code, link, apk: info.url, pwa: env.APP_URL, version: info.version, nombre: lic.nombre,
          }),
        });
      }

      if (p === '/admin/lista') {
        const ls = await env.LIC.list({ prefix: 'lic:' });
        const out = [];
        for (const k of ls.keys) out.push(JSON.parse(await env.LIC.get(k.name)));
        out.sort((a, b) => b.createdAt - a.createdAt);
        const porVendedor = {};
        out.forEach(l => {
          const v = l.vendedor || '—';
          const x = porVendedor[v] = porVendedor[v] || { vendidas: 0, activadas: 0, facturado: 0 };
          x.vendidas++;
          if (l.device) { x.activadas++; x.facturado += +l.precio || 0; }
        });
        return json({
          yo: { user: yo.u, nombre: yo.n, role: yo.role },
          total: out.length,
          activadas: out.filter(l => l.device).length,
          facturado: out.filter(l => l.device).reduce((s, l) => s + (+l.precio || 0), 0),
          porVendedor,
          licencias: out,
        });
      }

      if ((p === '/admin/reset' || p === '/admin/revocar') && req.method === 'POST') {
        const { code } = await req.json().catch(() => ({}));
        const raw = await env.LIC.get('lic:' + code);
        if (!raw) return json({ error: 'No existe' }, 404);
        const lic = JSON.parse(raw);
        if (p === '/admin/reset') { lic.device = ''; lic.activatedAt = 0; }
        else lic.revoked = !lic.revoked;
        await env.LIC.put('lic:' + code, JSON.stringify(lic));
        return json({ ok: true, lic });
      }
    }

    return json({ error: 'No encontrado' }, 404);
  },
};
