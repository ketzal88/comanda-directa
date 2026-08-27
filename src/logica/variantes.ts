import { ETIQUETAS, type Etiqueta, type Item, type Variante } from './tipos';

/** Los tamaños de un plato, resueltos. Todo el resto de la app pregunta por
 *  acá y nunca lee `item.precio` ni `item.variantes` directamente: un único
 *  lugar que resuelva "¿cuánto vale esto?" evita el bug de cobrar el precio
 *  de una medida por otra. */

/** La variante implícita de un plato con un solo precio. */
export const VARIANTE_UNICA = '';

/** Las variantes reales del ítem, o la implícita si no tiene. Siempre
 *  devuelve al menos una. */
export function variantesDe(item: Item): Variante[] {
  const cargadas = item.variantes.filter((v) => v.etiqueta.trim() !== '');
  if (cargadas.length) return cargadas;
  return [{ etiqueta: VARIANTE_UNICA, precio: item.precio }];
}

export function tieneVariantes(item: Item): boolean {
  return item.variantes.some((v) => v.etiqueta.trim() !== '');
}

/** La variante que corresponde a una etiqueta guardada. Null si esa etiqueta
 *  ya no existe en la carta (el panel la renombró mientras alguien tenía el
 *  pedido abierto): el precio de una medida que ya no se vende no se puede
 *  adivinar. */
export function varianteDe(item: Item, etiqueta: string): Variante | null {
  return variantesDe(item).find((v) => v.etiqueta === etiqueta) ?? null;
}

/** El precio con el que se muestra el plato cuando NO se listan las
 *  variantes una por una: el más barato de los cargados. */
export function precioDesde(item: Item): number {
  const conPrecio = variantesDe(item)
    .map((v) => v.precio)
    .filter((p) => p > 0);
  return conPrecio.length ? Math.min(...conPrecio) : 0;
}

/** ¿Los ítems de este bloque comparten exactamente las mismas medidas y los
 *  mismos precios? Si sí, el precio va una vez en el título del bloque en
 *  vez de repetirse en cada fila. Null si no aplica. */
export function preciosComunes(items: Item[]): Variante[] | null {
  if (items.length < 2) return null;
  if (!items.every(tieneVariantes)) return null;

  const huella = (i: Item) =>
    variantesDe(i)
      .map((v) => `${v.etiqueta}=${v.precio}`)
      .join('|');

  const primera = huella(items[0]);
  if (!items.every((i) => huella(i) === primera)) return null;

  const variantes = variantesDe(items[0]);
  if (!variantes.some((v) => v.precio > 0)) return null;

  return variantes;
}

/** Deja las variantes que llegan de una fuente que no controlamos (la base,
 *  una planilla, el panel) en la forma que espera el dominio. Descarta las
 *  que no tienen etiqueta y fusiona las repetidas quedándose con la primera. */
export function sanearVariantes(crudo: unknown): Variante[] {
  if (!Array.isArray(crudo)) return [];
  const porEtiqueta = new Map<string, Variante>();

  for (const bruto of crudo) {
    if (!bruto || typeof bruto !== 'object') continue;
    const v = bruto as Record<string, unknown>;

    const etiqueta = typeof v.etiqueta === 'string' ? v.etiqueta.trim() : '';
    if (!etiqueta) continue;
    if (porEtiqueta.has(etiqueta)) continue;

    const crudoPrecio = typeof v.precio === 'number' ? v.precio : 0;
    const precio = Number.isFinite(crudoPrecio) ? Math.max(0, Math.floor(crudoPrecio)) : 0;

    porEtiqueta.set(etiqueta, { etiqueta, precio });
  }

  return [...porEtiqueta.values()];
}

export function etiquetasValidas(crudo: unknown): crudo is Etiqueta[] {
  return Array.isArray(crudo) && crudo.every((e) => (ETIQUETAS as readonly string[]).includes(e));
}
