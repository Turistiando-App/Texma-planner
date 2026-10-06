'use client';
/* Soporte: consultas que entran por /contacto. El estado se cambia con
   un clic (optimista: si el servidor falla, vuelve atrás). */
import { CircleCheck, Clock, Inbox, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from '@/lib/admin';
import { Aviso, fecha, Titulo, type Api } from './ui';

type Filtro = 'todos' | Ticket['estado'];
const FILTROS: { id: Filtro; t: string }[] = [
  { id: 'pendiente', t: 'Pendientes' },
  { id: 'resuelto', t: 'Resueltos' },
  { id: 'todos', t: 'Todos' },
];

export default function Tickets({ api }: { api: Api }) {
  const [lista, setLista] = useState<Ticket[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try { setLista(await api<Ticket[]>('tickets')); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
  }, [api]);
  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = async (t: Ticket) => {
    const estado: Ticket['estado'] = t.estado === 'pendiente' ? 'resuelto' : 'pendiente';
    setLista(v => v?.map(x => (x.id === t.id ? { ...x, estado } : x)) ?? v);
    try {
      const act = await api<Ticket>('tickets', { method: 'PATCH', body: JSON.stringify({ id: t.id, estado }) });
      setLista(v => v?.map(x => (x.id === t.id ? act : x)) ?? v);
    } catch (e) {
      setLista(v => v?.map(x => (x.id === t.id ? t : x)) ?? v);
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const visibles = (lista ?? []).filter(t => filtro === 'todos' || t.estado === filtro);
  const cuenta = (f: Filtro) => (lista ?? []).filter(t => f === 'todos' || t.estado === f).length;

  return (
    <section>
      <Titulo kicker="Soporte" t="Consultas de clientas">
        <button onClick={cargar} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-white/30 hover:text-white">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
        </button>
      </Titulo>

      <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/[.03] p-1" role="tablist">
        {FILTROS.map(f => (
          <button key={f.id} role="tab" aria-selected={filtro === f.id} onClick={() => setFiltro(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filtro === f.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
            {f.t} <span className="ml-1 font-mono text-xs opacity-60">{cuenta(f.id)}</span>
          </button>
        ))}
      </div>
      <Aviso error={error} />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[.03] font-mono text-[11px] uppercase tracking-[.15em] text-neutral-500">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Clienta</th><th className="px-4 py-3">Motivo</th><th className="px-4 py-3">Mensaje</th><th className="px-4 py-3 text-right">Estado</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista === null && <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">Cargando…</td></tr>}
            {lista !== null && visibles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-14 text-center text-neutral-500">
                <Inbox className="mx-auto mb-3 h-6 w-6" aria-hidden="true" />No hay consultas acá.
              </td></tr>
            )}
            {visibles.map(t => (
              <tr key={t.id} className="align-top hover:bg-white/[.02]">
                <td className="whitespace-nowrap px-4 py-4 text-neutral-500">{fecha(t.created_at)}</td>
                <td className="px-4 py-4"><span className="font-semibold text-neutral-100">{t.nombre}</span>{t.contacto && <span className="block text-xs text-neutral-500">{t.contacto}</span>}</td>
                <td className="px-4 py-4 text-neutral-300">{t.motivo || '—'}</td>
                <td className="max-w-md px-4 py-4 text-neutral-400"><p className="line-clamp-3 whitespace-pre-line" title={t.mensaje}>{t.mensaje}</p></td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => cambiar(t)} title="Cambiar estado"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${t.estado === 'resuelto'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                      : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'}`}>
                    {t.estado === 'resuelto' ? <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
                    {t.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
