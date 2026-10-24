/** Cómo se arman los precios de Party Market, en un solo lugar (antes vivían
 *  en fórmulas del Excel). Todo ENTERO en pesos.
 *
 *  Cadena: costo mayorista → (+ margen %) efectivo → (/ 0,9) tarjeta →
 *  (+ recargo cuotas %) cuotas. Es la misma regla que usaba la planilla:
 *  el efectivo redondea a la centena más cercana y la tarjeta a la de arriba,
 *  así el 10% en efectivo de la web da EXACTO el efectivo (ver
 *  `pruebas/catalogo-halloween.test.ts`). */

/** costo + margen% → efectivo, redondeado a los $100 más cercanos. */
export function efectivoDeCosto(costo: number, margen: number): number {
  if (!(costo > 0)) return 0;
  return Math.round((costo * (1 + margen / 100)) / 100) * 100;
}

/** efectivo → precio de tarjeta (lista), redondeado a los $100 de arriba.
 *  Es el inverso del 10% que descuenta la web al pagar en efectivo. */
export function tarjetaDeEfectivo(efectivo: number): number {
  if (!(efectivo > 0)) return 0;
  return Math.ceil(efectivo / 0.9 / 100) * 100;
}

/** precio de lista (tarjeta) → efectivo, el mismo número que muestra la carta
 *  al elegir efectivo o transferencia (10% off, a los $100 de abajo). */
export function efectivoDeTarjeta(tarjeta: number): number {
  if (!(tarjeta > 0)) return 0;
  return Math.floor((tarjeta * 90) / 10000) * 100;
}

/** tarjeta → precio en cuotas, con el recargo del cliente, a los $100 de
 *  arriba. Con recargo 0, es el mismo precio de tarjeta. */
export function cuotasDeTarjeta(tarjeta: number, recargo: number): number {
  if (!(tarjeta > 0)) return 0;
  return Math.ceil((tarjeta * (1 + recargo / 100)) / 100) * 100;
}

export const TIPOS_STOCK = ['propio', 'consignacion', 'a_pedido'] as const;
export type TipoStock = (typeof TIPOS_STOCK)[number];

export const ETIQUETA_TIPO_STOCK: Record<TipoStock, string> = {
  propio: 'Propio',
  consignacion: 'Consignación',
  a_pedido: 'A pedido',
};

export function esTipoStock(v: unknown): v is TipoStock {
  return typeof v === 'string' && (TIPOS_STOCK as readonly string[]).includes(v);
}

/** 'a_pedido' se vende sin descontar stock (se trae del mayorista). Los otros
 *  dos descuentan de lo que hay. */
export function descuentaStock(tipo: TipoStock): boolean {
  return tipo !== 'a_pedido';
}
