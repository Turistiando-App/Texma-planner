import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* Cliente con la ANON key: solo puede LEER lo que el RLS deja (productos
   activos). Sirve igual en el servidor y en el navegador. Si faltan las
   variables, devuelve null y el sitio usa los productos de ejemplo. */
let cliente: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cliente = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cliente;
}

/* Cliente para el login (/login): este SÍ guarda la sesión en el navegador
   y lee la vuelta de Google desde la URL. Solo en el cliente. */
let clienteAuth: SupabaseClient | null | undefined;

export function supabaseAuth(): SupabaseClient | null {
  if (clienteAuth !== undefined) return clienteAuth;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  clienteAuth = url && key
    ? createClient(url, key, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } })
    : null;
  return clienteAuth;
}
