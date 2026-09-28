/* ============================================================
   Artículos del blog
   ------------------------------------------------------------
   Formato pensado para SEO y AEO (respuestas de Google y de los
   asistentes de IA):
     · `resumen`: la respuesta directa en 1–2 oraciones, arriba de todo
       (es lo que un motor de respuesta cita).
     · secciones con H2 que son preguntas o pasos concretos.
     · `faq`: preguntas cortas con respuesta cerrada → JSON-LD FAQPage.
   Para sumar un artículo: agregar un objeto a ARTICULOS. Nada más.
============================================================ */
export type Articulo = {
  slug: string;
  titulo: string;
  descripcion: string;       // meta description (≈150 caracteres)
  resumen: string;           // respuesta directa
  fecha: string;             // ISO
  lectura: number;           // minutos
  etiquetas: string[];
  secciones: { h2: string; parrafos: string[]; lista?: string[] }[];
  faq: { p: string; r: string }[];
};

export const ARTICULOS: Articulo[] = [
  {
    slug: 'como-elegir-el-hilo-correcto',
    titulo: 'Cómo elegir el hilo correcto para cada tela',
    descripcion: 'Poliéster, algodón u overlock: qué hilo usar según la tela, el grosor de la aguja y el tipo de costura. Guía rápida para no fallar.',
    resumen: 'Para la mayoría de las telas usá hilo de poliéster: es resistente y un poco elástico. El algodón mercerizado va con telas 100 % algodón que se van a teñir o planchar fuerte, y el hilo overlock (en cono) es solo para la remalladora.',
    fecha: '2026-09-10',
    lectura: 5,
    etiquetas: ['hilos', 'telas', 'principiantes'],
    secciones: [
      { h2: '¿Poliéster o algodón?', parrafos: [
        'El poliéster es el comodín: aguanta tirones, no se pudre con la humedad y estira apenas, así que acompaña a las telas de punto sin cortarse.',
        'El algodón mercerizado tiene un brillo lindo y se comporta igual que una tela de algodón al lavar y planchar. Es ideal para patchwork y prendas de algodón puro.',
      ] },
      { h2: 'El grosor del hilo y la aguja van juntos', parrafos: [
        'Un hilo grueso en una aguja fina se deshilacha y se corta. La regla práctica: si el hilo no pasa cómodo por el ojo de la aguja, subí un número de aguja.',
      ], lista: ['Telas finas (gasa, voile): aguja 60–70 y hilo fino.', 'Telas medias (poplín, lino): aguja 80–90 y hilo estándar.', 'Telas gruesas (jean, lona): aguja 100–110 y hilo reforzado.'] },
      { h2: '¿Cuándo usar hilo overlock?', parrafos: [
        'El hilo overlock viene en conos grandes y es más fino: está hecho para las 3 o 4 agujas y los loopers de la remalladora, que consumen muchísimo. En una máquina común queda débil para costuras que hacen fuerza.',
      ] },
      { h2: '¿Y el color?', parrafos: [
        'Si no encontrás el tono exacto, elegí uno apenas más oscuro que la tela: sobre la costura se ve más claro. Para telas estampadas, usá el color que más se repite.',
      ] },
    ],
    faq: [
      { p: '¿Qué hilo sirve para casi todo?', r: 'El hilo de poliéster de 100 m: es resistente, un poco elástico y sirve para la mayoría de las telas.' },
      { p: '¿Puedo coser jean con hilo común?', r: 'Sí, pero conviene hilo reforzado o de jean y una aguja 100–110 para que no se corte en las costuras gruesas.' },
      { p: '¿El hilo overlock sirve para la máquina familiar?', r: 'Funciona, pero queda débil para costuras que hacen fuerza. Es mejor usarlo solo en la remalladora.' },
    ],
  },
  {
    slug: 'como-colocar-un-cierre-invisible',
    titulo: 'Cómo colocar un cierre invisible paso a paso',
    descripcion: 'La forma más simple de poner un cierre invisible en polleras y vestidos, con prensatela común o especial, sin que se note la costura.',
    resumen: 'El cierre invisible se cose ANTES de cerrar la costura: se abren los dientes con la plancha, se cose cada lado lo más pegado posible a los dientes y recién después se cierra la costura por debajo del cierre.',
    fecha: '2026-09-02',
    lectura: 6,
    etiquetas: ['cierres', 'vestidos', 'paso a paso'],
    secciones: [
      { h2: 'Qué necesitás', parrafos: ['Un cierre invisible 2–3 cm más largo que la abertura, alfileres, plancha y, si tenés, el prensatela para cierre invisible (con el común también sale).'] },
      { h2: 'Paso a paso', parrafos: ['Seguí este orden y el cierre queda escondido en la costura:'], lista: [
        'Marcá dónde termina la abertura y sobrehilá los bordes de la tela.',
        'Planchá el cierre del revés con la plancha tibia para abrir los dientes (que queden planos).',
        'Abrí el cierre y prendé un lado derecho con derecho, los dientes sobre la línea de costura.',
        'Cosé lo más pegado a los dientes que puedas, hasta donde llega el deslizador.',
        'Cerrá el cierre, marcá dónde cae el otro lado y repetí.',
        'Cerrá la costura de la prenda por debajo del cierre, empezando 1 cm más arriba y 2 mm hacia afuera.',
      ] },
      { h2: 'Errores comunes', parrafos: [
        'Si se ve la cinta desde el derecho, cosiste lejos de los dientes: descosé ese tramo y volvé a coser más pegado. Si el cierre se traba, la costura del final quedó encima del deslizador.',
      ] },
    ],
    faq: [
      { p: '¿Qué largo de cierre invisible compro?', r: 'Entre 2 y 3 cm más largo que la abertura: lo que sobra queda dentro de la costura.' },
      { p: '¿Se puede poner sin el prensatela especial?', r: 'Sí, con el prensatela de cierre común cosiendo bien pegado a los dientes; lleva un poco más de paciencia.' },
      { p: '¿Se puede acortar un cierre invisible?', r: 'Sí, desde abajo: hacé un tope con unas puntadas a mano y cortá lo que sobra.' },
    ],
  },
  {
    slug: 'como-tomar-medidas-para-un-vestido',
    titulo: 'Cómo tomar medidas para un vestido (y no equivocarte)',
    descripcion: 'Qué medidas tomar para un vestido a medida, cómo tomarlas bien con la cinta métrica y cuánta holgura sumar en cada una.',
    resumen: 'Para un vestido a medida necesitás como mínimo busto, cintura, cadera, largo de talle, ancho de espalda y largo total. Se toman sobre ropa interior, con la cinta firme pero sin apretar y paralela al piso.',
    fecha: '2026-08-20',
    lectura: 7,
    etiquetas: ['medidas', 'vestidos', 'patronaje'],
    secciones: [
      { h2: 'Las medidas básicas', parrafos: ['Estas seis alcanzan para la mayoría de los vestidos:'], lista: [
        'Busto: por la parte más saliente, con la cinta pasando por la espalda sin subir.',
        'Cintura: en la parte más angosta del torso (pedile que se incline de costado: donde se arruga, es la cintura).',
        'Cadera: por la parte más ancha de la cola, unos 20 cm debajo de la cintura.',
        'Largo de talle: desde el hombro, pasando por el busto, hasta la cintura.',
        'Ancho de espalda: de hombro a hombro, por la espalda.',
        'Largo total: desde la base del cuello hasta donde va a terminar el vestido.',
      ] },
      { h2: '¿Cuánta holgura sumar?', parrafos: [
        'Las medidas son del cuerpo; el vestido necesita aire para moverse. Como referencia: 4–6 cm en busto, 2–4 cm en cintura y 4–6 cm en cadera para un vestido entallado. Para telas con elastano, menos.',
      ] },
      { h2: 'Guardalas por clienta', parrafos: [
        'Anotá la fecha de cada toma: los cuerpos cambian y una medida de hace un año puede no servir. En la app TEXMA cada proyecto guarda sus medidas con la calculadora de patrón (÷2, ÷4) al lado.',
      ] },
    ],
    faq: [
      { p: '¿Las medidas se toman con ropa?', r: 'Sobre ropa interior o ropa muy fina, nunca sobre ropa gruesa.' },
      { p: '¿Cuánta holgura lleva el busto?', r: 'Entre 4 y 6 cm para un vestido entallado de tela sin elastano.' },
      { p: '¿Cada cuánto conviene volver a medir?', r: 'Si pasaron más de 6 meses desde la última toma, conviene volver a medir.' },
    ],
  },
];

export const getArticulo = (slug: string) => ARTICULOS.find(a => a.slug === slug) ?? null;
