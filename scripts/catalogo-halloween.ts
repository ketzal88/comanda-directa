import type { Carta, ConfigPedido, Item, Tema } from '@/logica/tipos';

/** Catálogo de temporada de Halloween: disfraces, cotillón y decoración.
 *  Es la carga inicial de un cliente del motor (`scripts/seed-halloween.ts`),
 *  no una carta de muestra: vive en `scripts/` y no entra en el bundle.
 *
 *  Dos cosas que este catálogo estrena respecto de un restaurante y que
 *  conviene no deshacer sin pensarlo:
 *
 *  - **El talle viaja como variante, no dentro del nombre.** Un disfraz en el
 *    talle equivocado es una devolución; `logica/pedido.ts` mete la variante
 *    elegida en el mensaje de WhatsApp ("Disfraz Medusa · Talle L"), mientras
 *    que un talle escrito adentro del nombre no distingue cuál pidió el
 *    comprador cuando el mismo disfraz viene en más de uno.
 *  - **No hay salón ni cubierto**: `modalidades` abre solo retiro y delivery,
 *    y `cubiertoPorPersona` queda en 0 (la pantalla lo oculta sola).
 */

export const SLUG_HALLOWEEN = 'halloween';
export const NOMBRE_HALLOWEEN = 'Halloween';

/** De dónde salieron los productos y los precios, por si hay que rehacer la
 *  lista o buscar las fotos. NO se inserta en la base ni se muestra: son
 *  URLs del mayorista y esta carta la ve el comprador final. */
export const FUENTE =
  'mayoristas.merakys.com.ar — selección comercial de Halloween, precios de venta en ARS';

/** Negro de noche, naranja calabaza. El acento pinta los precios, el índice
 *  activo y el botón de enviar (ver `[cliente]/layout.tsx`). */
export const TEMA_HALLOWEEN: Tema = {
  colorFondo: '#120f1a',
  colorTexto: '#f5f0ea',
  colorTextoSuave: '#9b8fa8',
  colorAcento: '#ff7518',
};

export const CONFIG_PEDIDO_HALLOWEEN: ConfigPedido = {
  whatsapp: '5491132556379',
  // Sin salón: no es un local con mesas. Delivery queda abierto sin zonas
  // cargadas (el envío se acuerda por chat); cargarlas en el panel hace que
  // el costo se sume solo al total.
  modalidades: ['retiro', 'delivery'],
  cabecera: '',
  // Sin "link" hasta que exista el generador de Mercado Pago.
  mediosDePago: ['transferencia', 'efectivo'],
  zonasEnvio: [],
  descuentoRetiro: { tipo: 'ninguno' },
};

type Fila = {
  id: string;
  nombre: string;
  /** ENTERO en pesos. 0 = sin precio de lista: la fila no muestra precio y el
   *  total sale "a confirmar". Se ignora cuando la fila trae `opciones`. */
  precio: number;
  descripcion?: string;
  /** `[etiqueta, precio]` por talle o medida elegible. Hasta 16 caracteres la
   *  etiqueta (`MAX_ETIQUETA_VARIANTE` en `logica/validar-item.ts`).
   *
   *  Va acá, y no adentro del nombre ni en la descripción, cuando el
   *  comprador ELIGE: el talle de un disfraz (dato de despacho) y la medida
   *  de un producto que viene en más de una. La ficha técnica de algo que se
   *  vende en una sola medida (el largo de una guirnalda, los cm de una
   *  capa única) va en `descripcion`, que no viaja al pedido porque no hay
   *  nada que elegir. */
  opciones?: [string, number][];
};

/** Una categoría entera desde una tabla: el `orden` sale de la posición, así
 *  reordenar es mover una línea y no renumerar doce. */
function categoria(categoriaId: string, filas: Fila[]): Item[] {
  return filas.map((f, i) => ({
    id: f.id,
    numero: 0, // derivado: lo recalcula `renumerar()` al leer la carta
    nombre: f.nombre,
    categoriaId,
    orden: i + 1,
    precio: f.opciones ? 0 : f.precio,
    variantes: (f.opciones ?? []).map(([etiqueta, precio]) => ({ etiqueta, precio })),
    agotado: false,
    activo: true,
    etiquetas: [],
    ...(f.descripcion ? { descripcion: f.descripcion } : {}),
  }));
}

