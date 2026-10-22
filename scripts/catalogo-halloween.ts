import PARTY from './data/party-market.json';
import type { Carta, ConfigPedido, Item, Tema } from '@/logica/tipos';

/** El catálogo de **Party Market**, armado desde la planilla del cliente
 *  (hoja "Catálogo"), volcada a `scripts/data/party-market.json` por
 *  `scripts/traer-planilla.ts`.
 *
 *  Una regla y sólo una: entra lo que tiene stock. El JSON ya trae filtrado
 *  lo que en la planilla tiene Disponible > 0 y precio cargado; acá no se
 *  vuelve a decidir qué va. Para refrescar la lista se corre el regenerador y
 *  se vuelve a sembrar; para ocultar un producto que se agotó sin rehacer
 *  todo, está el sync de stock (`/api/sync-stock`).
 *
 *  Nada del proveedor sale publicado: el JSON no tiene código, ni precio
 *  mayorista, ni costo. El `slug` que sí guarda es sólo la llave para ir a
 *  buscar la foto a la store API, no se muestra.
 *
 *  Dos precios, un solo número guardado: la carta muestra el de TARJETA
 *  (`precio`) y el motor calcula el de efectivo con `DESCUENTO_EFECTIVO`. La
 *  planilla arma su columna de tarjeta como `efectivo / 0,9` redondeado a los
 *  $100 de arriba, así que la vuelta da EXACTA el efectivo de la planilla
 *  (lo verifica `pruebas/catalogo-halloween.test.ts`). */

export const SLUG_HALLOWEEN = 'piedro-shop';
export const NOMBRE_HALLOWEEN = 'Party Market';

/** La carpeta del bucket `fotos` (público) donde sube las imágenes
 *  `scripts/fotos-halloween.ts`. El nombre del archivo es el id del producto
 *  (que es su slug), así que `foto_url` queda `…/fotos/party-market/<slug>.webp`. */
export const CARPETA_FOTOS = 'party-market';

/** La plantilla que elige `[cliente]/page.tsx` por `clientes.plantilla`. */
export const PLANTILLA_HALLOWEEN = 'halloween';

/** Lo que se come la tarjeta y, al revés, el descuento por pagar en efectivo
 *  o transferencia. El precio de LISTA de la carta es el de tarjeta; el de
 *  efectivo es ese menos el 10%, redondeado a los $100 de abajo. Es el mismo
 *  10% que la planilla usó para armar sus dos columnas. */
export const DESCUENTO_EFECTIVO = 0.1;

/** Papel crema, violeta y naranja calabaza: los colores del artboard de la
 *  campaña, para que quien llega desde el flyer de WhatsApp reconozca la
 *  carta como la misma marca. Tema CLARO a propósito: las fotos del proveedor
 *  vienen recortadas sobre blanco y sobre un fondo negro quedaban como
 *  recuadros brillantes. */
export const TEMA_HALLOWEEN: Tema = {
  colorFondo: '#fbf6ee',
  colorTexto: '#2a1b45',
  colorTextoSuave: '#6a5a86',
  colorAcento: '#f28a2e',
};

export const CONFIG_PEDIDO_HALLOWEEN: ConfigPedido = {
  whatsapp: '5491139535981',
  // Sólo delivery: las tres opciones que se le ofrecen al comprador son
  // DESTINOS (ver `zonasEnvio`), no formas de entrega. Con una sola modalidad
  // habilitada el selector ni se muestra.
  modalidades: ['delivery'],
  cabecera: '',
  mediosDePago: ['efectivo', 'transferencia', 'tarjeta'],
  zonasEnvio: [
    { nombre: 'Villanueva', precio: 0 },
    { nombre: 'Nordelta', precio: 0 },
    { nombre: 'A convenir', precio: null },
  ],
  descuentoRetiro: { tipo: 'ninguno' },
  // El efectivo y la transferencia pagan el precio de tarjeta menos 10%, que
  // es la columna "efectivo" de la planilla. La tarjeta paga el de lista.
  descuentosPago: {
    efectivo: { tipo: 'porcentaje', valor: DESCUENTO_EFECTIVO * 100 },
    transferencia: { tipo: 'porcentaje', valor: DESCUENTO_EFECTIVO * 100 },
  },
};

