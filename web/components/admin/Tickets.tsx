'use client';
/* ============================================================
   SOPORTE · tickets que entran por /contacto (con sesión de Google)
   ------------------------------------------------------------
   Cada ticket muestra fecha, cliente, mail, motivo, mensaje y estado.
   «Responder» abre un panel: al enviar, el servidor le manda la
   respuesta por MAIL al cliente y, si salió, el ticket queda «Resuelto»
   con la respuesta guardada. El estado también se cambia a mano
   (optimista: si el servidor falla, vuelve atrás).
============================================================ */
import { AlertTriangle, CircleCheck, Clock, Inbox, LoaderCircle, Mail, RefreshCw, Reply, Send, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from '@/lib/admin';
import { Aviso, fecha, Titulo, type Api } from './ui';

type Filtro = 'todos' | Ticket['estado'];
const FILTROS: { id: Filtro; t: string }[] = [
  { id: 'pendiente', t: 'Pendientes' },
  { id: 'resuelto', t: 'Resueltos' },
  { id: 'todos', t: 'Todos' },
];

const mailDe = (t: Ticket) => t.email || (t.contacto?.includes('@') ? t.contacto : '');

export default function Tickets({ api }: { api: Api }) {
  const [lista, setLista] = useState<Ticket[] | null>(null);
  const [mailOk, setMailOk] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);   // ticket con el panel de respuesta abierto
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const r = await api<{ tickets: Ticket[]; mail: boolean }>('tickets');
      setLista(r.tickets); setMailOk(r.mail);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
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

  const abrir = (t: Ticket) => { setAbierto(a => (a === t.id ? null : t.id)); setTexto(''); setOk(''); setError(''); };

  const responder = async (t: Ticket) => {
    if (texto.trim().length < 2) { setError('Escribí la respuesta.'); return; }
    setEnviando(true); setError('');
    try {
      const act = await api<Ticket>('tickets', { method: 'POST', body: JSON.stringify({ id: t.id, respuesta: texto.trim() }) });
      setLista(v => v?.map(x => (x.id === t.id ? act : x)) ?? v);
      setAbierto(null); setTexto('');
      setOk(`Respuesta enviada a ${mailDe(t)} ✓`);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo enviar'); }
    finally { setEnviando(false); }
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

      {!mailOk && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          El envío de mails no está configurado (faltan SMTP_USER y SMTP_PASS en Vercel): los tickets se guardan, pero no se pueden mandar respuestas ni avisos.
        </p>
      )}

      <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/[.03] p-1" role="tablist">
        {FILTROS.map(f => (
          <button key={f.id} role="tab" aria-selected={filtro === f.id} onClick={() => setFiltro(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filtro === f.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
            {f.t} <span className="ml-1 font-mono text-xs opacity-60">{cuenta(f.id)}</span>
          </button>
        ))}
      </div>
      <Aviso error={error} />
      {ok && <p role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{ok}</p>}

      <div className="mt-6 space-y-3">
        {lista === null && <p className="rounded-2xl border border-white/10 px-4 py-10 text-center text-neutral-500">Cargando…</p>}
        {lista !== null && visibles.length === 0 && (
          <p className="rounded-2xl border border-white/10 px-4 py-14 text-center text-neutral-500">
            <Inbox className="mx-auto mb-3 h-6 w-6" aria-hidden="true" />No hay consultas acá.
          </p>
        )}
        {visibles.map(t => {
          const mail = mailDe(t);
          return (
            <article key={t.id} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-100">{t.nombre || '—'}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    {mail ? <a href={`mailto:${mail}`} className="inline-flex items-center gap-1 hover:text-white"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{mail}</a>
                      : <span>{t.contacto || 'sin contacto'}</span>}
                    <span>{fecha(t.created_at)}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-neutral-300">{t.motivo || '—'}</span>
                  </p>
                </div>
                <button onClick={() => cambiar(t)} title="Cambiar estado"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${t.estado === 'resuelto'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'}`}>
                  {t.estado === 'resuelto' ? <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                </button>
              </header>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-300">{t.mensaje}</p>

              {t.respuesta && (
                <div className="mt-4 rounded-xl border-l-2 border-rosa bg-white/[.03] px-4 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[.15em] text-neutral-500">
                    Respuesta enviada{t.respondido_at ? ` · ${fecha(t.respondido_at)}` : ''}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-neutral-200">{t.respuesta}</p>
                </div>
              )}

              <div className="mt-4">
                {abierto === t.id ? (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="mb-2 text-xs text-neutral-500">Se le manda por mail a <b className="text-neutral-300">{mail}</b> y el ticket queda resuelto.</p>
                    <textarea value={texto} onChange={e => setTexto(e.target.value)} autoFocus rows={5}
                      placeholder="Escribí solo la respuesta: el saludo («Hola …:») y la firma del equipo se agregan solos."
                      className="w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-rosa" />
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={() => setAbierto(null)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-300 hover:text-white">
                        <X className="h-4 w-4" aria-hidden="true" /> Cancelar
                      </button>
                      <button onClick={() => responder(t)} disabled={enviando || !mailOk}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosa-oscuro disabled:opacity-50">
                        {enviando ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                        Enviar respuesta
                      </button>
                    </div>
                  </div>
                ) : mail ? (
                  <button onClick={() => abrir(t)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-white/30 hover:text-white">
                    <Reply className="h-4 w-4" aria-hidden="true" /> {t.respuesta ? 'Responder de nuevo' : 'Responder'}
                  </button>
                ) : (
                  <p className="text-xs text-neutral-500">Ticket viejo sin mail: respondelo por WhatsApp.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
