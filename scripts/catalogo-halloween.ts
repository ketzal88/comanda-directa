import MERAKYS from './data/merakys.json';
import PLANILLA from './data/piedro-planilla.json';
import type { Carta, ConfigPedido, Item, Tema } from '@/logica/tipos';

type ProductoMayorista = { nombre: string; precio: number; slug: string; categoria: string };

/** Lo que se le suma al precio del mayorista para llegar al de venta.
 *
 *  Está acá, una sola vez, y NO pegado a cada producto: son 158 precios que el
 *  proveedor mueve, y con el margen repartido por la tabla cambiarlo sería
 *  reescribir el archivo entero y rezar. Para repreciar todo: se corre
 *  `traer-merakys.ts` de nuevo y se toca este número.
 *
 *  Los disfraces y el cotillón de más abajo vienen con el precio de venta ya
 *  calculado de la lista original (traían ~17%): a esos este margen NO se les
 *  aplica, para no cobrarlo dos veces. */
export const MARGEN = 0.3;

/** El precio de venta, redondeado a los $100 más cercanos.
 *
 *  Redondear no es cosmética: `27.900 × 1,30` da `36.270`, y una carta llena
 *  de precios con dos dígitos sueltos se lee como una planilla exportada, no
 *  como una lista de precios. */
function conMargen(precioMayorista: number): number {
  return Math.round((precioMayorista * (1 + MARGEN)) / 100) * 100;
}

/** El id del ítem sale del slug del mayorista: ya es único, ya está en
 *  minúsculas con guiones, y es el mismo que usa `fotos-halloween.ts` para ir
 *  a buscar la foto. */
/** Lo que se come la tarjeta (comisión con IVA, el número de la planilla del
 *  cliente). El precio de LISTA de la carta es el de tarjeta: el de efectivo
 *  dividido por `1 - COMISION_TARJETA`, redondeado a los $100 de arriba. */
export const COMISION_TARJETA = 0.1;

/** El descuento pagando en efectivo o transferencia. Lo aplica el motor al
 *  elegir el medio de pago (`descuentosPago`): el total de la hoja y del
 *  mensaje de WhatsApp ya salen con el descuento. */
export const DESCUENTO_EFECTIVO = 0.1;

function precioTarjeta(precioEfectivo: number): number {
  return Math.ceil(precioEfectivo / (1 - COMISION_TARJETA) / 100) * 100;
}

function idDeSlug(slug: string): string {
  return slug;
}

/** El mayorista escribe "R.i.p" y "Animatronic Lobisón". Se corrigen las
 *  siglas que quedaron a medio capitalizar y nada más: el nombre es dato del
 *  proveedor, no se reescribe a gusto. */
/** Nombres del mayorista que el cliente pidió corregir. La página del
 *  proveedor sigue con el original, y el slug (que es lo que baja la foto)
 *  no cambia. */
const NOMBRES_CORREGIDOS: Record<string, string> = {
  'Inflable Momia Ok': 'Inflable Momia',
  'Colgante Pesadilla Negro para Colgar': 'Colgante Pesadilla Negro',
};

function nombreLegible(nombre: string): string {
  return (NOMBRES_CORREGIDOS[nombre] ?? nombre).replace(/\bR\.i\.p\.?/gi, 'R.I.P.').trim();
}

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

export const SLUG_HALLOWEEN = 'piedro-shop';
export const NOMBRE_HALLOWEEN = 'Piedro Shop';

/** La carpeta del bucket `fotos` donde ya están subidas las 162 imágenes.
 *
 *  Queda en 'halloween' aunque el cliente ahora sea `piedro-shop`: las URLs
 *  guardadas en `items.foto_url` apuntan ahí, y renombrar la carpeta las
 *  rompería todas hasta volver a correr el script. Es un nombre de carpeta
 *  que no ve nadie; el costo de "arreglarlo" es 162 descargas y un rato con
 *  la carta sin fotos. */
export const CARPETA_FOTOS = 'halloween';

/** De dónde salieron los productos y los precios, por si hay que rehacer la
 *  lista o buscar las fotos. NO se inserta en la base ni se muestra: son
 *  URLs del mayorista y esta carta la ve el comprador final. */
