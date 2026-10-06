'use client';
/* ============================================================
   ACCESO · /login de TEXMA Planner
   ------------------------------------------------------------
   Dos caminos:
     · Google: Supabase Auth (OAuth). Vuelve a /login y el cliente
       lee la sesión de la URL; con sesión, se ofrece abrir la app.
       Requiere el proveedor Google activo en Supabase y /login en
       Authentication → URL Configuration → Redirect URLs.
     · Código de activación: el que se entrega al comprar (XXXX-XXXX-XXXX).
       El canje lo hace la PWA (queda atado a ESE celular), así que acá
       solo se valida el formato y se pasa a la app con ?codigo=.
============================================================ */
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, KeyRound, Loader2, LogOut, MessageCircle, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { esAdmin } from '@/lib/admin';
import { supabaseAuth } from '@/lib/supabase';
import Link from 'next/link';
import { SITIO, WA_COMPRAR_APP } from '@/lib/sitio';

const EASE = [0.22, 1, 0.36, 1] as const;

/* mismo formato que normCodigo() de la app: mayúsculas, guiones cada 4 */
const formatear = (v: string) =>
  v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12).match(/.{1,4}/g)?.join('-') ?? '';
const completo = (c: string) => /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c);

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
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');

  /* sesión actual + la que vuelve de Google */
  useEffect(() => {
    const sb = supabaseAuth();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setUsuario(data.session?.user ?? null));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setUsuario(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const entrarConGoogle = async () => {
    setError('');
    const sb = supabaseAuth();
    if (!sb) { setError('El acceso con Google todavía no está disponible. Usá tu código de activación.'); return; }
    setCargandoGoogle(true);
    const { error: e } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login`, queryParams: { prompt: 'select_account' } },
    });
    if (e) { setCargandoGoogle(false); setError('No pudimos conectar con Google. Probá de nuevo.'); }
    /* sin error, el navegador ya se fue a Google */
  };

  const salir = async () => { await supabaseAuth()?.auth.signOut(); setUsuario(null); };

  const activar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo(codigo)) { setError('El código tiene 12 caracteres: XXXX-XXXX-XXXX.'); return; }
    setError('');
    window.location.href = `${SITIO.pwa}/?codigo=${encodeURIComponent(codigo)}`;
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
          Iniciá sesión con tu cuenta de Google o activá la app con el código único que te mandamos al comprarla.
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

        {usuario ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-2xl bg-lino px-4 py-3 text-sm">
              Sesión iniciada como <b className="break-all">{usuario.email}</b>
            </p>
            <a href={SITIO.pwa}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.3)] transition hover:bg-rosa-oscuro">
              Abrir TEXMA Planner <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            {esAdmin(usuario.email) && (
              <Link href="/admin" className="flex w-full items-center justify-center rounded-full bg-tinta px-6 py-3.5 font-bold text-papel transition hover:bg-rosa">
                Ir al panel de administración
              </Link>
            )}
            <button type="button" onClick={salir}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-linea px-6 py-3 text-sm font-semibold text-tinta-suave transition hover:border-tinta hover:text-tinta">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        ) : (
          <button type="button" onClick={entrarConGoogle} disabled={cargandoGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-linea bg-white px-6 py-4 font-bold text-tinta shadow-sm transition hover:border-tinta/40 hover:shadow-md disabled:cursor-wait disabled:opacity-70">
            {cargandoGoogle ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LogoGoogle />}
            Iniciar sesión con Google
          </button>
        )}

        <div className="my-7 flex items-center gap-4 text-tinta-suave" aria-hidden="true">
          <span className="h-px flex-1 bg-linea" /><span className="kicker">o</span><span className="h-px flex-1 bg-linea" />
        </div>

        <form onSubmit={activar} noValidate>
          <label htmlFor="codigo" className="block text-sm font-semibold">Código de activación único</label>
          <div className="relative mt-2">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
            <input id="codigo" value={codigo} onChange={e => { setCodigo(formatear(e.target.value)); setError(''); }}
              placeholder="XXXX-XXXX-XXXX" inputMode="text" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false}
              maxLength={14} aria-invalid={!!error} aria-describedby="codigo-ayuda"
              className="w-full rounded-2xl border border-linea bg-lino py-4 pl-12 pr-4 font-mono text-lg tracking-[.2em] outline-none transition placeholder:text-tinta-suave/50 focus:border-rosa focus:bg-white focus:ring-4 focus:ring-rosa/10" />
          </div>
          <p id="codigo-ayuda" className="mt-2 text-xs text-tinta-suave">Te lo mandamos por WhatsApp cuando compraste la app.</p>
          <button type="submit" disabled={!completo(codigo)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-tinta px-6 py-4 font-bold text-papel transition hover:bg-rosa disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-tinta">
            Activar la app <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {error && <p className="mt-4 text-sm font-semibold text-[#B3261E]" role="alert">{error}</p>}

        <p className="mt-7 border-t border-linea pt-5 text-center text-sm text-tinta-suave">
          ¿Todavía no la tenés?{' '}
          <a href={WA_COMPRAR_APP} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-bold text-rosa hover:underline">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comprala por WhatsApp
          </a>
        </p>
      </motion.section>
    </div>
  );
}