type ProductoPlanilla = {
  grupo: string;
  nombre: string;
  efectivo: number;
  tarjeta: number;
  disponible: number;
  slug: string;
  descripcion?: string;
};

const PRODUCTOS = PARTY.productos as ProductoPlanilla[];

/** Las categorías de la carta, en orden. El `grupo` es como lo escribe la
 *  planilla; el `id`/`nombre`, cómo se publica. Sólo se incluyen las que
 *  tienen al menos un producto con stock. */
const GRUPOS = [
  { grupo: 'Disfraces infantiles', id: 'infantiles', nombre: 'DISFRACES INFANTILES' },
  { grupo: 'Disfraces adulto', id: 'adulto', nombre: 'DISFRACES ADULTO' },
  { grupo: 'Accesorios', id: 'accesorios', nombre: 'ACCESORIOS' },
  { grupo: 'Trick or treat', id: 'trick-or-treat', nombre: 'TRICK OR TREAT' },
  { grupo: 'Decoración', id: 'decoracion', nombre: 'DECORACIÓN' },
] as const;

/** Un producto de la planilla, ya como ítem de la carta. El id ES el slug: ya
 *  es único, ya viene en minúsculas con guiones, y es el nombre con el que
 *  `fotos-halloween.ts` sube la imagen. El precio guardado es el de tarjeta;
 *  no hay variantes (cada talle es su propia fila en la planilla, con su
 *  stock y su foto). */
function itemDe(p: ProductoPlanilla, categoriaId: string, orden: number): Item {
  return {
    id: p.slug,
    numero: 0, // lo recalcula `renumerar()` al leer la carta
    nombre: p.nombre,
    categoriaId,
    orden,
    precio: p.tarjeta,
    variantes: [],
    agotado: false,
    activo: true,
    etiquetas: [],
    ...(p.descripcion ? { descripcion: p.descripcion } : {}),
  };
}

const CATEGORIAS_CON_PRODUCTOS = GRUPOS.map((g) => ({
  ...g,
  productos: PRODUCTOS.filter((p) => p.grupo === g.grupo),
})).filter((g) => g.productos.length > 0);

const ITEMS: Item[] = CATEGORIAS_CON_PRODUCTOS.flatMap((g) =>
  g.productos.map((p, i) => itemDe(p, g.id, i + 1)),
);

export const CATALOGO_HALLOWEEN: Carta = {
  categorias: CATEGORIAS_CON_PRODUCTOS.map((g, i) => ({
    id: g.id,
    nombre: g.nombre,
    nombreEn: '',
    orden: i + 1,
    subcategorias: [],
  })),
  items: ITEMS,
  config: {
    // El orden importa: la plantilla pinta la primera con la letra manuscrita
    // del diseño y las siguientes como letra chica del pie.
    notas: [
      'Armá el pedido y mandalo por WhatsApp: te confirmamos stock, envío y forma de pago.',
      `Precios con tarjeta. Pagando en efectivo o transferencia, ${DESCUENTO_EFECTIVO * 100}% de descuento.`,
      'Envío gratis a Villanueva y Nordelta, a coordinar. Precios en pesos, sujetos a stock.',
    ],
    cubiertoPorPersona: 0,
  },
};

/** id del producto → slug del proveedor, para que `fotos-halloween.ts` sepa a
 *  qué ficha ir. El id YA es el slug, así que es una identidad; se expone como
 *  mapa para no cablear esa suposición en el script de fotos. NO se publica. */
export const FUENTES: Record<string, string> = Object.fromEntries(
  PRODUCTOS.map((p) => [p.slug, p.slug]),
);
