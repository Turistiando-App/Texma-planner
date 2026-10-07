'use client';
/* Generador de códigos: crea una licencia nueva en `licenses` para una
   clienta y la deja lista para mandar por WhatsApp. Abajo, las últimas.
   Si viene de Pre-ventas («Generar licencia»), llega `inicial` con la
   clienta y el contacto ya cargados; al crear el código, el lead pasa a
   «Código enviado» con el código vinculado. */
import { Ban, Check, Copy, KeyRound, LoaderCircle, MessageCircle, MoreHorizontal, RotateCcw, Unlink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Licencia, Prefill } from '@/lib/admin';
import { pesos, PWA_URL, SITIO } from '@/lib/sitio';
import { Aviso, fecha, Titulo, type Api } from './ui';

const ESTADO: Record<Licencia['status'], { t: string; c: string }> = {
  pending: { t: 'Sin activar', c: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
  active: { t: 'Activa', c: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  revoked: { t: 'Baneada', c: 'border-red-400/30 bg-red-400/10 text-red-300' },
};

const linkEntrega = (l: Licencia) => (l.claim_token ? `${SITIO.url}/d/${l.claim_token}` : '');

function mensaje(l: Licencia) {
  const hola = l.nombre ? `¡Hola ${l.nombre.split(/\s+/)[0]}!` : '¡Hola!';
  return `${hola} 💗 Acá va tu TEXMA.\n\nTu código de activación: ${l.code}\n\nEntrá por acá para instalarla y activarla:\n${linkEntrega(l) || PWA_URL}\n\nEl código queda atado a tu celular. ¡Que la disfrutes! ♥`;
}

/* wa.me necesita solo dígitos; un número argentino sin 54 se completa */
function waDe(contacto: string) {
  let d = contacto.replace(/\D/g, '');
  if (d.length < 8) return null;
  if (!d.startsWith('54')) d = `549${d.replace(/^0/, '')}`;
  return d;
}

const ITEM = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/[.06]';
const campo = 'w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-rosa focus:bg-white/[.06]';

export default function Generador({ api, inicial, onUsado }: { api: Api; inicial?: Prefill | null; onUsado?: () => void }) {
  const [d, setD] = useState({ nombre: inicial?.nombre ?? '', contacto: inicial?.contacto ?? '', precio: '30000' });
  const [lead, setLead] = useState<Prefill | null>(inicial ?? null);
  const [nueva, setNueva] = useState<Licencia | null>(null);
  const [lista, setLista] = useState<Licencia[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState<string | null>(null);   // código con el menú de acciones abierto

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
      const l = await api<Licencia>('licencias', { method: 'POST', body: JSON.stringify({ ...d, precio: +d.precio, email: lead?.email }) });
      setNueva(l);
      setLista(v => [l, ...(v ?? [])]);
      setD({ nombre: '', contacto: '', precio: d.precio });
      if (lead) {
        /* el código ya existe: si esto falla, se avisa pero no se pierde nada */
        try { await api('pre-ventas', { method: 'PATCH', body: JSON.stringify({ id: lead.leadId, estado: 'vendida', license_code: l.code }) }); }
        catch { setError('El código se creó, pero no pude marcar la pre-venta. Marcala a mano en Pre-ventas.'); }
        setLead(null); onUsado?.();
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear'); }
    finally { setCreando(false); }
  };

  /* acciones de cada licencia (menú «⋯» de la tabla) */
  const accion = async (l: Licencia, accion: 'liberar' | 'banear' | 'desbanear', pregunta: string) => {
    setMenu(null);
    if (!window.confirm(pregunta)) return;
    setError('');
    try {
      const act = await api<Licencia>('licencias', { method: 'PATCH', body: JSON.stringify({ code: l.code, accion }) });
      setLista(v => v?.map(x => (x.code === l.code ? act : x)) ?? v);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cambiar la licencia'); }
  };
  const quien = (l: Licencia) => `${l.code}${l.nombre ? ` (${l.nombre})` : ''}`;
  /* respuesta a un ticket de «otro equipo o red»: suelta el dispositivo */
  const liberar = (l: Licencia) => accion(l, 'liberar',
    `¿Liberar el dispositivo de ${quien(l)}? Podrá activarla en otro equipo y el anterior queda afuera la próxima vez que pida activar.`);
  const banear = (l: Licencia) => accion(l, 'banear',
    `¿Banear ${quien(l)}? El código queda inutilizado: nadie más lo puede activar. (Un dispositivo que ya la tenía activada sigue andando sin internet hasta que se reinstale la app.)`);
  const desbanear = (l: Licencia) => accion(l, 'desbanear', `¿Volver a habilitar ${quien(l)}? Queda «Sin activar» y sin dispositivo.`);

  const copiar = async (l: Licencia) => {
    try { await navigator.clipboard.writeText(mensaje(l)); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch { /* sin permiso */ }
  };

  const wa = nueva && waDe(nueva.contacto);

  return (
    <section>
      <Titulo kicker="Licencias" t="Generador de códigos" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={crear} className="space-y-4 rounded-3xl border border-white/10 bg-white/[.03] p-6">
          {lead && (
            <p className="flex items-center justify-between gap-3 rounded-xl border border-rosa/30 bg-rosa/10 px-4 py-2.5 text-xs text-rosa-claro">
              <span>Datos cargados desde la pre-venta de <b className="text-white">{lead.nombre}</b>.</span>
              <button type="button" onClick={() => { setLead(null); onUsado?.(); setD(v => ({ ...v, nombre: '', contacto: '' })); }}
                className="shrink-0 font-semibold text-neutral-400 hover:text-white">Quitar</button>
            </p>
          )}
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
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Clienta</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Creada</th><th className="px-4 py-3">Dispositivo</th><th className="px-4 py-3 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista === null && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Cargando…</td></tr>}
            {lista?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Todavía no hay licencias.</td></tr>}
            {lista?.map(l => (
              <tr key={l.code} className="hover:bg-white/[.02]">
                <td className="px-4 py-3 font-mono text-white">{l.code}</td>
                <td className="px-4 py-3"><span className="text-neutral-200">{l.nombre || '—'}</span>{l.contacto && <span className="block text-xs text-neutral-500">{l.contacto}</span>}{l.email && <span className="block text-xs text-neutral-500">{l.email}</span>}</td>
                <td className="px-4 py-3 font-mono text-neutral-300">{pesos(l.precio)}</td>
                <td className="px-4 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${ESTADO[l.status].c}`}>{ESTADO[l.status].t}</span></td>
                <td className="px-4 py-3 text-neutral-500">{fecha(l.created_at)}</td>
                <td className="px-4 py-3 text-xs">{l.device ? <span className="text-neutral-400">atada</span> : <span className="text-neutral-600">libre</span>}</td>
                <td className="relative px-4 py-3 text-right">
                  <button onClick={() => setMenu(m => (m === l.code ? null : l.code))} aria-haspopup="menu" aria-expanded={menu === l.code}
                    aria-label={`Acciones de ${l.code}`}
                    className="inline-grid h-8 w-8 place-items-center rounded-full border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {menu === l.code && (
                    <>
                      {/* clic afuera cierra */}
                      <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} aria-hidden="true" />
                      <div role="menu" className="absolute right-4 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#141416] p-1.5 text-left shadow-2xl">
                        {waDe(l.contacto) ? (
                          <a role="menuitem" href={`https://wa.me/${waDe(l.contacto)}?text=${encodeURIComponent(mensaje(l))}`} target="_blank" rel="noopener"
                            onClick={() => setMenu(null)} className={ITEM}>
                            <MessageCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Reenviar por WhatsApp
                          </a>
                        ) : (
                          <span className={`${ITEM} cursor-not-allowed opacity-40`} title="La licencia no tiene un número de WhatsApp en «contacto»">
                            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Reenviar por WhatsApp
                          </span>
                        )}
                        <button role="menuitem" onClick={() => { setMenu(null); copiar(l); }} className={ITEM}>
                          <Copy className="h-4 w-4" aria-hidden="true" /> Copiar mensaje
                        </button>
                        {l.device && l.status !== 'revoked' && (
                          <button role="menuitem" onClick={() => liberar(l)} className={ITEM}>
                            <Unlink className="h-4 w-4" aria-hidden="true" /> Liberar dispositivo
                          </button>
                        )}
                        {l.status === 'revoked' ? (
                          <button role="menuitem" onClick={() => desbanear(l)} className={ITEM}>
                            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Volver a habilitar
                          </button>
                        ) : (
                          <button role="menuitem" onClick={() => banear(l)} className={`${ITEM} text-red-300 hover:bg-red-500/10`}>
                            <Ban className="h-4 w-4" aria-hidden="true" /> Banear código
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
