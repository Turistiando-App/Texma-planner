#!/usr/bin/env node
/* ============================================================
   Genera los 50 productos de ejemplo de la mercería, en DOS formatos
   que salen de la misma lista (así nunca se desincronizan):
     · data/productos.json          → lo usa el sitio si no hay Supabase
     · supabase/productos_seed.sql  → para cargarlos en la tabla `productos`
   Uso:  node scripts/generar-productos.mjs
============================================================ */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* [categoría, subcategoría, título, unidad, precio, color, stock] */
const L = [
  // ---- Hilos (13)
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Negro', 'u', 1200, '#1E1B19', 48],
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Blanco', 'u', 1200, '#F7F4EE', 52],
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Rosa TEXMA', 'u', 1250, '#EC1968', 30],
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Azul marino', 'u', 1200, '#1F2E5A', 26],
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Rojo', 'u', 1200, '#C62828', 18],
  ['Hilos', 'Poliéster', 'Hilo de coser poliéster 100 m · Beige', 'u', 1200, '#D8C3A0', 22],
  ['Hilos', 'Algodón', 'Hilo de algodón mercerizado 200 m · Crudo', 'u', 1900, '#EDE3CF', 15],
  ['Hilos', 'Algodón', 'Hilo de algodón mercerizado 200 m · Verde salvia', 'u', 1900, '#8FA88A', 11],
  ['Hilos', 'Overlock', 'Cono de hilo overlock 5000 yd · Blanco', 'u', 4800, '#F5F2EC', 20],
  ['Hilos', 'Overlock', 'Cono de hilo overlock 5000 yd · Negro', 'u', 4800, '#211E1B', 17],
  ['Hilos', 'Bordar', 'Madeja de hilo para bordar · Set 12 colores', 'pack', 5200, '#F2803C', 9],
  ['Hilos', 'Bordar', 'Hilo metalizado para bordar · Dorado', 'u', 1600, '#C9A14A', 14],
  ['Hilos', 'Elástico', 'Hilo elástico para fruncir · Blanco', 'u', 1400, '#FFFFFF', 12],
  // ---- Botones (13)
  ['Botones', '4 agujeros', 'Botón 4 agujeros 15 mm · Nácar', 'pack', 1800, '#F1EADF', 40],
  ['Botones', '4 agujeros', 'Botón 4 agujeros 15 mm · Negro', 'pack', 1600, '#1F1C1A', 36],
  ['Botones', '4 agujeros', 'Botón 4 agujeros 20 mm · Madera', 'pack', 2400, '#9C6B3F', 21],
  ['Botones', '2 agujeros', 'Botón camisero 11 mm · Blanco', 'pack', 1300, '#FBFAF6', 55],
  ['Botones', '2 agujeros', 'Botón camisero 11 mm · Celeste', 'pack', 1300, '#9CC3DE', 19],
  ['Botones', 'Con pie', 'Botón con pie forrado 18 mm · Negro', 'pack', 2900, '#262220', 8],
  ['Botones', 'Con pie', 'Botón metálico con pie 20 mm · Dorado', 'pack', 3600, '#C8A04A', 13],
  ['Botones', 'Jean', 'Botón de jean a presión 17 mm · Cobre', 'pack', 3200, '#A0643A', 24],
  ['Botones', 'Jean', 'Botón de jean a presión 17 mm · Níquel', 'pack', 3200, '#A7A9AC', 27],
  ['Botones', 'Infantiles', 'Botón infantil corazón 14 mm · Rosa', 'pack', 2100, '#F48FB1', 16],
  ['Botones', 'Infantiles', 'Botón infantil estrella 14 mm · Amarillo', 'pack', 2100, '#F2C94C', 10],
  ['Botones', 'Broches', 'Broche a presión metálico 10 mm · Plateado', 'pack', 1700, '#BFC3C7', 33],
  ['Botones', 'Broches', 'Broche de gancho y presilla · Negro', 'pack', 1500, '#1E1B19', 29],
  // ---- Cierres (12)
  ['Cierres', 'Invisibles', 'Cierre invisible 20 cm · Negro', 'u', 900, '#1E1B19', 60],
  ['Cierres', 'Invisibles', 'Cierre invisible 20 cm · Rosa', 'u', 900, '#EC1968', 22],
  ['Cierres', 'Invisibles', 'Cierre invisible 60 cm · Blanco', 'u', 1400, '#F7F4EE', 18],
  ['Cierres', 'Metálicos', 'Cierre metálico de jean 18 cm · Bronce', 'u', 1300, '#9C6B3F', 35],
  ['Cierres', 'Metálicos', 'Cierre metálico desmontable 60 cm · Plata', 'u', 3400, '#BFC3C7', 12],
  ['Cierres', 'Diente de perro', 'Cierre diente de perro 20 cm · Azul', 'u', 1100, '#2F5DA8', 20],
  ['Cierres', 'Diente de perro', 'Cierre diente de perro desmontable 70 cm · Negro', 'u', 3900, '#1E1B19', 9],
  ['Cierres', 'Diente de perro', 'Cierre diente de perro 20 cm · Verde', 'u', 1100, '#2F9E6B', 14],
  ['Cierres', 'Por metro', 'Cierre por metro N°5 · Negro', 'mts', 1800, '#1E1B19', 45],
  ['Cierres', 'Por metro', 'Cierre por metro N°5 · Beige', 'mts', 1800, '#D8C3A0', 30],
  ['Cierres', 'Deslizadores', 'Deslizador para cierre N°5 · Pack x10', 'pack', 2200, '#BFC3C7', 16],
  ['Cierres', 'Deslizadores', 'Deslizador para cierre invisible · Pack x10', 'pack', 2000, '#1E1B19', 11],
  // ---- Elásticos (12)
  ['Elásticos', 'Planos', 'Elástico plano 10 mm · Blanco', 'mts', 350, '#FBFAF6', 120],
  ['Elásticos', 'Planos', 'Elástico plano 20 mm · Negro', 'mts', 520, '#1E1B19', 90],
  ['Elásticos', 'Planos', 'Elástico plano 40 mm · Blanco', 'mts', 900, '#FBFAF6', 60],
  ['Elásticos', 'Lycra', 'Elástico de lycra 13 mm · Nude', 'mts', 480, '#E3C1A8', 75],
  ['Elásticos', 'Lycra', 'Elástico de lycra 17 mm · Negro', 'mts', 560, '#1E1B19', 64],
  ['Elásticos', 'Redondos', 'Elástico redondo 2 mm · Blanco', 'mts', 220, '#FBFAF6', 140],
  ['Elásticos', 'Redondos', 'Elástico redondo 3 mm · Negro', 'mts', 260, '#1E1B19', 110],
  ['Elásticos', 'Con puntilla', 'Elástico con puntilla 15 mm · Rosa', 'mts', 690, '#F48FB1', 38],
  ['Elásticos', 'Con puntilla', 'Elástico con puntilla 15 mm · Blanco', 'mts', 690, '#FBFAF6', 41],
  ['Elásticos', 'Cintura', 'Elástico para cintura 35 mm · Negro', 'mts', 850, '#1E1B19', 5],
  ['Elásticos', 'Cintura', 'Elástico para cintura 35 mm · Blanco', 'mts', 850, '#FBFAF6', 0],
  ['Elásticos', 'Bretel', 'Elástico para bretel afelpado 12 mm · Nude', 'mts', 640, '#E3C1A8', 27],
];

