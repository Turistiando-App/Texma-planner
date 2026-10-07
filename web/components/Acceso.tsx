'use client';
/* ============================================================
   ACCESO · /login de TEXMA Planner
   ------------------------------------------------------------
   Un solo paso: iniciar sesión con Google (Supabase Auth, OAuth).
   Al volver con sesión se redirige SOLO a /app (la PWA, en este mismo
   dominio) o a ?next= si viene (ej. /admin). El código de activación
   NO se pide acá: lo pide, valida y canjea la PWA en su pantalla de
   activación, atándolo al mail de esta sesión y a ese dispositivo.
   Requiere el proveedor Google activo en Supabase y /login en
   Authentication → URL Configuration → Redirect URLs.
============================================================ */
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, MessageCircle, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabaseAuth } from '@/lib/supabase';
import { COMPRAR_APP } from '@/lib/sitio';

const EASE = [0.22, 1, 0.36, 1] as const;

/* adónde ir después del login: solo rutas internas (nada de //otro-sitio) */
function destino() {
  const n = new URLSearchParams(window.location.search).get('next') || '';
  return /^\/(?![/\\])/.test(n) ? n : '/app';
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  );
}

const PUNTOS = [
  { t: 'Tu taller en el celular', d: 'Medidas, entregas, cobros y stock en un solo lugar.', i: Smartphone },
  { t: 'Funciona sin internet', d: 'Una vez activada, la usás donde quieras.', i: WifiOff },
  { t: 'Tus datos, tuyos', d: 'Todo queda guardado en tu dispositivo.', i: ShieldCheck },
];

export default function Acceso() {
  const quieto = useReducedMotion();
  const [entrando, setEntrando] = useState(false);       // sesión lista, redirigiendo
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [error, setError] = useState('');

  /* sesión actual o la que vuelve de Google → directo a la app */
  useEffect(() => {
    const sb = supabaseAuth();
    if (!sb) return;
    const ir = () => { setEntrando(true); window.location.replace(destino()); };
    sb.auth.getSession().then(({ data }) => { if (data.session) ir(); });
    const { data } = sb.auth.onAuthStateChange((_e, s) => { if (s) ir(); });
    return () => data.subscription.unsubscribe();
  }, []);

  const entrarConGoogle = async () => {
    setError('');
    const sb = supabaseAuth();
    if (!sb) { console.error('[Acceso] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'); setError('No pudimos conectar con Google. Probá de nuevo.'); return; }
    setCargandoGoogle(true);
    const vuelta = `${window.location.origin}/login?next=${encodeURIComponent(destino())}`;
    const { error: e } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: vuelta, queryParams: { prompt: 'select_account' } },
    });
    if (e) { setCargandoGoogle(false); setError('No pudimos conectar con Google. Probá de nuevo.'); }
    /* sin error, el navegador ya se fue a Google */
  };

  const entrar = (d: number) => quieto
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: d, ease: EASE } };

  return (
    <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-5 pb-16 pt-24 md:pt-28 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
      {/* ---- explicación ---- */}
      <motion.div {...entrar(0)} className="order-2 lg:order-1">
        <p className="kicker text-rosa">Acceso</p>
        <h1 className="titulo mt-3 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Entrá a TEXMA Planner.</h1>
        <p className="mt-5 max-w-lg text-base text-tinta-suave sm:text-lg">
          Iniciá sesión con tu cuenta de Google. Si es tu primera vez, la app te va a pedir el código único que te mandamos al comprarla.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {PUNTOS.map(p => (
            <li key={p.t} className="flex items-start gap-3 rounded-2xl border border-linea bg-papel/70 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rosa-claro text-rosa-oscuro">
                <p.i className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">{p.t}</span>
                <span className="block text-sm text-tinta-suave">{p.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ---- tarjeta de acceso ---- */}
      <motion.section {...entrar(0.1)} aria-labelledby="acceso"
        className="order-1 w-full rounded-[2rem] border border-linea bg-white p-6 shadow-[0_30px_80px_-30px_rgba(43,38,34,.3)] sm:p-9 lg:order-2">
        <h2 id="acceso" className="text-xl font-bold">Acceso a tu cuenta</h2>

        {entrando ? (
          <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-lino px-4 py-4 text-sm font-semibold" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Entrando a la app…
          </p>
        ) : (
          <button type="button" onClick={entrarConGoogle} disabled={cargandoGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-linea bg-white px-6 py-4 font-bold text-tinta shadow-sm transition hover:border-tinta/40 hover:shadow-md disabled:cursor-wait disabled:opacity-70">
            {cargandoGoogle ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LogoGoogle />}
            Iniciar sesión con Google
          </button>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-[#B3261E]" role="alert">{error}</p>}

        <p className="mt-5 text-center text-xs text-tinta-suave">
          Tu cuenta de Google queda asociada a tu licencia y a este dispositivo.
        </p>

        <p className="mt-7 border-t border-linea pt-5 text-center text-sm text-tinta-suave">
          ¿Todavía no la tenés?{' '}
          <a href={COMPRAR_APP} className="inline-flex items-center gap-1 font-bold text-rosa hover:underline">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comprala acá
          </a>
        </p>
      </motion.section>
    </div>
  );
}
