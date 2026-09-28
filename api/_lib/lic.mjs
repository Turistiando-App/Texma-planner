/* ============================================================
   TEXMA · lo compartido por las funciones de /api (Vercel)
   ------------------------------------------------------------
   Los archivos que empiezan con _ no se publican como ruta.

   Variables de entorno (en local van en .env, en Vercel en
   Project → Settings → Environment Variables):
     SUPABASE_URL           https://xxxx.supabase.co
     SUPABASE_SERVICE_ROLE  service_role (escribe salteando el RLS)
     ADMIN_PASS             contraseña del panel /admin
     LIC_PRIV               JWK privada de firma (server/keygen.mjs)
     APP_ID                 opcional · 'texma'
     APP_URL                opcional · dónde está la PWA (por defecto, este mismo sitio)
     APK_URL                opcional · respaldo si no hay APK en la tabla apps
============================================================ */
import { webcrypto as crypto, createHash, timingSafeEqual } from 'node:crypto';

export const env = k => {
  const v = process.env[k];
  return v == null ? '' : String(v).replace(/^﻿/, '').trim();
};
export const APP_ID = () => env('APP_ID') || 'texma';

export const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,authorization',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
};
export const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS },
});
export const preflight = () => new Response(null, { status: 204, headers: CORS });
export const leerJson = req => req.json().catch(() => ({}));

const enc = new TextEncoder();
export const b64u = buf => Buffer.from(buf).toString('base64url');
export const unb64u = s => new Uint8Array(Buffer.from(String(s), 'base64url'));

/* ---------- origen público (para armar los links) ---------- */
export function origen(req) {
  const u = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || u.host;
  const proto = req.headers.get('x-forwarded-proto') || u.protocol.replace(':', '');
  return `${proto}://${host}`;
}
export const appUrl = req => env('APP_URL') || origen(req) + '/';

/* ============================================================
   SUPABASE (REST directo, sin dependencias)
============================================================ */
export async function db(path, { method = 'GET', body, prefer } = {}) {
  const url = env('SUPABASE_URL').replace(/\/+$/, '');
  const key = env('SUPABASE_SERVICE_ROLE');
  if (!url || !key) throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE en el servidor');
  const headers = { apikey: key, 'content-type': 'application/json' };
  /* las keys viejas (JWT) van también como Bearer; las nuevas sb_secret_… no */
  if (key.startsWith('eyJ')) headers.authorization = 'Bearer ' + key;
  if (prefer) headers.prefer = prefer;
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const txt = await r.text();
  let j = null;
  try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = txt; }
  if (!r.ok) {
    const err = new Error((j && j.message) || `Supabase respondió ${r.status}`);
    err.code = j && j.code;
    throw err;
  }
  return j;
}
const q = encodeURIComponent;
export async function licPorCodigo(code) {
  const rows = await db(`licenses?code=eq.${q(code)}&select=*`);
  return rows[0] || null;
}
export async function licPorToken(t) {
  const rows = await db(`licenses?claim_token=eq.${q(t)}&select=*`);
  return rows[0] || null;
}
export async function licPatch(filtro, cambios) {
  return db(`licenses?${filtro}`, { method: 'PATCH', body: cambios, prefer: 'return=representation' });
}

/* ---------- la versión publicada (APK) · tabla apps ---------- */
let apkCache = null;
export async function apkInfo() {
  if (apkCache && Date.now() - apkCache.ts < 6e5) return apkCache.v;
  const v = { version: '', url: env('APK_URL') };
  try {
    const rows = await db(`apps?id=eq.${q(APP_ID())}&select=version,url_descarga`);
    if (rows[0]) {
      v.version = rows[0].version || '';
      v.url = rows[0].url_descarga || v.url;
    }
  } catch (e) { /* Supabase dormido: queda el APK_URL de respaldo */ }
  apkCache = { ts: Date.now(), v };
  return v;
}

/* ============================================================
   LICENCIAS
============================================================ */
/* código legible tipo TXM4-9K2P-7QW1 (sin letras confundibles) */
export function newCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const g = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => A[b % A.length]).join('');
  return `${g()}-${g()}-${g()}`;
}
export const newClaimToken = () => crypto.randomUUID().replace(/-/g, '');
export const TOKEN_RE = /^[a-f0-9]{16,64}$/i;

/* firma ECDSA P-256 · la app la verifica offline con LIC_PUB */
export async function signToken(payload) {
  const raw = env('LIC_PRIV');
  if (!raw) throw new Error('Falta LIC_PRIV en el servidor (.env local o Environment Variables de Vercel)');
  let jwk;
  try { jwk = JSON.parse(raw.replace(/^'|'$/g, '')); }
  catch (e) { throw new Error('LIC_PRIV no es un JSON válido: pegala en una sola línea entre comillas simples'); }
  if (!jwk.d) throw new Error('LIC_PRIV no tiene el campo "d": pegaste la pública en vez de la privada');
  const key = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(body));
  return body + '.' + b64u(sig);
}

/* ============================================================
   SESIÓN DEL PANEL
   ------------------------------------------------------------
   Una sola contraseña: ADMIN_PASS. La sesión es un HMAC firmado con
   una clave que sale de esa contraseña, así que cambiar ADMIN_PASS
   cierra todas las sesiones abiertas.
============================================================ */
const sha = s => createHash('sha256').update(String(s), 'utf8').digest();

export function passOk(pass) {
  const real = env('ADMIN_PASS');
  if (!real) return false;
  return timingSafeEqual(sha(pass), sha(real));   // mismo largo siempre (32 bytes)
}
async function sessKey() {
  return crypto.subtle.importKey(
    'raw', sha('texma-panel:' + env('ADMIN_PASS')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
}
export async function makeSession(nombre) {
  const p = b64u(enc.encode(JSON.stringify({ n: nombre, exp: Date.now() + 30 * 864e5 })));
  const sig = b64u(await crypto.subtle.sign('HMAC', await sessKey(), enc.encode(p)));
  return p + '.' + sig;
}
export async function session(req) {
  if (!env('ADMIN_PASS')) return null;
  const raw = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  const [p, sig] = raw.split('.');
  if (!p || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await sessKey(), unb64u(sig), enc.encode(p));
    if (!ok) return null;
    const d = JSON.parse(new TextDecoder().decode(unb64u(p)));
    return Date.now() > d.exp ? null : d;
  } catch (e) { return null; }
}

/* ---------- el mensaje que la vendedora le manda a la clienta ---------- */
export function mensajeEntrega({ code, link, apk, pwa, version, nombre }) {
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
