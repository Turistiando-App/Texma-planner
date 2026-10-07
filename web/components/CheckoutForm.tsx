'use client';
/* ============================================================
   CHECKOUT · pre-compra de Texma Planner (/checkout)
   ------------------------------------------------------------
   Sin sesión: 4 campos obligatorios (nombre, apellido, email y celular).
   Con sesión de Google (llega acá desde la app, embudo de pre-ventas):
   SOLO el número de WhatsApp; nombre y mail salen de la cuenta de Google.
   Al enviar: POST /api/pre-ventas (queda el lead en Supabase) y
   después se abre el WhatsApp de María con el mensaje prearmado.
   Si la base falla, igual se sigue a WhatsApp: la venta no se traba
   (María recibe nombre y email en el mensaje).
============================================================ */
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { supabaseAuth } from '@/lib/supabase';
import { waPreventa } from '@/lib/sitio';
import { Avatar, useSesion } from './PerfilMenu';

type Datos = { nombre: string; apellido: string; email: string; celular: string };
const VACIO: Datos = { nombre: '', apellido: '', email: '', celular: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const CAMPOS: { k: keyof Datos; label: string; type: string; auto: string; ph: string; modo?: 'email' | 'tel' }[] = [
  { k: 'nombre', label: 'Nombre', type: 'text', auto: 'given-name', ph: 'María' },
  { k: 'apellido', label: 'Apellido', type: 'text', auto: 'family-name', ph: 'González' },
  { k: 'email', label: 'Email', type: 'email', auto: 'email', ph: 'maria@gmail.com', modo: 'email' },
  { k: 'celular', label: 'Celular (con código de área)', type: 'tel', auto: 'tel', ph: '387 614-5611', modo: 'tel' },
];

function validar(d: Datos) {
  if (!d.nombre.trim()) return 'Completá tu nombre.';
  if (!d.apellido.trim()) return 'Completá tu apellido.';
  if (!EMAIL.test(d.email.trim())) return 'Revisá el email.';
  const n = d.celular.replace(/\D/g, '').length;
  if (n < 8 || n > 15) return 'Revisá el celular (con código de área).';
  return '';
}

export default function CheckoutForm() {
  const usuario = useSesion();
  const [d, setD] = useState<Datos>(VACIO);
  const [web, setWeb] = useState('');            // honeypot
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  /* con Google: solo el WhatsApp; el servidor completa nombre y mail desde la sesión */
  const enviarConGoogle = async () => {
    const n = d.celular.replace(/\D/g, '').length;
    if (n < 8 || n > 15) { setError('Revisá el número de WhatsApp (con código de área).'); return; }
    setError('');
    setEnviando(true);
    const meta = usuario?.user_metadata || {};
    const partes = String(meta.full_name || meta.name || '').trim().split(/\s+/);
    let datos = { nombre: partes[0] || '', apellido: partes.slice(1).join(' '), email: usuario?.email || '' };
    try {
      const token = (await supabaseAuth()?.auth.getSession())?.data.session?.access_token;
      const r = await fetch('/api/pre-ventas', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ celular: d.celular.trim(), web }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 400) { setError(j.error || 'Revisá el número.'); setEnviando(false); return; }
      if (j.email) datos = { nombre: j.nombre, apellido: j.apellido === '—' ? '' : j.apellido, email: j.email };
    } catch { /* sin red o sin base: seguimos igual a WhatsApp */ }
    window.location.href = waPreventa(datos);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario) { await enviarConGoogle(); return; }
    const err = validar(d);
    if (err) { setError(err); return; }
    setError('');
    setEnviando(true);
    const limpio = { nombre: d.nombre.trim(), apellido: d.apellido.trim(), email: d.email.trim().toLowerCase(), celular: d.celular.trim() };
    try {
      const r = await fetch('/api/pre-ventas', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...limpio, web }),
      });
      if (r.status === 400) {
        const j = await r.json().catch(() => ({}));
        setError(j.error || 'Revisá los datos.'); setEnviando(false); return;
      }
    } catch { /* sin red o sin base: seguimos igual a WhatsApp */ }
    window.location.href = waPreventa(limpio);
  };

  return (
    <form onSubmit={enviar} noValidate
      className="relative w-full rounded-[2rem] border border-linea bg-white p-6 shadow-[0_30px_80px_-30px_rgba(43,38,34,.3)] sm:p-9">
      <h2 className="text-xl font-bold">Tus datos</h2>
      <p className="mt-1 text-sm text-tinta-suave">
        {usuario ? 'Ya tenemos tu nombre y tu mail de Google. Solo falta tu WhatsApp para mandarte el código.' : 'Los usamos para mandarte tu código de activación.'}
      </p>

      {usuario ? (
        <>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-lino px-4 py-3">
            <Avatar usuario={usuario} className="h-10 w-10 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{usuario.user_metadata?.full_name || usuario.user_metadata?.name || 'Tu cuenta'}</p>
              <p className="truncate text-xs text-tinta-suave">{usuario.email}</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="block text-sm font-semibold">Tu número de WhatsApp <span className="text-rosa" aria-hidden="true">*</span></span>
            <input type="tel" name="celular" required autoComplete="tel" inputMode="tel" placeholder="387 614-5611" autoFocus
              value={d.celular} onChange={e => { setD({ ...d, celular: e.target.value }); setError(''); }}
              className="mt-2 w-full rounded-2xl border border-linea bg-lino px-4 py-3.5 outline-none transition placeholder:text-tinta-suave/50 focus:border-rosa focus:bg-white focus:ring-4 focus:ring-rosa/10" />
          </label>
        </>
      ) : (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CAMPOS.map(c => (
          <label key={c.k} className={c.k === 'email' || c.k === 'celular' ? 'sm:col-span-2' : ''}>
            <span className="block text-sm font-semibold">{c.label} <span className="text-rosa" aria-hidden="true">*</span></span>
            <input
              type={c.type} name={c.k} required autoComplete={c.auto} inputMode={c.modo} placeholder={c.ph}
              value={d[c.k]} onChange={e => { setD({ ...d, [c.k]: e.target.value }); setError(''); }}
              className="mt-2 w-full rounded-2xl border border-linea bg-lino px-4 py-3.5 outline-none transition placeholder:text-tinta-suave/50 focus:border-rosa focus:bg-white focus:ring-4 focus:ring-rosa/10" />
          </label>
        ))}
      </div>
      )}
      {/* honeypot: invisible para personas */}
      <input type="text" name="web" tabIndex={-1} autoComplete="off" value={web} onChange={e => setWeb(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />

      {error && <p className="mt-4 text-sm font-semibold text-[#B3261E]" role="alert">{error}</p>}

      <button type="submit" disabled={enviando}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.3)] transition hover:bg-rosa-oscuro disabled:cursor-wait disabled:opacity-70">
        {enviando
          ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…</>
          : <>Continuar a WhatsApp <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-tinta-suave">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Tus datos no se comparten con nadie.
      </p>
      {usuario && (
        <p className="mt-3 text-center text-sm text-tinta-suave">
          ¿Ya tenés tu código?{' '}
          {/* ?tengo=1: la app no vuelve a mandar acá y pide el código directo */}
          <a href="/app?tengo=1" className="font-bold text-rosa hover:underline">Ingresalo en la app</a>
        </p>
      )}
    </form>
  );
}
