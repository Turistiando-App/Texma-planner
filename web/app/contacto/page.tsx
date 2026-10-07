import type { Metadata } from 'next';
import ContactoForm from '@/components/ContactoForm';
import { SITIO } from '@/lib/sitio';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Abrí una consulta con tu cuenta de Google y te respondemos por mail: ayuda con la app TEXMA, tu licencia, pedidos de mercería o costura.',
  alternates: { canonical: '/contacto' },
};

export default function Contacto() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-28 md:grid-cols-2">
      <div>
        <p className="kicker text-rosa">Contacto</p>
        <h1 className="titulo mt-3 text-5xl md:text-6xl">Hablemos.</h1>
        <p className="mt-5 max-w-md text-lg text-tinta-suave">
          Dudas con la app, tu licencia, pedidos o costura: dejanos tu consulta y te respondemos por mail, normalmente en el día.
        </p>
        <ul className="mt-8 space-y-3">
          {SITIO.whatsapp.map(w => (
            <li key={w.numero}><a href={`https://wa.me/${w.numero}`} target="_blank" rel="noopener" className="font-bold hover:text-rosa">WhatsApp {w.lindo}</a></li>
          ))}
          <li><a href={`mailto:${SITIO.mail}`} className="font-bold hover:text-rosa">{SITIO.mail}</a></li>
          <li className="text-tinta-suave">{SITIO.ciudad}</li>
        </ul>
      </div>
      <ContactoForm />
    </div>
  );
}
