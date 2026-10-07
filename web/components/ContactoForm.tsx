'use client';
/* ============================================================
   CONTACTO · tickets de soporte (/contacto)
   ------------------------------------------------------------
   Para escribir hay que tener sesión de Google: el ticket queda a nombre
   y con el mail de esa cuenta (lo verifica el servidor), y la respuesta
   del equipo llega a ese mail desde /admin → Soporte.
   Sin sesión: botón para iniciarla (vuelve acá). WhatsApp sigue como
   alternativa directa.
============================================================ */
import { CheckCircle2, Loader2, LogIn, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { supabaseAuth } from '@/lib/supabase';
import { SITIO, waLink } from '@/lib/sitio';
import { Avatar, useSesion } from './PerfilMenu';

const MOTIVOS = ['Ayuda con la app', 'Problema con mi licencia', 'Comprar la app TEXMA', 'Pedido de mercería', 'Otra consulta'];

export default function ContactoForm() {
  const usuario = useSesion();
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mensaje.trim().length < 5) { setError('Contanos un poco más en el mensaje.'); return; }
    setError(''); setEnviando(true);
    try {
      const token = (await supabaseAuth()?.auth.getSession())?.data.session?.access_token;
      if (!token) { setError('Tu sesión venció. Volvé a iniciar sesión con Google.'); setEnviando(false); return; }
      const r = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ motivo, mensaje: mensaje.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setError(j.error || 'No pudimos enviar tu consulta. Probá de nuevo.'); setEnviando(false); return; }
      setListo(true);
    } catch {
      setError('Sin conexión. Revisá internet y probá de nuevo.');
    }
    setEnviando(false);
  };

  const campo = 'mt-2 w-full rounded-2xl border border-linea bg-lino px-4 py-3 outline-none focus:border-rosa';
  const caja = 'space-y-5 rounded-[2rem] border border-linea bg-papel p-7 md:p-9';
  const wa = (
    <p className="text-center text-sm text-tinta-suave">
      ¿Es urgente?{' '}
      <a href={waLink('¡Hola TEXMA! Tengo una consulta.')} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-bold text-rosa hover:underline">
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Escribinos por WhatsApp
      </a>
    </p>
  );

  /* sin sesión: primero Google */
  if (!usuario) {
    return (
      <div className={caja}>
        <h2 className="text-xl font-bold">Escribinos</h2>
        <p className="text-tinta-suave">
          Para abrir una consulta iniciá sesión con tu cuenta de Google: así te respondemos directo a tu mail y queda todo registrado.
        </p>
        <a href="/login?next=/contacto"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.3)] transition hover:bg-rosa-oscuro">
          <LogIn className="h-5 w-5" aria-hidden="true" /> Iniciar sesión con Google
        </a>
        {wa}
      </div>
    );
  }

  if (listo) {
    return (
      <div className={`${caja} text-center`} role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-rosa" aria-hidden="true" />
        <h2 className="titulo text-3xl">¡Recibimos tu consulta!</h2>
        <p className="text-tinta-suave">Te vamos a responder a <b className="text-tinta">{usuario.email}</b>. Revisá también la carpeta de spam por las dudas.</p>
        <button type="button" onClick={() => { setListo(false); setMensaje(''); }} className="font-bold text-rosa hover:underline">Enviar otra consulta</button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className={caja} noValidate>
      <div className="flex items-center gap-3 rounded-2xl bg-lino px-4 py-3">
        <Avatar usuario={usuario} className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{usuario.user_metadata?.full_name || usuario.user_metadata?.name || 'Tu cuenta'}</p>
          <p className="truncate text-xs text-tinta-suave">Te respondemos a {usuario.email}</p>
        </div>
      </div>
      <label className="block text-sm font-semibold">Motivo
        <select className={campo} value={motivo} onChange={e => setMotivo(e.target.value)}>
          {MOTIVOS.map(m => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold">Mensaje
        <textarea className={`${campo} min-h-36`} value={mensaje} onChange={e => { setMensaje(e.target.value); setError(''); }}
          placeholder="Contanos qué necesitás: tu duda con la app, tu licencia, un pedido…" required maxLength={4000} />
      </label>
      {error && <p className="text-sm font-semibold text-[#B3261E]" role="alert">{error}</p>}
      <button type="submit" disabled={enviando}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rosa px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.3)] transition hover:bg-rosa-oscuro disabled:cursor-wait disabled:opacity-70">
        {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        Enviar consulta
      </button>
      {wa}
      <p className="text-center text-xs text-tinta-suave">{SITIO.mail}</p>
    </form>
  );
}
