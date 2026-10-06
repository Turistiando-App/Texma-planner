import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = {
  title: 'Comprar Texma Planner',
  description: 'Dejanos tus datos y te pasamos por WhatsApp el precio y tu código de activación de Texma Planner. Pago único, sin suscripción.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: true },
};

const PASOS = [
  'Completás tus datos acá.',
  'Te abrimos el WhatsApp de María con tu pedido listo para enviar.',
  'Pagás una sola vez y te mandamos tu código de activación.',
];

export default function Checkout() {
  return (
    <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-5 pb-16 pt-24 md:pt-28 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-16">
      <div>
        <p className="kicker text-rosa">Comprar la app</p>
        <h1 className="titulo mt-3 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Tu Texma Planner, a un paso.</h1>
        <p className="mt-5 max-w-lg text-base text-tinta-suave sm:text-lg">
          Pago único, sin suscripción. Funciona en Android, iPhone y compu, incluso sin internet.
        </p>
        <ol className="mt-8 space-y-3">
          {PASOS.map((p, i) => (
            <li key={p} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rosa" aria-hidden="true" />
              <span><b className="font-mono text-sm text-rosa">0{i + 1}</b> · {p}</span>
            </li>
          ))}
        </ol>
      </div>
      <CheckoutForm />
    </div>
  );
}
