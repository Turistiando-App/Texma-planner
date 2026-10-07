/* ============================================================
   ADMIN · lo compartido por las rutas /api/admin/* (solo servidor)
   ------------------------------------------------------------
   1. verificarAdmin(): lee el Bearer (access_token de Supabase Auth),
      le pregunta a Supabase quién es y deja pasar solo a ADMIN_EMAILS.
   2. dbAdmin(): cliente con la SERVICE ROLE (saltea el RLS). La key
      vive en SUPABASE_SERVICE_ROLE, SIN NEXT_PUBLIC_: nunca llega al
      navegador. Este archivo no se importa desde componentes 'use client'.
============================================================ */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { webcrypto } from 'node:crypto';
import { esAdmin } from './admin';

const URL_SB = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export const json = (o: unknown, status = 200) =>
  Response.json(o, { status, headers: { 'cache-control': 'no-store' } });

let servicio: SupabaseClient | null = null;
export function dbAdmin(): SupabaseClient {
  if (servicio) return servicio;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!URL_SB() || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE en el servidor');
  servicio = createClient(URL_SB(), key, { auth: { persistSession: false, autoRefreshToken: false } });
  return servicio;
}

/* sesión de Google (Supabase Auth) de cualquier usuario: devuelve el
   usuario o la respuesta de error lista para devolver */
export async function verificarSesion(req: Request): Promise<{ email: string; nombre: string } | Response> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'Iniciá sesión con Google' }, 401);
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL_SB() || !anon) return json({ error: 'Supabase no está configurado' }, 500);
  const sb = createClient(URL_SB(), anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user?.email) return json({ error: 'Tu sesión venció. Volvé a iniciar sesión con Google.' }, 401);
  const meta = data.user.user_metadata || {};
  return { email: data.user.email, nombre: String(meta.full_name || meta.name || '').trim() };
}

/* null = pasa; si no, la respuesta de error lista para devolver */
export async function verificarAdmin(req: Request): Promise<Response | null> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'Sin sesión' }, 401);
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL_SB() || !anon) return json({ error: 'Supabase no está configurado' }, 500);
  const sb = createClient(URL_SB(), anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return json({ error: 'Sesión vencida' }, 401);
  if (!esAdmin(data.user.email)) return json({ error: 'No autorizado' }, 403);
  return null;
}

/* mismo formato que api/_lib/lic.mjs de la PWA: TXM4-9K2P-7QW1, sin letras confundibles */
export function nuevoCodigo() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const g = () => [...webcrypto.getRandomValues(new Uint8Array(4))].map(b => A[b % A.length]).join('');
  return `${g()}-${g()}-${g()}`;
}
export const nuevoClaimToken = () => webcrypto.randomUUID().replace(/-/g, '');

/* envuelve un handler: errores → JSON 500 con el mensaje */
export const seguro = (fn: (req: Request) => Promise<Response>) => async (req: Request) => {
  try { return await fn(req); }
  catch (e) {
    console.error('admin', e);
    return json({ error: e instanceof Error ? e.message : 'Error del servidor' }, 500);
  }
};
