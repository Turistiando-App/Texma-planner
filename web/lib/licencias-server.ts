/* ============================================================
   LICENCIAS · lo compartido por /api/activate y /api/claim (solo servidor)
   ------------------------------------------------------------
   Antes vivía en las funciones /api del proyecto de la PWA (raíz del
   repo). Con todo en un solo dominio, la PWA (/app) llama a estas
   rutas de Next. Variables de entorno (Vercel → este proyecto):
     NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE  (ya estaban)
     LIC_PRIV   JWK privada de firma ECDSA P-256 (la MISMA que usaba
                el proyecto viejo: si cambia, las licencias firmadas
                no validan contra LIC_PUBS de la app)
     APK_URL    opcional · respaldo si no hay APK en la tabla apps
============================================================ */
import { webcrypto } from 'node:crypto';
import { dbAdmin } from './admin-server';

/* el APK (Capacitor) llama desde https://localhost: necesita CORS */
export const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,authorization',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
};
export const jsonCors = (o: unknown, status = 200) =>
  Response.json(o, { status, headers: { 'cache-control': 'no-store', ...CORS } });
export const preflight = () => new Response(null, { status: 204, headers: CORS });

/* mensaje EXACTO del bloqueo por dispositivo (pedido explícito) */
export const BLOQUEO_DISPOSITIVO =
  'Parece que estás intentando entrar desde otro equipo o red. Por seguridad, enviá un ticket a texma.ok@gmail.com para resolver este tema.';

export const env = (k: string) => String(process.env[k] ?? '').replace(/^﻿/, '').trim();

const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf as ArrayBuffer).toString('base64url');

/* firma ECDSA P-256 · la app la verifica offline con LIC_PUBS */
export async function firmarLicencia(payload: Record<string, unknown>) {
  const raw = env('LIC_PRIV');
  if (!raw) throw new Error('Falta LIC_PRIV en el servidor (Environment Variables de Vercel)');
  let jwk: JsonWebKey;
  try { jwk = JSON.parse(raw.replace(/^'|'$/g, '')); }
  catch { throw new Error('LIC_PRIV no es un JSON válido: pegala en una sola línea'); }
  if (!jwk.d) throw new Error('LIC_PRIV no tiene el campo "d": pegaste la pública en vez de la privada');
  const key = await webcrypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = await webcrypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

/* la versión publicada del APK · tabla apps (cache de 10 min) */
let apkCache: { ts: number; v: { version: string; url: string } } | null = null;
export async function apkInfo() {
  if (apkCache && Date.now() - apkCache.ts < 6e5) return apkCache.v;
  const v = { version: '', url: env('APK_URL') };
  try {
    const { data } = await dbAdmin().from('apps').select('version,url_descarga').eq('id', 'texma').maybeSingle();
    if (data) { v.version = data.version || ''; v.url = data.url_descarga || v.url; }
  } catch { /* Supabase dormido: queda el APK_URL de respaldo */ }
  apkCache = { ts: Date.now(), v };
  return v;
}

/* origen público, para armar links absolutos */
export function origen(req: Request) {
  const u = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || u.host;
  const proto = req.headers.get('x-forwarded-proto') || u.protocol.replace(':', '');
  return `${proto}://${host}`;
}

export const ipDe = (req: Request) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
