'use client';
/* ============================================================
   PHONE MOCKUPS · sección de /app con el carrusel de pantallas
   Fondo limpio (lino de la web), sin velos ni sombras oscuras.
============================================================ */
import { PhoneCarousel, type ImageItem } from '@/components/ui/phone-mockups-1-utils/phone-carousel';

const exampleImages: ImageItem[] = [
  { src: '/mockup-costura.png', label: 'Costura', alt: 'Pantalla de Costura en TEXMA: medidas de la clienta en cm con calculadora de patrón' },
  { src: '/mockup-inversiones.png', label: 'Inversiones', alt: 'Pantalla de Inversiones en TEXMA: ahorros e inversiones con su rendimiento' },
  { src: '/mockup-compras.png', label: 'Lista de compras', alt: 'Pantalla de Lista de compras en TEXMA: artículos para comprar y tachar' },
  { src: '/mockup-entrenamiento.png', label: 'Entrenamiento', alt: 'Pantalla de Entrenamiento en TEXMA: rutinas y registro de ejercicio' },
  { src: '/mockup-merceria.png', label: 'Mercería y stock', alt: 'Pantalla de Mercería en TEXMA: stock de cintas, cierres y botones con precios' },
  { src: '/mockup-tratamientos.png', label: 'Tratamientos', alt: 'Pantalla de Tratamientos en TEXMA: sesiones y fechas de cuidados' },
  { src: '/mockup-remedios.png', label: 'Remedios', alt: 'Pantalla de Remedios en TEXMA: dosis y horarios con recordatorio' },
  { src: '/mockup-agenda.png', label: 'Agenda', alt: 'Pantalla de Agenda en TEXMA: entregas por semana o mes con alarmas' },
  { src: '/mockup-finanzas.png', label: 'Finanzas', alt: 'Pantalla de Finanzas en TEXMA: señas, saldos, gastos y ganancia del mes' },
];

export function PhoneMockupBasic() {
  return (
    <section id="funciones" className="scroll-mt-24 bg-lino px-5 py-20 md:py-28" aria-labelledby="funciones-titulo">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-mono text-xs uppercase tracking-[.2em] text-rosa">Por dentro</p>
        <h2 id="funciones-titulo" className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Todo tu taller, pantalla por pantalla.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-tinta-suave">
          Deslizá para recorrer la app: costura, mercería, agenda, finanzas y mucho más.
        </p>
      </div>
      <PhoneCarousel images={exampleImages} className="mt-14 overflow-x-clip" />
    </section>
  );
}

export default PhoneMockupBasic;
