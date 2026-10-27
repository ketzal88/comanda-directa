import { parsearPrecio } from './precio';
import { leerCsv } from './vitrina-planilla';

/** Catálogo de pedidos directos: productos de una unidad que se encargan
 *  sueltos (los animatrónicos e inflables de Party Market). A diferencia de
 *  las vitrinas de disfraces, acá cada producto es una pieza única, con su
 *  precio en efectivo, su precio con tarjeta y su plan de cuotas, y el pedido
 *  es de a uno. Precio y stock salen en vivo de la hoja "Catálogo" de la
 *  planilla; el nombre lindo, la categoría, la descripción y la foto los pone
 *  el manifiesto (la hoja no tiene esas columnas).
 *
 *  Todo lo de acá es puro y se prueba sin red ni navegador. La hoja trae
 *  columnas del proveedor (su precio mayorista, el link a su página, el costo
 *  y la ganancia): NINGUNA sale de este módulo. Sólo viajan el nombre, la
 *  categoría, la descripción, los dos precios, la cuota y la foto. */

/** Lo que el manifiesto aporta de cada producto: lo editorial, que no está en
 *  la planilla. Se casa con una fila de la hoja por el nombre (`hoja`). */
export type EntradaManifiesto = {
  /** El "Producto" EXACTO como figura en la hoja, para casar la fila. Se
   *  compara normalizado, así que un espacio de más en la planilla no rompe. */
  hoja: string;
  /** Slug para la URL de la foto y como clave estable en el navegador. */
  slug: string;
  /** Nombre que ve el cliente (puede diferir del de la hoja). */
  nombre: string;
  categoria: string;
  descripcion: string;
  /** Ruta de la foto en `/public`, si ya la hay. Sin esto, placeholder. */
  foto?: string;
  /** Ruta del video en `/public`, si lo hay. Se reproduce en la misma página. */
  video?: string;
};

/** Un producto listo para mostrar: lo editorial del manifiesto más el precio
 *  y la cuota tomados de la hoja. El stock no viaja (sólo se muestran los que
 *  tienen al menos uno). */
export type ProductoDirecto = {
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  /** Precio efectivo o transferencia (columna E de la hoja). */
  efectivo: number;
  /** Total con tarjeta (columna F de la hoja). */
  tarjeta: number;
  /** Valor de cada una de las 3 cuotas sin interés: `tarjeta / 3` al peso de
   *  arriba. */
  cuota: number;
  foto?: string;
  video?: string;
};

/** Precio y stock de una fila de la hoja. */
export type FilaCatalogo = { efectivo: number; tarjeta: number; disponible: number };

const CUOTAS = 3;

/** Cada una de las `n` cuotas sin interés de un total, al peso de arriba:
 *  `ceil(total / n)`. Con `n <= 0` no hay cuotas (devuelve 0) para no dividir
 *  por cero. */
export function cuotaSinInteres(total: number, n: number = CUOTAS): number {
  if (n <= 0) return 0;
  return Math.ceil(total / n);
}

/** Minúsculas, sin tildes y con los espacios colapsados: casa el nombre del
 *  manifiesto con el de la hoja aunque uno traiga un espacio de más o una
 *  tilde distinta. */
export function normalizarNombre(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lee un "Disponible" de la hoja. Vacío, un error de fórmula (`#VALUE!`) o
 *  cualquier cosa que no sea un entero cuenta como 0 (sin stock). */
function parsearDisponible(texto: string): number {
  const limpio = texto.trim().replace(/\./g, '');
  if (!/^-?\d+$/.test(limpio)) return 0;
  const n = Number(limpio);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const normEnc = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** La hoja "Catálogo" a un mapa `nombre normalizado → precio y stock`.
 *
 *  La hoja tiene filas de preámbulo arriba (título, descuentos, la aclaración
 *  de cómo se calculan los precios) antes del encabezado real. Por eso el
 *  encabezado se busca por contenido —la fila que tiene "Producto" y
 *  "Disponible"— y no por posición. Las columnas, también por nombre: la hoja
 *  puede sumar o mover columnas sin avisar. */
export function leerHojaCatalogo(csv: string): Map<string, FilaCatalogo> {
  const filas = leerCsv(csv);
  const iEnc = filas.findIndex(
    (f) => f.some((c) => normEnc(c) === 'producto') && f.some((c) => normEnc(c).startsWith('disponible')),
  );
  if (iEnc === -1) return new Map();

  const pos = new Map(filas[iEnc].map((h, i) => [normEnc(h), i]));
  const col = (fila: string[], nombre: string) => {
    const i = pos.get(nombre);
    return i === undefined ? '' : (fila[i] ?? '');
  };

  const mapa = new Map<string, FilaCatalogo>();
  for (const f of filas.slice(iEnc + 1)) {
    const nombre = col(f, 'producto');
    if (!nombre) continue;
    const efectivo = parsearPrecio(col(f, 'precio efectivo / transferencia'));
    const tarjeta = parsearPrecio(col(f, 'precio con tarjeta'));
    if (efectivo == null || tarjeta == null) continue;
    const disponible = parsearDisponible(col(f, 'disponible'));
    // La primera fila de cada nombre gana: si un producto está dos veces, se
    // queda con el de más arriba (y no se pisa un stock>0 con un 0 de abajo).
    const clave = normalizarNombre(nombre);
    if (!mapa.has(clave)) mapa.set(clave, { efectivo, tarjeta, disponible });
  }
  return mapa;
}

/** El catálogo a mostrar: cada entrada del manifiesto casada con su fila de la
 *  hoja, SÓLO las que tienen stock (`disponible > 0`). El orden es el del
 *  manifiesto. Una entrada sin fila en la hoja, o sin stock, no sale: así un
 *  producto vendido (que en la planilla queda en 0) desaparece solo. */
export function armarCatalogoDirecto(
  manifiesto: EntradaManifiesto[],
  hoja: Map<string, FilaCatalogo>,
): ProductoDirecto[] {
  const productos: ProductoDirecto[] = [];
  for (const m of manifiesto) {
    const fila = hoja.get(normalizarNombre(m.hoja));
    if (!fila || fila.disponible <= 0) continue;
    productos.push({
      slug: m.slug,
      nombre: m.nombre,
      categoria: m.categoria,
      descripcion: m.descripcion,
      efectivo: fila.efectivo,
      tarjeta: fila.tarjeta,
      cuota: cuotaSinInteres(fila.tarjeta),
      ...(m.foto ? { foto: m.foto } : {}),
      ...(m.video ? { video: m.video } : {}),
    });
  }
  return productos;
}
