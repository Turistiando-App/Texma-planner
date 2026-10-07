/* /llms.txt · resumen del sitio en texto plano para asistentes de IA
   (convención llmstxt.org): quiénes somos y los links que importan. */
import { ARTICULOS, CATEGORIAS } from '@/content/blog';
import { getProductos } from '@/lib/productos';
import { SITIO } from '@/lib/sitio';

export const revalidate = 3600;

export async function GET() {
  const productos = await getProductos();
  const cats = [...new Set(productos.map(p => p.categoria))];
  const txt = `# TEXMA

> Mercería online con stock real (hilos, botones, cierres y elásticos) y TEXMA, una app para modistas y costureras que ordena medidas, entregas, cobros, stock y finanzas. ${SITIO.ciudad}. Pedidos por WhatsApp con envíos a todo el país.

## Tienda
- [Catálogo de mercería](${SITIO.url}/merceria): ${productos.length} productos en ${cats.join(', ')}.
${cats.map(c => `- [${c}](${SITIO.url}/merceria?cat=${encodeURIComponent(c)})`).join('\n')}

## App
- [TEXMA para modistas](${SITIO.url}/planner): funciones, precio (pago único) y cómo conseguirla.

## Blog: costura, patronaje, moldería digital, diseño de indumentaria, upcycling, asesoría de imagen y tendencias textiles
${CATEGORIAS.map(c => `### ${c}\n` + ARTICULOS.filter(a => a.categoria === c)
  .map(a => `- [${a.titulo}](${SITIO.url}/blog/${a.slug}): ${a.resumen}`).join('\n')).join('\n\n')}

## Contacto
- WhatsApp: ${SITIO.whatsapp.map(w => w.lindo).join(' · ')}
- Email: ${SITIO.mail}
`;
  return new Response(txt, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
