'use client';
/* ============================================================
   PANEL ADMIN · /admin
   ------------------------------------------------------------
   Guardia en el cliente (solo UX): sin sesión → /login; con sesión
   de otro mail → /. La protección real está en /api/admin/*, que
   valida el token contra Supabase y el mail en el servidor.
   Ocupa toda la pantalla (fixed) y tapa el header/footer del sitio.
============================================================ */
import { ChartColumn, KeyRound, LifeBuoy, LoaderCircle, LogOut, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { esAdmin } from '@/lib/admin';
import { supabaseAuth } from '@/lib/supabase';
import Generador from './Generador';
import MetricasAdmin from './MetricasAdmin';
import Tickets from './Tickets';
import type { Api } from './ui';

type Pestana = 'metricas' | 'codigos' | 'soporte';
const PESTANAS: { id: Pestana; t: string; i: LucideIcon }[] = [
  { id: 'metricas', t: 'Métricas', i: ChartColumn },
  { id: 'codigos', t: 'Códigos', i: KeyRound },
  { id: 'soporte', t: 'Soporte', i: LifeBuoy },
];

export default function PanelAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [pestana, setPestana] = useState<Pestana>('metricas');

  useEffect(() => {
    const sb = supabaseAuth();
    if (!sb) { router.replace('/'); return; }
    const revisar = (mail: string | null | undefined, conSesion: boolean) => {
      if (!conSesion) router.replace('/login');
      else if (!esAdmin(mail)) router.replace('/');
      else setEmail(mail ?? null);
    };
    sb.auth.getSession().then(({ data }) => revisar(data.session?.user.email, !!data.session));
    const { data } = sb.auth.onAuthStateChange((evento, s) => {
      if (evento === 'SIGNED_OUT') router.replace('/login');
      else if (s) revisar(s.user.email, true);
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  /* fetch con el token fresco de cada momento (Supabase lo renueva solo) */
  const api: Api = useCallback(async (ruta, init) => {
    const { data } = await supabaseAuth()!.auth.getSession();
    const r = await fetch(`/api/admin/${ruta}`, {
      ...init,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}`, ...init?.headers },
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) router.replace('/login');
    if (r.status === 403) router.replace('/');
    if (!r.ok) throw new Error(j.error || `Error ${r.status}`);
    return j;
  }, [router]);

  const salir = () => supabaseAuth()?.auth.signOut();

  if (!email) {
    return (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0A0A0A] text-neutral-500">
        <LoaderCircle className="h-6 w-6 animate-spin" aria-label="Verificando acceso" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#0A0A0A] font-sans text-neutral-200 md:flex-row">
      {/* ---- sidebar (desktop) / barra de arriba (mobile) ---- */}
      <aside className="flex shrink-0 flex-col border-b border-white/10 bg-[#0E0E0F] md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:py-7">
          <Link href="/" className="font-serif text-2xl font-bold italic text-white"><span className="text-rosa">T</span>EXMA <span className="ml-1 align-middle font-mono text-[10px] not-italic tracking-[.2em] text-neutral-500">ADMIN</span></Link>
          <button onClick={salir} className="grid h-9 w-9 place-items-center rounded-xl text-neutral-500 hover:bg-white/5 hover:text-white md:hidden" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0" aria-label="Secciones del panel">
          {PESTANAS.map(p => (
            <button key={p.id} onClick={() => setPestana(p.id)} aria-current={pestana === p.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${pestana === p.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
              <p.i className={`h-4 w-4 ${pestana === p.id ? 'text-rosa' : ''}`} aria-hidden="true" /> {p.t}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 p-4 md:block">
          <p className="truncate text-xs text-neutral-500">{email}</p>
          <button onClick={salir} className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ---- contenido ---- */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
          {pestana === 'metricas' && <MetricasAdmin api={api} />}
          {pestana === 'codigos' && <Generador api={api} />}
          {pestana === 'soporte' && <Tickets api={api} />}
        </div>
      </main>
    </div>
  );
}
