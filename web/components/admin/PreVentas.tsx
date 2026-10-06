'use client';
/* Pre-ventas: los leads que dejan sus datos en /checkout antes de ir al
   WhatsApp de María. «Generar licencia» abre el generador con la clienta
   y el contacto ya cargados; al crear el código, el lead pasa solo a
   «Código enviado» con el código vinculado. El estado también se cambia
   a mano (optimista: si el servidor falla, vuelve atrás). */
import { CircleCheck, Clock, Inbox, KeyRound, Mail, MessageCircle, RefreshCw, Undo2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Prefill, PreVenta } from '@/lib/admin';
import { Aviso, fecha, Titulo, type Api } from './ui';

type Filtro = 'todos' | PreVenta['estado'];
const FILTROS: { id: Filtro; t: string }[] = [
  { id: 'pendiente', t: 'Nuevas' },
  { id: 'vendida', t: 'Código enviado' },
  { id: 'descartada', t: 'Descartadas' },
  { id: 'todos', t: 'Todas' },
];

const ESTADO: Record<PreVenta['estado'], { t: string; c: string; I: typeof Clock }> = {
  pendiente: { t: 'Nueva', c: 'border-amber-400/30 bg-amber-400/10 text-amber-300', I: Clock },
  vendida: { t: 'Código enviado', c: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', I: CircleCheck },
  descartada: { t: 'Descartada', c: 'border-white/10 bg-white/[.04] text-neutral-400', I: X },
};

/* mismo criterio que el generador: un número argentino sin 54 se completa */
function waDe(celular: string) {
  let d = celular.replace(/\D/g, '');
  if (d.length < 8) return null;
  if (!d.startsWith('54')) d = `549${d.replace(/^0/, '')}`;
  return d;
}

const accion = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

export default function PreVentas({ api, onGenerar }: { api: Api; onGenerar: (p: Prefill) => void }) {
  const [lista, setLista] = useState<PreVenta[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try { setLista(await api<PreVenta[]>('pre-ventas')); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
  }, [api]);
  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = async (p: PreVenta, estado: PreVenta['estado']) => {
    setLista(v => v?.map(x => (x.id === p.id ? { ...x, estado } : x)) ?? v);
    try {
      const act = await api<PreVenta>('pre-ventas', { method: 'PATCH', body: JSON.stringify({ id: p.id, estado }) });
      setLista(v => v?.map(x => (x.id === p.id ? act : x)) ?? v);
    } catch (e) {
      setLista(v => v?.map(x => (x.id === p.id ? p : x)) ?? v);
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const visibles = (lista ?? []).filter(p => filtro === 'todos' || p.estado === filtro);
  const cuenta = (f: Filtro) => (lista ?? []).filter(p => f === 'todos' || p.estado === f).length;

  return (
    <section>
      <Titulo kicker="Ventas" t="Pre-ventas">
        <button onClick={cargar} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-white/30 hover:text-white">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
        </button>
      </Titulo>
      <p className="mt-3 max-w-2xl text-sm text-neutral-500">
        Quienes completaron el formulario de compra. Generá la licencia desde acá: el lead pasa solo a «Código enviado».
      </p>

      <div className="mt-8 inline-flex flex-wrap rounded-full border border-white/10 bg-white/[.03] p-1" role="tablist">
        {FILTROS.map(f => (
          <button key={f.id} role="tab" aria-selected={filtro === f.id} onClick={() => setFiltro(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filtro === f.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
            {f.t} <span className="ml-1 font-mono text-xs opacity-60">{cuenta(f.id)}</span>
          </button>
        ))}
      </div>
      <Aviso error={error} />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-white/[.03] font-mono text-[11px] uppercase tracking-[.15em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Celular</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista === null && <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">Cargando…</td></tr>}
            {lista !== null && visibles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-14 text-center text-neutral-500">
                <Inbox className="mx-auto mb-3 h-6 w-6" aria-hidden="true" />No hay pre-ventas acá.
              </td></tr>
            )}
            {visibles.map(p => {
              const e = ESTADO[p.estado];
              const wa = waDe(p.celular);
              return (
                <tr key={p.id} className="align-middle hover:bg-white/[.02]">
                  <td className="whitespace-nowrap px-4 py-4 text-neutral-500">{fecha(p.created_at)}</td>
                  <td className="px-4 py-4 font-semibold text-neutral-100">{p.nombre} {p.apellido}</td>
                  <td className="px-4 py-4">
                    <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white">
                      <Mail className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />{p.email}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {wa
                      ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-mono text-neutral-300 hover:text-emerald-300">
                          <MessageCircle className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />{p.celular}
                        </a>
                      : <span className="font-mono text-neutral-400">{p.celular}</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${e.c}`}>
                      <e.I className="h-3.5 w-3.5" aria-hidden="true" /> {e.t}
                    </span>
                    {p.license_code && <span className="mt-1 block font-mono text-xs text-neutral-500">{p.license_code}</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {!p.license_code && p.estado !== 'descartada' && (
                        <button onClick={() => onGenerar({ leadId: p.id, nombre: `${p.nombre} ${p.apellido}`.trim(), contacto: p.celular || p.email, email: p.email })}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rosa-oscuro">
                          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" /> Generar licencia
                        </button>
                      )}
                      {p.estado === 'pendiente' && (
                        <button onClick={() => cambiar(p, 'vendida')} className={`${accion} border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10`}>
                          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> Código enviado
                        </button>
                      )}
                      {p.estado === 'pendiente' && (
                        <button onClick={() => cambiar(p, 'descartada')} title="Descartar" aria-label={`Descartar a ${p.nombre}`}
                          className={`${accion} border-white/10 text-neutral-400 hover:text-white`}>
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                      {p.estado !== 'pendiente' && (
                        <button onClick={() => cambiar(p, 'pendiente')} className={`${accion} border-white/10 text-neutral-400 hover:text-white`}>
                          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Volver a nueva
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
