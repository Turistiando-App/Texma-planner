/* Datos fijos del sitio: un solo lugar para cambiarlos. */
export const SITIO = {
  nombre: 'TEXMA',
  lema: 'Tu planner de costura y tu mercería, en un solo lugar',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://texma.com.ar').replace(/\/+$/, ''),
  /* la PWA es OTRO proyecto de Vercel. Ojo: texma.vercel.app hoy sirve
     ESTA web, no la PWA — mandar ahí el código terminaba en el home. */
  pwa: (process.env.NEXT_PUBLIC_PWA_URL || 'https://texma-planner.vercel.app').replace(/\/+$/, ''),
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

/* CTA de venta de la app (header, home, /app, /login): ya no va directo a
   WhatsApp. Pasa por /checkout, que guarda nombre, apellido, email y celular
   en `pre_ventas` y recién ahí abre el WhatsApp de María con los datos. */
export const COMPRAR_APP = '/checkout';

/* mensaje prearmado para María al terminar /checkout */
export const waPreventa = (d: { nombre: string; apellido: string; email: string }) =>
  waLink(`Hola María, quiero comprar Texma Planner. Mis datos son: ${d.nombre} ${d.apellido}, Email: ${d.email}.`);

const NF = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const pesos = (n: number) => NF.format(n);

export const precioPor = (u: string) => (u === 'mts' ? 'por metro' : u === 'pack' ? 'por pack' : 'por unidad');
