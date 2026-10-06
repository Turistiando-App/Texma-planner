'use client';
/* Métricas: ventas, balance, usuarias activas y tickets pendientes. */
import { RefreshCw, ShoppingBag, Ticket, Users, Wallet, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Metricas } from '@/lib/admin';
import { pesos } from '@/lib/sitio';
import { Aviso, Titulo, type Api } from './ui';

function Tarjeta({ t, v, sub, i: Icono, acento }: { t: string; v: string; sub: string; i: LucideIcon; acento: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] p-6">
      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${acento}`} />
      <div className="relative flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-400">{t}</p>
        <Icono className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      </div>
      <p className="relative mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{v}</p>
      <p className="relative mt-2 text-xs text-neutral-500">{sub}</p>
    </div>
  );
}

export default function MetricasAdmin({ api }: { api: Api }) {
  const [m, setM] = useState<Metricas | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try { setM(await api<Metricas>('metricas')); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
    finally { setCargando(false); }
  }, [api]);
  useEffect(() => { cargar(); }, [cargar]);

  const tarjetas = m ? [
    { t: 'Ventas totales', v: String(m.ventas), sub: `${m.pendientes} sin activar todavía`, i: ShoppingBag, acento: 'bg-rosa/25' },
    { t: 'Balance', v: pesos(m.facturado), sub: `${pesos(m.facturadoMes)} este mes`, i: Wallet, acento: 'bg-emerald-500/20' },
    { t: 'Usuarias activas', v: String(m.activas30), sub: `abrieron la app en 30 días · ${m.activas} activadas`, i: Users, acento: 'bg-sky-500/20' },
    { t: 'Tickets pendientes', v: String(m.ticketsPendientes), sub: 'consultas sin resolver', i: Ticket, acento: 'bg-amber-500/20' },
  ] : [];

  return (
    <section>
      <Titulo kicker="Resumen" t="Métricas">
        <button onClick={cargar} disabled={cargando}
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-white/30 hover:text-white disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" /> Actualizar
        </button>
      </Titulo>
      <Aviso error={error} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {m
          ? tarjetas.map(c => <Tarjeta key={c.t} {...c} />)
          : Array.from({ length: 4 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[.03]" />)}
      </div>
      <p className="mt-6 text-xs text-neutral-600">El balance suma el precio de cada licencia cuando se activa en un celular (igual que el panel de licencias de la app).</p>
    </section>
  );
}