if (L.length !== 50) throw new Error(`Tienen que ser 50 productos y hay ${L.length}`);

/* 11 destacados, repartidos entre categorías (la grilla del Home) */
const DESTACADOS = new Set([0, 2, 8, 10, 13, 20, 26, 29, 34, 38, 41]);

const productos = L.map(([categoria, subcategoria, titulo, unidad, precio, color, stock], i) => ({
  id: i + 1,
  slug: slug(titulo),
  titulo,
  categoria,
  subcategoria,
  unidad,
  precio,
  color,
  stock,
  destacado: DESTACADOS.has(i),
  activo: true,
  descripcion: `${titulo}. ${categoria} · ${subcategoria}. Precio por ${unidad === 'mts' ? 'metro' : unidad === 'pack' ? 'pack' : 'unidad'}.`,
  imagen_url: null,
}));

await mkdir(join(raiz, 'data'), { recursive: true });
await writeFile(join(raiz, 'data', 'productos.json'), JSON.stringify(productos, null, 2) + '\n');

const q = v => v === null ? 'null' : typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v);
const filas = productos.map(p =>
  `  (${[p.slug, p.titulo, p.categoria, p.subcategoria, p.unidad, p.precio, p.color, p.stock, p.destacado, p.descripcion].map(q).join(', ')})`
).join(',\n');
const sql = `-- Generado por web/scripts/generar-productos.mjs · no editar a mano
insert into public.productos (slug, titulo, categoria, subcategoria, unidad, precio, color, stock, destacado, descripcion)
values
${filas}
on conflict (slug) do update set
  titulo = excluded.titulo, categoria = excluded.categoria, subcategoria = excluded.subcategoria,
  unidad = excluded.unidad, precio = excluded.precio, color = excluded.color,
  stock = excluded.stock, destacado = excluded.destacado, descripcion = excluded.descripcion;
`;
await mkdir(join(raiz, 'supabase'), { recursive: true });
await writeFile(join(raiz, 'supabase', 'productos_seed.sql'), sql);
console.log(`✓ ${productos.length} productos → data/productos.json + supabase/productos_seed.sql`);
