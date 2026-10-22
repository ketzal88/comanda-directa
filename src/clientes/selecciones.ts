/** Selecciones: catálogos chicos, armados para UN comprador, que se le pasan
 *  por link (`/<cliente>/p/<codigo>`). El comprador ve sólo esos productos,
 *  con sus cantidades, agrupados en opciones, y elige una para el pedido.
 *
 *  Viven acá y no en la base porque `clientes` no tiene dónde guardarlas, y
 *  la tabla es de todos los clientes. La contra: sumar una selección es un
 *  commit y un deploy. Si se vuelve rutina, va a la base con su pantalla en
 *  el panel.
 *
 *  - El código es al azar (6 letras y números) y NO dice de quién es: el link
 *    se comparte y la selección suele estar armada para una casa puntual.
 *    Nada de direcciones ni nombres de compradores en este archivo.
 *  - Los productos se nombran como en la carta. Precio y foto salen de la
 *    carta, no de acá: si el precio cambia, la selección lo toma solo. La
 *    prueba `pruebas/selecciones.test.ts` verifica que cada nombre exista.
 *  - `acumulativas`: cada opción suma a la anterior (B = A + lo de B). */

export type LineaSeleccion = {
  producto: string;
  cantidad: number;
  /** Dónde va o para qué: se muestra debajo del producto. */
  nota?: string;
};

export type OpcionSeleccion = {
  letra: string;
  nombre: string;
  lineas: LineaSeleccion[];
};

export type Seleccion = {
  titulo: string;
  bajada?: string;
  acumulativas: boolean;
  opciones: OpcionSeleccion[];
};

export const SELECCIONES: Record<string, Record<string, Seleccion>> = {
  // El presupuesto `upopj6` (08/10/2026) se retiró al rehacer el catálogo solo
  // con stock: armaba opciones con animatrónicos y decoración que ya no están
  // en la carta, así que su link mostraba productos inexistentes y un total
  // que no cerraba. Para rearmar presupuestos se parte de la carta actual.
  'party-market': {},
};

/** Las líneas de una opción, ya acumuladas si corresponde. */
export function lineasDeOpcion(seleccion: Seleccion, letra: string): LineaSeleccion[] {
  const i = seleccion.opciones.findIndex((o) => o.letra === letra);
  if (i < 0) return [];
  const hasta = seleccion.acumulativas ? seleccion.opciones.slice(0, i + 1) : [seleccion.opciones[i]];
  return hasta.flatMap((o) => o.lineas);
}
