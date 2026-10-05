/* Datos fijos del sitio: un solo lugar para cambiarlos. */
export const SITIO = {
  nombre: 'TEXMA',
  lema: 'Tu planner de costura y tu mercería, en un solo lugar',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://texma.com.ar').replace(/\/+$/, ''),
  pwa: process.env.NEXT_PUBLIC_PWA_URL || 'https://texma.vercel.app',
  mail: 'texma.ok@gmail.com',
  /* único número de ventas y soporte (María); el mismo que muestra la app en el muro de licencia */
  whatsapp: [
    { numero: '5493876145611', lindo: '+54 9 387 614-5611' },
  ],
  /* TODO: confirmar los usuarios reales de las redes */
  redes: {
    instagram: 'https://www.instagram.com/texma.ar/',
    tiktok: 'https://www.tiktok.com/@texma.ok',
  },
  ciudad: 'Salta, Argentina',
};

export const waLink = (texto: string, numero = SITIO.whatsapp[0].numero) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

/* CTA de venta de la app: mismo mensaje en header, home y /app */
export const WA_COMPRAR_APP = waLink('Hola, vengo de la web. Quiero comprar la aplicación de gestión Texma Planner para mi taller.');

const NF = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const pesos = (n: number) => NF.format(n);

export const precioPor = (u: string) => (u === 'mts' ? 'por metro' : u === 'pack' ? 'por pack' : 'por unidad');