const INFANTILES = categoria('infantiles', [
  { id: 'set-diablita', nombre: 'Set Diablita', precio: 11600 },
  { id: 'tutu-spooky', nombre: 'Tutú Spooky Negro', precio: 6700 },
  { id: 'set-brujita-rosa', nombre: 'Set Brujita Chispeante Rosa', precio: 8500 },
  { id: 'set-brujito-negro', nombre: 'Set Brujito Hechicera Negro', precio: 8500 },
  { id: 'payaso-nina', nombre: 'Disfraz Payaso Niña', precio: 0, opciones: [['M (7 a 9)', 21900]] },
  { id: 'pesadilla-nino', nombre: 'Disfraz Pesadilla Niño', precio: 0, opciones: [['M (7 a 9)', 21300]] },
  { id: 'vampira-nina', nombre: 'Disfraz Vampira Niña', precio: 0, opciones: [['M (7 a 9)', 29100]] },
  { id: 'parca-nino', nombre: 'Disfraz La Parca Niño', precio: 0, opciones: [['M (7 a 9)', 18800]] },
  {
    id: 'esqueleto-nina',
    nombre: 'Disfraz Esqueleto Niña',
    precio: 0,
    opciones: [
      ['S (5 a 6)', 23600],
      ['M (7 a 9)', 23600],
    ],
  },
  {
    id: 'esqueleto-nino',
    nombre: 'Disfraz Esqueleto Niño',
    precio: 0,
    opciones: [
      ['XS (2 a 4)', 20500],
      ['S (5 a 6)', 20500],
      ['M (7 a 9)', 20500],
    ],
  },
  { id: 'dino-nino', nombre: 'Disfraz Dino Niño', precio: 0, opciones: [['S (5 a 6)', 23100]] },
]);

const ADULTO = categoria('adulto', [
  // La lista traía la capa reversible dos veces, una por largo. Como dos
  // ítems se llaman igual en la carta y en el mensaje de WhatsApp, y el local
  // no sabría cuál despachar: es un producto con dos medidas.
  {
    id: 'capa-reversible',
    nombre: 'Capa Reversible Negro/Rojo',
    precio: 0,
    opciones: [
      ['80 cm', 9400],
      ['130 cm', 12800],
    ],
  },
  { id: 'capa-dark-larga', nombre: 'Capa Dark Larga', precio: 8500 },
  { id: 'capa-dorada', nombre: 'Capa Dorada', precio: 12900, descripcion: '130 cm.' },
  { id: 'ninja-otaku', nombre: 'Disfraz Ninja Otaku', precio: 0, opciones: [['Talle L', 28500]] },
  { id: 'ninja-otaku-mujer', nombre: 'Disfraz Ninja Otaku Mujer', precio: 0, opciones: [['Talle M', 26700]] },
  { id: 'medusa', nombre: 'Disfraz Medusa', precio: 0, opciones: [['Talle L', 28000]] },
  { id: 'preso', nombre: 'Disfraz Preso', precio: 0, opciones: [['Talle M', 33300]] },
  {
    id: 'payaso-malvado',
    nombre: 'Disfraz Payaso Malvado',
    precio: 0,
    opciones: [
      ['Talle M', 35000],
      ['Talle L', 35000],
    ],
  },
  { id: 'pesadilla-hombre', nombre: 'Disfraz Pesadilla Hombre', precio: 0, opciones: [['Talle L', 17000]] },
  {
    id: 'thriller',
    nombre: 'Disfraz Thriller',
    precio: 0,
    opciones: [
      ['Talle M', 36400],
      ['Talle L', 36400],
    ],
  },
  { id: 'la-mascara', nombre: 'Disfraz La Máscara', precio: 0, opciones: [['Talle L', 41800]] },
  {
    id: 'inflable-dino-adulto',
    nombre: 'Disfraz Inflable Dinosaurio',
    precio: 86300,
    descripcion: 'Talle adulto.',
  },
]);