export const FUENTE =
  'mayoristas.merakys.com.ar — selección comercial de Halloween, precios de venta en ARS';

/** La plantilla que elige `[cliente]/page.tsx` por `clientes.plantilla`. */
export const PLANTILLA_HALLOWEEN = 'halloween';

/** Papel crema, violeta y naranja calabaza: los colores del artboard de la
 *  campaña, para que quien llega desde el flyer de WhatsApp reconozca la
 *  carta como la misma marca.
 *
 *  Es un tema CLARO. El primer intento fue negro de noche, que es lo que uno
 *  dibuja cuando piensa "Halloween", pero contra un fondo negro las fotos
 *  del mayorista —recortadas sobre blanco— quedaban como ochenta recuadros
 *  brillantes. Sobre crema apoyan.
 *
 *  La plantilla trae su propia paleta ampliada (`globals.css`, bloque
 *  `.halloween`); estos cuatro son los que usa el MOTOR: la hoja del pedido
 *  y la barra inferior, que son comunes a todos los clientes. */
export const TEMA_HALLOWEEN: Tema = {
  colorFondo: '#fbf6ee',
  colorTexto: '#2a1b45',
  colorTextoSuave: '#6a5a86',
  colorAcento: '#f28a2e',
};

export const CONFIG_PEDIDO_HALLOWEEN: ConfigPedido = {
  whatsapp: '5491132556379',
  // Sólo delivery: las tres opciones que se le ofrecen al comprador son
  // DESTINOS (ver `zonasEnvio`), no formas de entrega, así que la pregunta de
  // la hoja es "¿a dónde lo mandamos?" y no "¿cómo lo querés?". Con una sola
  // modalidad habilitada el selector de modalidad ni se muestra.
  modalidades: ['delivery'],
  cabecera: '',
  // Sin "link" hasta que exista el generador de Mercado Pago. "tarjeta" paga
  // el precio de lista; los otros dos, con descuento.
  mediosDePago: ['efectivo', 'transferencia', 'tarjeta'],
  // Los destinos que se ofrecen. Cargados acá y no escritos en el diseño, el
  // precio se suma solo al total y viaja en el mensaje de WhatsApp; la
  // plantilla lee esta misma lista para los carteles del encabezado y del
  // pie, así que no pueden decir una cosa y cobrar otra.
  //
  //   0    = sin cargo (la carta lo anuncia como "envío gratis")
  //   null = a convenir: no se suma al total y el mensaje sale sin monto
  zonasEnvio: [
    { nombre: 'Villanueva', precio: 0 },
    { nombre: 'Nordelta', precio: 0 },
    { nombre: 'A convenir', precio: null },
  ],
  descuentoRetiro: { tipo: 'ninguno' },
  descuentosPago: {
    efectivo: { tipo: 'porcentaje', valor: DESCUENTO_EFECTIVO * 100 },
    transferencia: { tipo: 'porcentaje', valor: DESCUENTO_EFECTIVO * 100 },
  },
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

/** Todo lo que no es animatrónico ni inflable sale de la planilla final del
 *  cliente (hojas "Catálogo" y "Combos"), volcada tal cual a
 *  `scripts/data/piedro-planilla.json`. Se toma el precio CON TARJETA, que es
 *  el de lista: pagando en efectivo se le descuenta `DESCUENTO_EFECTIVO`
 *  (lo aplica el motor al elegir el medio de pago).
 *
 *  La planilla trae un disfraz por fila y por talle ("Disfraz Preso Talle M",
 *  "Disfraz Preso Talle L"). Acá se juntan en un producto con variantes: dos
 *  filas con el mismo nombre en la carta son dos líneas que el local no
 *  distingue al despachar. */
type ProductoPlanilla = {
  grupo: string;
  nombre: string;
  codigo: string;
  tarjeta: number;
  slug: string;
  nota: string | null;
  stock: string;
};
type ComboPlanilla = {
  nombre: string;
  efectivo: number;
  tarjeta: number;
  productos?: { codigo: string; cantidad: number }[];
  /** Un combo que se elige: "Disfraz completo" en Brujita o en Esqueleto, y
   *  el Esqueleto además en talle. Textos tal cual del bloque "PARA LA WEB"
   *  de la hoja. */
  descripcion?: string;
  looks?: { look: string; incluye: string; talles: string[] }[];
};

/** Un combo con looks es UN producto con una variante por look y talle
 *  ("Brujita", "Esqueleto S 5-6"), todas al mismo precio: la variante viaja
 *  en el mensaje de WhatsApp ("Disfraz completo · Esqueleto S 5-6"), que es
 *  lo que el local necesita para armarlo. Las etiquetas entran en los 16
 *  caracteres del panel (lo verifica la prueba). */
/** "a, b, c y d" → ["A", "B", "C", "D"]: la lista de la planilla, una por
 *  renglón, para que en la ficha se lea como viñetas. */
function enRenglones(lista: string): string[] {
  return lista
    .split(/,\s*|\s+y\s+(?=[^,]*$)/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x[0].toUpperCase() + x.slice(1));
}

function comboConLooks(c: ComboPlanilla): Fila {
  const looks = c.looks!;
  // Formato de la descripción: un renglón que empieza con "- " es una viñeta
  // (lo pinta `ModalProducto`); el panel lo muestra y edita como texto.
  const incluye = looks
    .map((l) => {
      const talles = l.talles.length
        ? ` (talle ${l.talles.map((t) => `${t} años`).join(' o ')})`
        : '';
      return [`Look ${l.look}${talles}:`, ...enRenglones(l.incluye).map((x) => `- ${x}`)].join('\n');
    })
    .join('\n\n');
  return {
    id: `combo-${slugDe(c.nombre)}`,
    nombre: c.nombre,
    precio: 0,
    opciones: looks.flatMap((l) =>
      l.talles.length
        ? l.talles.map((t): [string, number] => [`${l.look} ${t}`, c.tarjeta])
        : [[l.look, c.tarjeta] as [string, number]],
    ),
    descripcion: `${c.descripcion}\n\n${incluye}`,
  };
}

const PRODUCTOS_PLANILLA = PLANILLA.productos as ProductoPlanilla[];
const SLUGS_MAYORISTA = new Set((MERAKYS as ProductoMayorista[]).map((p) => p.slug));

/** "Talle S (5-6 años)" → "S (5 a 6)"; "Talle M" → "Talle M". Una medida
 *  suelta ("80 cm") sólo es variante si hay otra fila con el mismo nombre
 *  base: si no, es la ficha técnica del producto y queda en el nombre. */
function separarVariante(nombre: string): { base: string; etiqueta: string | null; talle: boolean } {
  const t = nombre.match(/^(.*?)\s+Talle\s+(\w+)(?:\s+\((\d+)-(\d+) años\))?$/);
  if (t) return { base: t[1], etiqueta: t[3] ? `${t[2]} (${t[3]} a ${t[4]})` : `Talle ${t[2]}`, talle: true };
  const m = nombre.match(/^(.*?)\s+(\d+ cm)$/);
  if (m) return { base: m[1], etiqueta: m[2], talle: false };
  return { base: nombre, etiqueta: null, talle: false };
}

function slugDe(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function descripcionDe(p: ProductoPlanilla): string | undefined {
  const partes: string[] = [];
  if (p.nota?.toLowerCase().startsWith('preventa')) partes.push('Preventa: fecha de entrega a confirmar.');
  if (p.stock === 'A pedido') partes.push('Se trae a pedido: plazo de entrega a confirmar por WhatsApp.');
  return partes.length ? partes.join(' ') : undefined;
}

/** id del catálogo → slug del mayorista, para la foto. Se llena al armar las
 *  categorías de la planilla. */
const SLUGS_PLANILLA: Record<string, string> = {};

function deLaPlanilla(categoriaId: string, grupo: string): Item[] {
  // Lo que el mayorista ya lista como animatrónico o inflable (hoy, el
  // Colgante Viuda Negra Llorona) queda ahí y no se repite en otra categoría.
  const delGrupo = PRODUCTOS_PLANILLA.filter((p) => p.grupo === grupo && !SLUGS_MAYORISTA.has(p.slug));
  const cuentaBase = new Map<string, number>();
  for (const p of delGrupo) {
    const { base } = separarVariante(p.nombre);
    cuentaBase.set(base, (cuentaBase.get(base) ?? 0) + 1);
  }

  const filas: Fila[] = [];
  const porBase = new Map<string, Fila>();
  for (const p of delGrupo) {
    const v = separarVariante(p.nombre);
    const esVariante = v.etiqueta && (v.talle || cuentaBase.get(v.base)! > 1);
    const nombre = esVariante ? v.base : p.nombre;
    const previa = porBase.get(nombre);
    if (previa && esVariante) {
      previa.opciones!.push([v.etiqueta!, p.tarjeta]);
      continue;
    }
    const fila: Fila = {
      id: slugDe(nombre),
      nombre,
      precio: esVariante ? 0 : p.tarjeta,
      ...(esVariante ? { opciones: [[v.etiqueta!, p.tarjeta]] } : {}),
      descripcion: descripcionDe(p),
    };
    SLUGS_PLANILLA[fila.id] = p.slug;
    porBase.set(nombre, fila);
    filas.push(fila);
  }
  return categoria(categoriaId, filas);
}

const INFANTILES = deLaPlanilla('infantiles', 'Disfraces infantiles');
const ADULTO = deLaPlanilla('adulto', 'Disfraces adulto');
const ACCESORIOS = deLaPlanilla('accesorios', 'Accesorios');
const TRICK_OR_TREAT = deLaPlanilla('trick-or-treat', 'Trick or treat');
const DECORACION = deLaPlanilla('decoracion', 'Decoración');

/** Los combos de la hoja "Combos" (sólo los que el cliente marcó como "que
 *  usamos"). El precio es el CON TARJETA que calcula la planilla, igual que
 *  el de los productos sueltos: cargar el de efectivo dejaba al combo más
 *  barato que sus partes por el 10% y el descuento se aplicaba dos veces.
 *  Lo que trae cada uno va en la descripción, que es lo que se lee en la ficha.
 *  Sus fotos las manda el cliente: se suben con `scripts/foto-propia.ts`. */
const COMBOS = categoria(
  'combos',
  (PLANILLA.combos as ComboPlanilla[]).map((c) => {
    if (c.looks) return comboConLooks(c);
    const contenido = (c.productos ?? []).map(({ codigo, cantidad }) => {
      const p = PRODUCTOS_PLANILLA.find((x) => x.codigo === codigo);
      if (!p) throw new Error(`El combo "${c.nombre}" trae un código que no está en el catálogo: ${codigo}`);
      return `- ${cantidad} × ${p.nombre}`;
    });
    return {
      id: `combo-${slugDe(c.nombre)}`,
      nombre: c.nombre.startsWith('Combo') ? c.nombre : `Combo ${c.nombre}`,
      precio: c.tarjeta,
      descripcion: `Incluye:\n${contenido.join('\n')}`,
    };
  }),
);

/** Los animatrónicos y los inflables gigantes NO se escriben a mano: son 158
 *  productos y el mayorista les cambia el precio. Salen de
 *  `scripts/data/merakys.json`, que arma `traer-merakys.ts` leyendo la
 *  categoría entera del sitio del proveedor.
 *
 *  Actualizar precios es volver a correr ese script y mirar el diff del JSON:
 *  el margen se aplica acá, en un solo lugar, y no queda pegado a 158 números
 *  copiados. */
function delMayorista(categoriaId: string, categoriaMerakys: string): Item[] {
  const filas = (MERAKYS as ProductoMayorista[])
    .filter((p) => p.categoria === categoriaMerakys)
    // de menor a mayor: los primeros doce son los que se ven sin desplegar la
    // sección, y arrancar por un animatrónico de un millón ochocientos espanta
    .sort((a, b) => a.precio - b.precio)
    .map((p) => ({
      id: idDeSlug(p.slug),
      nombre: nombreLegible(p.nombre),
      precio: precioTarjeta(conMargen(p.precio)),
    }));

  return categoria(categoriaId, filas);
}

/** Los animatrónicos son 133: partidos por cómo se ponen. "Colgante" sale del
 *  nombre del mayorista ("Colgante …", "… para colgar"); el resto se apoya. No
 *  hay grupo "con sensor": el mayorista sólo lo aclara en uno (Hombre Lobo). */
const SUB_COLGANTES = 'Colgantes';
const SUB_APOYAR = 'De piso y mesa';
const MERAKYS_POR_ID = new Map((MERAKYS as ProductoMayorista[]).map((p) => [idDeSlug(p.slug), p]));
function conSubgrupo(items: Item[]): Item[] {
  return items.map((i) => ({
    ...i,
    subcategoria: /colga/i.test(MERAKYS_POR_ID.get(i.id)?.nombre ?? i.nombre) ? SUB_COLGANTES : SUB_APOYAR,
  }));
}

const ANIMATRONICOS = conSubgrupo(delMayorista('animatronicos', 'animatronics'));
const INFLABLES = delMayorista('inflables', 'deco-inflables-gigantes');

export const CATALOGO_HALLOWEEN: Carta = {
  categorias: [
    { id: 'combos', nombre: 'COMBOS', nombreEn: '', orden: 1, subcategorias: [] },
    { id: 'infantiles', nombre: 'DISFRACES INFANTILES', nombreEn: '', orden: 2, subcategorias: [] },
    { id: 'adulto', nombre: 'DISFRACES ADULTO', nombreEn: '', orden: 3, subcategorias: [] },
    {
      id: 'animatronicos',
      nombre: 'ANIMATRÓNICOS',
      nombreEn: '',
      orden: 4,
      subcategorias: [
        { nombre: SUB_COLGANTES, orden: 1 },
        { nombre: SUB_APOYAR, orden: 2 },
      ],
    },
    { id: 'inflables', nombre: 'INFLABLES GIGANTES', nombreEn: '', orden: 5, subcategorias: [] },
    { id: 'accesorios', nombre: 'ACCESORIOS', nombreEn: '', orden: 6, subcategorias: [] },
    { id: 'trick-or-treat', nombre: 'TRICK OR TREAT', nombreEn: '', orden: 7, subcategorias: [] },
    { id: 'decoracion', nombre: 'DECORACIÓN', nombreEn: '', orden: 8, subcategorias: [] },
  ],
  items: [
    ...COMBOS,
    ...INFANTILES,
    ...ADULTO,
    ...ANIMATRONICOS,
    ...INFLABLES,
    ...ACCESORIOS,
    ...TRICK_OR_TREAT,
    ...DECORACION,
  ],
  config: {
    // El orden importa: la plantilla pinta la primera con la letra
    // manuscrita del diseño y las siguientes como letra chica del pie.
    notas: [
      'Armá el pedido y mandalo por WhatsApp: te confirmamos stock, envío y forma de pago.',
      `Precios con tarjeta. Pagando en efectivo o transferencia, ${DESCUENTO_EFECTIVO * 100}% de descuento.`,
      'Envío gratis a Villanueva y Nordelta, a coordinar. Precios en pesos, sujetos a stock.',
    ],
    cubiertoPorPersona: 0,
  },
};

/** La página del mayorista de cada producto, por id. Sirve para UNA cosa:
 *  bajar la foto (`scripts/fotos-halloween.ts`). No se inserta en la base ni
 *  se muestra en la carta — la carta la ve el comprador final y estos links
 *  son del proveedor. */
export const FUENTES: Record<string, string> = {
  // Los de la planilla se cargan al armar sus categorías; los animatrónicos
  // y los inflables, abajo, desde su JSON. Los combos no salen del mayorista:
  // sus fotos se suben a mano (`scripts/foto-propia.ts`).
  ...SLUGS_PLANILLA,
};

/** Los 158 del mayorista se agregan solos: su id ES su slug. */
for (const p of MERAKYS as ProductoMayorista[]) FUENTES[idDeSlug(p.slug)] = p.slug;

export const URL_PRODUCTO = (slug: string) =>
  `https://mayoristas.merakys.com.ar/producto/${slug}/`;
