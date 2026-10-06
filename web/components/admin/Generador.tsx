'use client';
/* Generador de códigos: crea una licencia nueva en `licenses` para una
   clienta y la deja lista para mandar por WhatsApp. Abajo, las últimas. */
import { Check, Copy, KeyRound, LoaderCircle, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Licencia } from '@/lib/admin';
import { pesos, SITIO } from '@/lib/sitio';
import { Aviso, fecha, Titulo, type Api } from './ui';

const ESTADO: Record<Licencia['status'], { t: string; c: string }> = {
  pending: { t: 'Sin activar', c: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
  active: { t: 'Activa', c: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  revoked: { t: 'Dada de baja', c: 'border-red-400/30 bg-red-400/10 text-red-300' },
};

const linkEntrega = (l: Licencia) => (l.claim_token ? `${SITIO.pwa}/d/${l.claim_token}` : '');

function mensaje(l: Licencia) {
  const hola = l.nombre ? `¡Hola ${l.nombre.split(/\s+/)[0]}!` : '¡Hola!';
  return `${hola} 💗 Acá va tu TEXMA.\n\nTu código de activación: ${l.code}\n\nEntrá por acá para instalarla y activarla:\n${linkEntrega(l) || SITIO.pwa}\n\nEl código queda atado a tu celular. ¡Que la disfrutes! ♥`;
}

/* wa.me necesita solo dígitos; un número argentino sin 54 se completa */
function waDe(contacto: string) {
  let d = contacto.replace(/\D/g, '');
  if (d.length < 8) return null;
  if (!d.startsWith('54')) d = `549${d.replace(/^0/, '')}`;
  return d;
}

const campo = 'w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-rosa focus:bg-white/[.06]';

export default function Generador({ api }: { api: Api }) {
  const [d, setD] = useState({ nombre: '', contacto: '', precio: '30000' });
  const [nueva, setNueva] = useState<Licencia | null>(null);
  const [lista, setLista] = useState<Licencia[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try { setLista(await api<Licencia[]>('licencias')); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
  }, [api]);
  useEffect(() => { cargar(); }, [cargar]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.nombre.trim()) { setError('Poné el nombre de la clienta.'); return; }
    setCreando(true); setError(''); setCopiado(false);
    try {
      const l = await api<Licencia>('licencias', { method: 'POST', body: JSON.stringify({ ...d, precio: +d.precio }) });
      setNueva(l);
      setLista(v => [l, ...(v ?? [])]);
      setD({ nombre: '', contacto: '', precio: d.precio });
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear'); }
    finally { setCreando(false); }
  };

  const copiar = async (l: Licencia) => {
    try { await navigator.clipboard.writeText(mensaje(l)); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch { /* sin permiso */ }
  };

  const wa = nueva && waDe(nueva.contacto);

  return (
    <section>
      <Titulo kicker="Licencias" t="Generador de códigos" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={crear} className="space-y-4 rounded-3xl border border-white/10 bg-white/[.03] p-6">
          <label className="block text-sm font-semibold text-neutral-300">Clienta
            <input className={`${campo} mt-2`} value={d.nombre} onChange={e => setD(v => ({ ...v, nombre: e.target.value }))} placeholder="Nombre y apellido" required />
          </label>
          <label className="block text-sm font-semibold text-neutral-300">WhatsApp o mail
            <input className={`${campo} mt-2`} value={d.contacto} onChange={e => setD(v => ({ ...v, contacto: e.target.value }))} placeholder="387 614-5611" />
          </label>
          <label className="block text-sm font-semibold text-neutral-300">Precio (ARS)
            <input className={`${campo} mt-2 font-mono`} inputMode="numeric" value={d.precio} onChange={e => setD(v => ({ ...v, precio: e.target.value.replace(/\D/g, '') }))} />
          </label>
          <button type="submit" disabled={creando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-3.5 font-semibold text-white shadow-[0_14px_40px_-12px_rgba(236,25,104,.7)] transition hover:bg-rosa-oscuro disabled:opacity-60">
            {creando ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
            Generar código único
          </button>
        </form>

        {/* ---- resultado ---- */}
        <div className="flex flex-col justify-center rounded-3xl border border-dashed border-white/15 p-6">
          {nueva ? (
            <div>
              <p className="text-sm text-neutral-400">Código para <b className="text-white">{nueva.nombre}</b></p>
              <p className="mt-3 select-all break-all font-mono text-3xl font-bold tracking-[.12em] text-white md:text-4xl">{nueva.code}</p>
              {linkEntrega(nueva) && <p className="mt-3 break-all font-mono text-xs text-neutral-500">{linkEntrega(nueva)}</p>}
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => copiar(nueva)} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5">
                  {copiado ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copiado ? 'Copiado' : 'Copiar mensaje'}
                </button>
                {wa && (
                  <a href={`https://wa.me/${wa}?text=${encodeURIComponent(mensaje(nueva))}`} target="_blank" rel="noopener"
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enviar por WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-neutral-500">El código nuevo aparece acá, listo para mandar.</p>
          )}
        </div>
      </div>
      <Aviso error={error} />

      {/* ---- últimas licencias ---- */}
      <h2 className="mt-12 text-lg font-semibold text-white">Últimas licencias</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[.03] font-mono text-[11px] uppercase tracking-[.15em] text-neutral-500">
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Clienta</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Creada</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista === null && <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Cargando…</td></tr>}
            {lista?.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Todavía no hay licencias.</td></tr>}
            {lista?.map(l => (
              <tr key={l.code} className="hover:bg-white/[.02]">
                <td className="px-4 py-3 font-mono text-white">{l.code}</td>
                <td className="px-4 py-3"><span className="text-neutral-200">{l.nombre || '—'}</span>{l.contacto && <span className="block text-xs text-neutral-500">{l.contacto}</span>}</td>
                <td className="px-4 py-3 font-mono text-neutral-300">{pesos(l.precio)}</td>
                <td className="px-4 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${ESTADO[l.status].c}`}>{ESTADO[l.status].t}</span></td>
                <td className="px-4 py-3 text-neutral-500">{fecha(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
