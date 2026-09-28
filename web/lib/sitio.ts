/* Datos fijos del sitio: un solo lugar para cambiarlos. */
export const SITIO = {
  nombre: 'TEXMA',
  lema: 'Tu planner de costura y tu mercería, en un solo lugar',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://texma.com.ar').replace(/\/+$/, ''),
  pwa: process.env.NEXT_PUBLIC_PWA_URL || 'https://texma.vercel.app',
  mail: 'texma.ok@gmail.com',
  /* los mismos teléfonos de ventas que muestra la app en el muro de licencia */
  whatsapp: [
    { numero: '543875760091', lindo: '+54 387 576-0091' },
    { numero: '543876145611', lindo: '+54 387 614-5611' },
  ],
  ciudad: 'Salta, Argentina',
};

export const waLink = (texto: string, numero = SITIO.whatsapp[0].numero) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

const NF = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const pesos = (n: number) => NF.format(n);

export const precioPor = (u: string) => (u === 'mts' ? 'por metro' : u === 'pack' ? 'por pack' : 'por unidad');