const WOW = categoria('wow', [
  { id: 'escoba-caminante', nombre: 'Escoba Caminante', precio: 32700 },
  { id: 'bruja-en-caja', nombre: 'Bruja en Caja', precio: 46600 },
  { id: 'guardian-fantasmal', nombre: 'Guardián Fantasmal', precio: 49800 },
  { id: 'payasin-macabro', nombre: 'Payasín Macabro', precio: 58200 },
  { id: 'extractor-de-almas', nombre: 'Extractor de Almas', precio: 61800 },
  { id: 'bruja-misteriosa', nombre: 'Bruja Misteriosa', precio: 64800 },
  { id: 'portador-oscuridad', nombre: 'Portador de la Oscuridad', precio: 108700 },
  { id: 'recolector-almas', nombre: 'Recolector de Almas Desgraciadas', precio: 120000 },
  { id: 'guardian-cementerio', nombre: 'Guardián Macabro del Cementerio', precio: 139200 },
  { id: 'inflable-bosque', nombre: 'Inflable Bosque Encantado', precio: 175500 },
  { id: 'inflable-rip', nombre: 'Inflable Amigos R.I.P.', precio: 181600 },
  { id: 'inflable-castillo', nombre: 'Inflable Castillo Halloween', precio: 266300 },
]);

const ACCESORIOS = categoria('accesorios', [
  { id: 'vincha-cuernos-led', nombre: 'Vincha Cuernos Diablita LED', precio: 800 },
  { id: 'tatuajes-cortes', nombre: 'Tatuajes Set Cortes de Cara', precio: 1000 },
  { id: 'tatuajes-heridas', nombre: 'Tatuajes Set Heridas', precio: 1400 },
  { id: 'lentes-sangrientos', nombre: 'Lentes Sangrientos', precio: 2000 },
  { id: 'guantes-esqueleto', nombre: 'Guantes Esqueleto', precio: 2100 },
  { id: 'sombrero-bruja-luna', nombre: 'Sombrero Bruja por la Luna', precio: 2200 },
  { id: 'medias-esqueleto', nombre: 'Medias Esqueleto', precio: 2700, descripcion: 'Talle 7/8.' },
  { id: 'sombrero-bruja-mistica', nombre: 'Sombrero Bruja Mística', precio: 4000 },
  { id: 'medias-cicatriz', nombre: 'Medias Cicatriz', precio: 4100, descripcion: 'Talle 7/8.' },
  { id: 'mascara-purga-led', nombre: 'Máscara Purga LED', precio: 6200 },
  { id: 'poncho-bruja', nombre: 'Poncho Bruja con Telaraña', precio: 7100 },
  { id: 'mascara-joker-led', nombre: 'Máscara Joker LED', precio: 7400 },
]);

const TRICK_OR_TREAT = categoria('trick-or-treat', [
  { id: 'plato-boo', nombre: 'Plato Boo x6', precio: 1400 },
  { id: 'vaso-calavera-mexicana', nombre: 'Vaso Calavera Mexicana x6', precio: 1400 },
  { id: 'servilletas-boo', nombre: 'Servilletas Boo x20', precio: 1600 },
  { id: 'plato-calabaza', nombre: 'Plato Calabaza x6', precio: 1800 },
  { id: 'guirnalda-miedo', nombre: 'Guirnalda Miedo', precio: 2000, descripcion: '300 cm.' },
  {
    id: 'guirnalda-happy-halloween',
    nombre: 'Guirnalda Happy Halloween',
    precio: 2300,
    descripcion: '230 cm.',
  },
  { id: 'globos-calabazas', nombre: 'Set Globos Halloween Calabazas', precio: 2700 },
  { id: 'bolsa-papel-boo', nombre: 'Bolsa de Papel Boo x8', precio: 2900 },
  { id: 'copa-calavera', nombre: 'Copa Calavera', precio: 2900 },
  { id: 'banner-happy-halloween', nombre: 'Banner Happy Halloween', precio: 2900 },
  { id: 'balde-caramelera', nombre: 'Balde Caramelera', precio: 3300 },
  // Precio en 0 a propósito: la lista dice "desde 900" y el final depende de
  // la medida. Un ítem en 0 se muestra sin precio y deja el total en "a
  // confirmar", que es exactamente lo que pasa. Cuando estén las medidas van
  // como variantes y deja de ser "a confirmar".
  {
    id: 'cortina-halloween',
    nombre: 'Cortina Halloween',
    precio: 0,
    descripcion: 'Desde $900. El precio final depende de la medida: consultala al hacer el pedido.',
  },
]);

