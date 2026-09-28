'use client';
/* Formulario de contacto → WhatsApp de ventas.
   No hay servidor de mails en el medio: arma el mensaje con lo que
   escribió y abre el chat con ese texto ya cargado. Nada se guarda. */
import { useState } from 'react';
import { SITIO, waLink } from '@/lib/sitio';

const MOTIVOS = ['Pedido de mercería', 'Comprar la app TEXMA', 'Ayuda con la app', 'Otra consulta'];

export default function ContactoForm() {
  const [d, setD] = useState({ nombre: '', motivo: MOTIVOS[0], mensaje: '', a: SITIO.whatsapp[0].numero });
  const [error, setError] = useState('');
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setD(v => ({ ...v, [k]: e.target.value }));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.nombre.trim() || !d.mensaje.trim()) { setError('Completá tu nombre y el mensaje.'); return; }
    setError('');
    const texto = `¡Hola TEXMA! Soy ${d.nombre.trim()}.\nMotivo: ${d.motivo}\n\n${d.mensaje.trim()}`;
    window.open(waLink(texto, d.a), '_blank', 'noopener');
  };

  const campo = 'mt-2 w-full rounded-2xl border border-linea bg-lino px-4 py-3 outline-none focus:border-rosa';
  return (
    <form onSubmit={enviar} className="space-y-5 rounded-[2rem] border border-linea bg-papel p-7 md:p-9" noValidate>
      <label className="block text-sm font-semibold">Tu nombre
        <input className={campo} value={d.nombre} onChange={set('nombre')} autoComplete="name" required />
      </label>
      <label className="block text-sm font-semibold">Motivo
        <select className={campo} value={d.motivo} onChange={set('motivo')}>
          {MOTIVOS.map(m => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold">Mensaje
        <textarea className={`${campo} min-h-36`} value={d.mensaje} onChange={set('mensaje')}
          placeholder="Contanos qué necesitás: productos, medidas, colores…" required />
      </label>
      {SITIO.whatsapp.length > 1 && (
        <fieldset>
          <legend className="text-sm font-semibold">Enviar a</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SITIO.whatsapp.map(w => (
              <label key={w.numero} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${d.a === w.numero ? 'border-tinta bg-tinta text-papel' : 'border-linea'}`}>
                <input type="radio" name="a" value={w.numero} checked={d.a === w.numero} onChange={set('a')} className="sr-only" />
                {w.lindo}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {error && <p className="text-sm font-semibold text-[#B3261E]" role="alert">{error}</p>}
      <button type="submit" className="w-full rounded-full bg-rosa px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.3)]">
        Enviar por WhatsApp
      </button>
      <p className="text-center text-xs text-tinta-suave">Se abre WhatsApp con tu mensaje listo para mandar.</p>
    </form>
  );
}
