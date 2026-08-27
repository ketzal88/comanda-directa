import type { Item } from './tipos';

/** El nombre trae a veces el paréntesis de unidades tal como está en el
 *  impreso ("Empanadas (4 u.)"), y por separado `item.piezas` arma la línea
 *  "4 piezas" debajo — mostraría la cantidad dos veces en la misma fila. */
const PARENTESIS_UNIDADES = /\s*\(\s*(\d+)\s*u\.?\)?\s*$/i;

/** El nombre como se muestra en la carta: sin el paréntesis de unidades
 *  cuando coincide con `item.piezas`. Si no coincide, se deja tal cual. */
export function nombreVisible(item: Item): string {
  if (item.piezas == null) return item.nombre;
  const m = item.nombre.match(PARENTESIS_UNIDADES);
  if (!m || Number(m[1]) !== item.piezas) return item.nombre;
  return item.nombre.slice(0, m.index).trim();
}