const DECORACION = categoria('decoracion', [
  { id: 'telarana', nombre: 'Telaraña Halloween', precio: 800 },
  { id: 'caldero-chico', nombre: 'Caldero de Bruja Chico', precio: 1500 },
  { id: 'set-cucarachas', nombre: 'Set Cucarachas x12', precio: 1700 },
  { id: 'vela-led-mano', nombre: 'Vela LED Mano Tenebrosa', precio: 2100 },
  { id: 'set-murcielagos', nombre: 'Set Murciélagos x4', precio: 2200 },
  { id: 'mini-balde-fantasma', nombre: 'Mini Balde Fantasma', precio: 2300 },
  { id: 'mini-balde-gato', nombre: 'Mini Balde Gato Negro', precio: 2300 },
  { id: 'set-moscas', nombre: 'Set Moscas x20', precio: 2300 },
  { id: 'set-aranas', nombre: 'Set Arañas', precio: 2500 },
  { id: 'vela-led-ritual', nombre: 'Vela LED Ritual', precio: 2500 },
  { id: 'set-escorpiones', nombre: 'Set Escorpiones x12', precio: 2600 },
  { id: 'set-ciempies', nombre: 'Set Ciempiés', precio: 3100 },
  { id: 'cerebro-con-luz', nombre: 'Cerebro con Luz', precio: 3600, descripcion: '12 x 10 cm.' },
  { id: 'mano-cortada', nombre: 'Mano Cortada Sangrienta', precio: 4600 },
  { id: 'caldero-grande', nombre: 'Caldero de Bruja Grande', precio: 6700 },
  { id: 'cuchillo-sangriento', nombre: 'Cuchillo Sangriento', precio: 8200 },
  { id: 'colgante-san-la-muerte', nombre: 'Colgante San La Muerte', precio: 9600 },
  { id: 'lapida-embrujo', nombre: 'Lápida Embrujo de la Muerte', precio: 12000 },
  { id: 'arana-gigante', nombre: 'Araña Gigante Roja y Negra', precio: 12000 },
  { id: 'tumba-maldita', nombre: 'Tumba Maldita Muerte', precio: 16300 },
  { id: 'colgante-altar', nombre: 'Colgante Abandonada en el Altar', precio: 22500 },
  { id: 'colgante-viuda-negra', nombre: 'Colgante Viuda Negra Llorona', precio: 22500 },
]);

/** La lista original repetía dos productos en dos categorías cada uno
 *  ("Plato Calabaza x6" y "Escoba Caminante"). Acá aparecen una sola vez —en
 *  Trick or Treat y en Halloween WOW—: un mismo producto cargado dos veces
 *  son dos líneas distintas en el pedido, y el comprador que suma las dos
 *  cree que pidió dos cosas. */
export const CATALOGO_HALLOWEEN: Carta = {
  categorias: [
    { id: 'infantiles', nombre: 'DISFRACES INFANTILES', nombreEn: '', orden: 1, subcategorias: [] },
    { id: 'adulto', nombre: 'DISFRACES ADULTO', nombreEn: '', orden: 2, subcategorias: [] },
    { id: 'wow', nombre: 'HALLOWEEN WOW', nombreEn: '', orden: 3, subcategorias: [] },
    { id: 'accesorios', nombre: 'ACCESORIOS', nombreEn: '', orden: 4, subcategorias: [] },
    { id: 'trick-or-treat', nombre: 'TRICK OR TREAT', nombreEn: '', orden: 5, subcategorias: [] },
    { id: 'decoracion', nombre: 'DECORACIÓN', nombreEn: '', orden: 6, subcategorias: [] },
  ],
  items: [...INFANTILES, ...ADULTO, ...WOW, ...ACCESORIOS, ...TRICK_OR_TREAT, ...DECORACION],
  config: {
    notas: [
      'Precios en pesos, sujetos a disponibilidad de stock.',
      'Armá el pedido y mandalo por WhatsApp: te confirmamos stock, envío y forma de pago.',
    ],
    cubiertoPorPersona: 0,
  },
};
