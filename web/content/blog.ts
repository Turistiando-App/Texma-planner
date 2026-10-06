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
   `categoria` arma los chips de /blog; `destacado` elige el post
   grande de arriba (si no hay, va el más nuevo). Las fotos son de
   Unsplash (licencia libre) y se sirven optimizadas por next/image.
============================================================ */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=75`;

export type Articulo = {
  slug: string;
  titulo: string;
  descripcion: string;       // meta description (≈150 caracteres)
  resumen: string;           // respuesta directa
  fecha: string;             // ISO
  lectura: number;           // minutos
  categoria: string;         // chip de categoría en /blog
  imagen: { src: string; alt: string };
  destacado?: boolean;       // post grande de arriba en /blog
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
    categoria: 'Costura',
    imagen: { src: unsplash('1528578577235-b963df6db908'), alt: 'Alfiletero tejido de colores con alfileres de cabeza redonda' },
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
    categoria: 'Costura',
    imagen: { src: unsplash('1558171813-4c088753af8f'), alt: 'Camisa celeste apoyada sobre una silla de madera' },
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
    categoria: 'Patronaje',
    imagen: { src: unsplash('1490481651871-ab68de25d43d'), alt: 'Blusas y vestidos claros colgados en un perchero minimalista' },
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
  {
    slug: 'planner-para-modistas-organizar-el-taller',
    titulo: 'Planner para modistas: cómo organizar pedidos, medidas y cobros',
    descripcion: 'Cómo usar un planner para modistas y costureras para ordenar pedidos, medidas por clienta, fechas de entrega, señas y stock de mercería en un solo lugar.',
    resumen: 'Un planner para modistas junta en un solo lugar lo que hoy está repartido entre cuadernos, WhatsApp y la memoria: las medidas de cada clienta, la fecha de entrega de cada trabajo, cuánto se cobró de seña y cuánto falta, y qué mercería hay en stock.',
    fecha: '2026-10-05',
    lectura: 6,
    categoria: 'Organización del taller',
    imagen: { src: unsplash('1556905055-8f358a7a47b2'), alt: 'Prendas dobladas y accesorios ordenados sobre una cama, vista desde arriba' },
    destacado: true,
    etiquetas: ['planner para modistas', 'organización', 'emprender en costura', 'gestión del taller'],
    secciones: [
      { h2: '¿Qué tiene que tener un planner para modistas?', parrafos: [
        'Una agenda común sirve para anotar fechas, pero un taller de costura maneja más cosas a la vez: cada pedido tiene una clienta, sus medidas, una tela, una fecha de prueba, una de entrega y un saldo por cobrar.',
      ], lista: [
        'Ficha por clienta con sus medidas y la fecha en que se tomaron.',
        'Agenda de pruebas y entregas con avisos.',
        'Seña, saldo y estado de pago de cada trabajo.',
        'Stock de mercería: hilos, cierres, botones y elásticos, con alerta cuando algo se termina.',
        'Resumen del mes: cuánto entró, cuánto se gastó y cuánto quedó.',
      ] },
      { h2: 'Del cuaderno al celular, sin perder nada', parrafos: [
        'El primer paso es pasar solo los trabajos activos: los que tienen fecha de entrega en las próximas semanas. Las clientas viejas se cargan a medida que vuelven.',
        'Anotá la seña en el momento en que la cobrás. El error más común es dejarlo para después y terminar el mes sin saber quién debe qué.',
      ] },
      { h2: 'Cómo lo resuelve TEXMA', parrafos: [
        'TEXMA es un planner para modistas que funciona en el celular y sin internet: medidas por clienta con calculadora de patrón, entregas con alarma, cobros, stock de mercería y finanzas del taller. Se paga una sola vez, sin suscripción.',
      ] },
    ],
    faq: [
      { p: '¿Qué es un planner para modistas?', r: 'Una herramienta, en papel o en una app, para organizar pedidos, medidas por clienta, entregas, cobros y stock de un taller de costura.' },
      { p: '¿Sirve si trabajo sola desde casa?', r: 'Sí: justamente cuando una sola persona hace todo es cuando más se pierden fechas y cobros.' },
      { p: '¿TEXMA necesita internet?', r: 'No. Una vez activada funciona sin conexión y los datos quedan guardados en tu celular.' },
    ],
  },
  {
    slug: 'diseno-de-indumentaria-de-la-idea-a-la-prenda',
    titulo: 'Diseño de indumentaria: de la idea a la prenda terminada',
    descripcion: 'Las etapas del diseño de indumentaria explicadas simple: investigación, bocetos, ficha técnica, moldería, prototipo y producción, pensado para talleres chicos.',
    resumen: 'El diseño de indumentaria sigue siempre el mismo camino: investigar y definir para quién es la prenda, bocetar, armar la ficha técnica, hacer la moldería, coser un prototipo, corregirlo y recién ahí producir.',
    fecha: '2026-10-01',
    lectura: 8,
    categoria: 'Diseño de indumentaria',
    imagen: { src: unsplash('1612423284934-2850a4ea6b0f'), alt: 'Perchero con blusas y camisas estampadas en tonos naranja y crema' },
    etiquetas: ['diseño de indumentaria', 'colección', 'ficha técnica', 'moldería'],
    secciones: [
      { h2: '1. Investigación y concepto', parrafos: [
        'Antes de dibujar, definí para quién es la prenda, en qué ocasión se usa y en qué temporada. Un tablero con fotos, telas y colores ayuda a que todas las piezas de una colección hablen el mismo idioma.',
      ] },
      { h2: '2. Bocetos y figurín', parrafos: [
        'El boceto rápido sirve para explorar; el figurín, para comunicar. No hace falta dibujar perfecto: hace falta que se entiendan las proporciones, los recortes y los cierres.',
      ] },
      { h2: '3. Ficha técnica', parrafos: ['Es el documento que permite que otra persona cosa la prenda igual que vos la pensaste:'], lista: [
        'Dibujo plano de frente y espalda.',
        'Tela, avíos (cierres, botones, elásticos) y consumo por talle.',
        'Tipo de costuras y terminaciones.',
        'Tabla de medidas y tolerancias.',
      ] },
      { h2: '4. Moldería, prototipo y corrección', parrafos: [
        'Con la ficha se traza el molde (a mano o con moldería digital), se corta un prototipo en una tela barata parecida y se prueba sobre el cuerpo. Las correcciones vuelven al molde, no a la prenda.',
      ] },
    ],
    faq: [
      { p: '¿Cuáles son las etapas del diseño de indumentaria?', r: 'Investigación, bocetos, ficha técnica, moldería, prototipo, corrección y producción.' },
      { p: '¿Qué es una ficha técnica de indumentaria?', r: 'El documento con el dibujo plano, materiales, avíos, costuras y medidas que permite reproducir una prenda.' },
      { p: '¿Hace falta saber dibujar para diseñar ropa?', r: 'Ayuda, pero lo importante es comunicar proporciones y detalles; un dibujo plano prolijo alcanza.' },
    ],
  },
  {
    slug: 'patronaje-basico-base-de-falda',
    titulo: 'Patronaje básico: cómo trazar la base de una falda',
    descripcion: 'Guía de patronaje para principiantes: qué medidas usar y cómo trazar paso a paso la base de falda recta, con pinzas y holguras.',
    resumen: 'La base de falda se traza con tres medidas (cintura, cadera y largo): se dibuja un rectángulo de cadera ÷4 más holgura por el largo, se marca la línea de cadera unos 20 cm debajo de la cintura y la diferencia entre cadera y cintura se reparte en pinzas y en el costado.',
    fecha: '2026-09-28',
    lectura: 9,
    categoria: 'Patronaje',
    imagen: { src: unsplash('1452860606245-08befc0ff44b'), alt: 'Herramientas de corte y medición: tijera, cúter circular, cintas y cinta adhesiva sobre mesa celeste' },
    etiquetas: ['patronaje', 'moldería', 'faldas', 'principiantes'],
    secciones: [
      { h2: 'Qué medidas necesitás', parrafos: ['Para una falda recta alcanza con tres medidas del cuerpo:'], lista: [
        'Contorno de cintura.',
        'Contorno de cadera, por la parte más ancha.',
        'Altura de cadera (de la cintura a la línea de cadera, unos 18–22 cm).',
        'Largo de la falda.',
      ] },
      { h2: 'Trazado paso a paso (un cuarto de falda)', parrafos: ['Se traza un cuarto del contorno porque la falda es simétrica: delantero y espalda, cada uno al doblez.'], lista: [
        'Dibujá un rectángulo de ancho = cadera ÷ 4 + 1 cm de holgura y alto = largo de la falda.',
        'Marcá la línea de cadera a la altura de cadera, medida desde arriba.',
        'Arriba, marcá cintura ÷ 4. La diferencia con la cadera es lo que hay que «sacar».',
        'Sacá la mitad de esa diferencia en el costado (curva de cadera) y la otra mitad en una pinza.',
        'Subí el costado 1 cm en la cintura y uní con una curva suave.',
      ] },
      { h2: 'De la base a otros modelos', parrafos: [
        'Con la base probada, cerrar pinzas y abrir el molde da una falda evasé; agregar volumen en el ruedo, una campana. Por eso conviene tener la base corregida sobre el cuerpo antes de transformarla.',
      ] },
    ],
    faq: [
      { p: '¿Qué es el patronaje?', r: 'La técnica de trazar los moldes de una prenda a partir de las medidas del cuerpo.' },
      { p: '¿Por qué se traza un cuarto de la falda?', r: 'Porque la falda es simétrica: con un cuarto se cortan delantero y espalda al doblez.' },
      { p: '¿Cuánta holgura lleva una falda recta?', r: 'Alrededor de 4 cm en el contorno total de cadera, es decir 1 cm en cada cuarto.' },
    ],
  },
  {
    slug: 'molderia-digital-que-es-y-como-empezar',
    titulo: 'Moldería digital: qué es y cómo empezar en tu taller',
    descripcion: 'Qué es la moldería digital, qué ventajas tiene frente al molde en papel, qué programas existen y cómo imprimir moldes en casa para empezar.',
    resumen: 'La moldería digital es trazar, guardar y escalar los moldes en la computadora en lugar de en papel. Permite corregir sin volver a trazar, escalar talles más rápido, guardar todo ordenado e imprimir en hojas A4 o en plotter.',
    fecha: '2026-09-22',
    lectura: 7,
    categoria: 'Moldería digital',
    imagen: { src: unsplash('1597484661643-2f5fef640dd1'), alt: 'Herramientas de taller y materiales de colores ordenados sobre fondo negro' },
    etiquetas: ['moldería digital', 'patronaje', 'escalado de talles', 'tecnología'],
    secciones: [
      { h2: '¿Qué ventajas tiene?', parrafos: ['El molde de papel funciona, pero tiene límites cuando el taller crece:'], lista: [
        'Una corrección se hace una vez y queda guardada.',
        'El escalado de talles es más rápido y parejo.',
        'Los moldes no se rompen, no se pierden y se pueden compartir.',
        'Se puede calcular el consumo de tela antes de cortar.',
      ] },
      { h2: '¿Con qué se hace?', parrafos: [
        'Hay programas específicos de moldería (pagos y libres) y también se puede trabajar en programas de dibujo vectorial. Para empezar, conviene uno que permita trazar con medidas exactas y exportar a PDF por hojas.',
      ] },
      { h2: 'Cómo empezar sin plotter', parrafos: [
        'Digitalizá primero tus bases ya probadas (falda, corpiño, pantalón). Imprimilas en A4 con marcas de unión, pegalas y verificá con una regla el cuadrado de control antes de cortar.',
        'Guardá junto a cada molde la tabla de medidas con la que se hizo: en TEXMA podés tener las medidas de cada clienta a mano mientras trabajás.',
      ] },
    ],
    faq: [
      { p: '¿Qué es la moldería digital?', r: 'Trazar, modificar, escalar y guardar moldes de ropa en la computadora en lugar de en papel.' },
      { p: '¿Necesito un plotter?', r: 'No para empezar: los moldes se pueden imprimir en hojas A4 y unir con marcas de control.' },
      { p: '¿Sirve para ropa a medida?', r: 'Sí: se parte de una base y se ajusta con las medidas de cada clienta sin volver a trazar todo.' },
    ],
  },
  {
    slug: 'upcycling-ideas-para-transformar-ropa',
    titulo: 'Upcycling: 7 ideas para transformar ropa que ya no usás',
    descripcion: 'Qué es el upcycling en moda y 7 ideas concretas para transformar jeans, camisas y retazos en prendas nuevas, con la mercería que ya tenés.',
    resumen: 'El upcycling es transformar prendas o retazos en algo de más valor que el original, en lugar de tirarlos. Jeans que pasan a ser faldas, camisas que se vuelven tops, retazos que se unen en patchwork: menos residuo y piezas únicas.',
    fecha: '2026-09-16',
    lectura: 6,
    categoria: 'Upcycling',
    imagen: { src: unsplash('1604176354204-9268737828e4'), alt: 'Pila de jeans doblados sostenida en brazos, lista para reciclar' },
    etiquetas: ['upcycling', 'moda sostenible', 'reciclar ropa', 'jean'],
    secciones: [
      { h2: '¿Upcycling o reciclaje?', parrafos: [
        'El reciclaje convierte la tela en materia prima (fibra, relleno). El upcycling la conserva y la rediseña: el resultado vale más que la prenda de partida y no gasta energía en procesarla.',
      ] },
      { h2: '7 ideas para empezar', parrafos: ['Ordenadas de la más fácil a la más trabajosa:'], lista: [
        'Jean a short: cortá 2 cm más largo de lo que querés y deshilachá o doblá el ruedo.',
        'Jean a falda: descosé la entrepierna, abrí y completá los triángulos con otra tela.',
        'Camisa grande a top: entallá con pinzas y sumá un elástico en la espalda.',
        'Botones nuevos: cambiar todos los botones renueva una prenda en minutos.',
        'Patchwork de retazos para bolsos, almohadones o paneles de una campera.',
        'Remera a bolsa de compras: sin costura en la boca, solo cortes y un nudo en la base.',
        'Teñido de prendas desteñidas para unificar color.',
      ] },
      { h2: 'Upcycling como servicio del taller', parrafos: [
        'Cada vez más clientas piden transformar prendas que quieren conservar. Cobralo como un trabajo de diseño, no como un arreglo: la prenda que sale es nueva.',
      ] },
    ],
    faq: [
      { p: '¿Qué es el upcycling?', r: 'Transformar ropa o retazos en piezas de más valor que el original, en lugar de desecharlos.' },
      { p: '¿Cuál es la diferencia con el reciclaje?', r: 'El reciclaje convierte la tela en materia prima; el upcycling la conserva y la rediseña.' },
      { p: '¿Qué prendas son más fáciles para empezar?', r: 'El jean y las camisas de algodón: son resistentes y fáciles de cortar y coser.' },
    ],
  },
  {
    slug: 'asesoria-de-imagen-para-modistas',
    titulo: 'Asesoría de imagen: cómo sumarla a tu taller de costura',
    descripcion: 'Qué es la asesoría de imagen, qué incluye (colorimetría, morfología, estilo) y cómo una modista puede ofrecerla junto con la confección a medida.',
    resumen: 'La asesoría de imagen ayuda a una persona a vestirse según su cuerpo, sus colores y su estilo de vida. Para una modista es un complemento natural: ya conoce las medidas de su clienta y puede proponer cortes y telas que le queden bien.',
    fecha: '2026-09-12',
    lectura: 6,
    categoria: 'Asesoría de imagen',
    imagen: { src: unsplash('1520006403909-838d6b92c22e'), alt: 'Mujer eligiendo prendas estampadas en un perchero' },
    etiquetas: ['asesoría de imagen', 'colorimetría', 'morfología', 'estilo personal'],
    secciones: [
      { h2: '¿Qué incluye una asesoría de imagen?', parrafos: ['Suele tener tres partes:'], lista: [
        'Colorimetría: qué colores favorecen según el tono de piel, ojos y pelo.',
        'Morfología: qué cortes, largos y escotes equilibran la silueta.',
        'Estilo y armario: qué prendas sumar o sacar según la vida real de la persona.',
      ] },
      { h2: 'Por qué le conviene a una modista', parrafos: [
        'Ya tenés lo más difícil: la confianza de la clienta y sus medidas exactas. Recomendar el largo de una falda o la caída de una tela según su cuerpo es asesoría de imagen aplicada.',
        'Además, una clienta que sabe qué le queda bien encarga más prendas a medida y vuelve.',
      ] },
      { h2: 'Cómo empezar a ofrecerla', parrafos: [
        'Arrancá con una consulta corta antes de cada encargo importante (vestido de fiesta, novia): colores, largo y escote. Anotá lo que acordaron en la ficha de la clienta para la próxima vez.',
      ] },
    ],
    faq: [
      { p: '¿Qué es la asesoría de imagen?', r: 'Un servicio que ayuda a vestirse según el cuerpo, los colores y el estilo de vida de cada persona.' },
      { p: '¿Qué es la colorimetría?', r: 'El análisis de qué colores favorecen a una persona según su tono de piel, ojos y pelo.' },
      { p: '¿Una modista puede ofrecer asesoría de imagen?', r: 'Sí: conoce el cuerpo de la clienta y las telas, y puede proponer cortes y colores que le queden bien.' },
    ],
  },
  {
    slug: 'tendencias-textiles-telas-y-colores',
    titulo: 'Tendencias textiles: telas, colores y terminaciones que conviene conocer',
    descripcion: 'Las tendencias textiles que más se ven en talleres y tiendas: fibras naturales, tejidos con textura, colores tierra y terminaciones visibles. Qué tener en stock.',
    resumen: 'Las tendencias textiles de las últimas temporadas van hacia fibras naturales y mezclas recicladas, telas con textura (lino, gasa arrugada, punto grueso), paletas tierra con acentos fuertes y terminaciones a la vista como pespuntes y bordes deshilachados.',
    fecha: '2026-09-06',
    lectura: 5,
    categoria: 'Tendencias textiles',
    imagen: { src: unsplash('1601924994987-69e26d50dc26'), alt: 'Prendas de colores vivos colgadas en un perchero de vidriera' },
    etiquetas: ['tendencias textiles', 'telas', 'colores', 'moda'],
    secciones: [
      { h2: 'Fibras naturales y mezclas recicladas', parrafos: [
        'Lino, algodón y viscosa siguen ganando lugar frente al poliéster puro, y aparecen cada vez más mezclas con fibra reciclada. Para coserlas, el hilo de poliéster sigue siendo el más versátil.',
      ] },
      { h2: 'Textura a la vista', parrafos: [
        'Lino lavado, gasa arrugada, punto grueso y bouclé: telas que se notan al tacto y piden cortes simples para lucirse.',
      ] },
      { h2: 'Colores y terminaciones', parrafos: ['Lo que más se repite:'], lista: [
        'Paletas tierra (arena, terracota, oliva) con un acento fuerte como fucsia o cobalto.',
        'Pespuntes en contraste y costuras a la vista.',
        'Bordes crudos o deshilachados en jean y lino.',
        'Botones protagonistas: madera, nácar y metal envejecido.',
      ] },
      { h2: 'Qué tener en la mercería', parrafos: [
        'Hilos en tonos tierra y en colores de contraste para pespuntes, cierres metálicos y botones de materiales naturales. Las tendencias pasan; un stock bien elegido acompaña varias temporadas.',
      ] },
    ],
    faq: [
      { p: '¿Qué telas son tendencia?', r: 'Las fibras naturales con textura, como lino lavado, gasa arrugada y punto grueso, y las mezclas con fibra reciclada.' },
      { p: '¿Qué colores se usan más?', r: 'Paletas tierra combinadas con un acento fuerte, como fucsia o azul cobalto.' },
      { p: '¿Qué hilo uso para lino?', r: 'Hilo de poliéster para costuras resistentes o algodón mercerizado si la prenda es 100 % lino y se va a planchar fuerte.' },
    ],
  },
];

export const CATEGORIAS = [...new Set(ARTICULOS.map(a => a.categoria))];

export const getArticulo = (slug: string) => ARTICULOS.find(a => a.slug === slug) ?? null;
