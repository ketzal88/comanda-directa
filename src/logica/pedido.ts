import { formatearPrecio } from './precio';
import { VARIANTE_UNICA, varianteDe } from './variantes';
import type { Cuenta, LineaDeCuenta } from './cuenta';
import type { Item, Modalidad } from './tipos';

/** El pedido del comensal: lo que arma en el teléfono y termina saliendo por
 *  WhatsApp al restaurante. No hay pago ni POS: del otro lado hay una
 *  persona leyendo el mensaje, por eso el mensaje se manda ARMADO y completo.
 *
 *  Todo lo de acá son funciones puras; el estado vive en
 *  `datos/pedido-almacen.ts`. */

/** El cubierto se cobra por persona y SOLO en el salón. Lleva `:` en el id
 *  para que no pueda chocar con un id de la base. */
export const CUBIERTO = 'salon:cubierto';

export function esCubierto(itemId: string): boolean {
  return itemId === CUBIERTO;
}

/** Tope por línea: el pedido viaja en localStorage y una cantidad guardada a
 *  mano no tiene que poder romper la pantalla ni el total. */
export const MAX_CANTIDAD = 40;

export type LineaPedido = {
  /** Se DERIVA del itemId y la variante, nunca se confía en la guardada. */
  clave: string;
  itemId: string;
  nombre: string;
  /** La medida elegida ("5 pz", "10 pz"). Vacía = el plato tiene un solo precio. */
  variante: string;
  /** ENTERO en pesos: el de la variante elegida. */
  precioUnitario: number;
  cantidad: number;
};

export type Pedido = { lineas: LineaPedido[] };

export const PEDIDO_VACIO: Pedido = { lineas: [] };

export function claveLinea(itemId: string, variante: string = VARIANTE_UNICA): string {
  return `${itemId}::${variante || 'unica'}`;
}

/** Cómo se nombra la línea en la hoja del pedido y en el mensaje de WhatsApp. */
export function nombreDeLinea(linea: LineaPedido): string {
  return linea.variante ? `${linea.nombre} · ${linea.variante}` : linea.nombre;
}

/** La línea de un ítem en la medida pedida. Null si esa medida ya no está en
 *  la carta: agregarla con el precio de otra sería cobrar mal. */
export function lineaDeItem(item: Item, variante: string = VARIANTE_UNICA): LineaPedido | null {
  const elegida = varianteDe(item, variante);
  if (!elegida) return null;

  return {
    clave: claveLinea(item.id, elegida.etiqueta),
    itemId: item.id,
    nombre: item.nombre,
    variante: elegida.etiqueta,
    precioUnitario: elegida.precio,
    cantidad: 1,
  };
}

/** El cubierto del salón, con el precio que carga el local. Null si no está
 *  cargado. */
export function lineaDeCubierto(precioPorPersona: number): LineaPedido | null {
  if (!(precioPorPersona > 0)) return null;
  return {
    clave: claveLinea(CUBIERTO),
    itemId: CUBIERTO,
    nombre: 'Cubierto',
    variante: VARIANTE_UNICA,
    precioUnitario: Math.floor(precioPorPersona),
    cantidad: 1,
  };
}

/** Suma una unidad. Si la línea ya estaba, refresca nombre y precio con lo
 *  recién leído de la carta. */
export function agregar(pedido: Pedido, linea: LineaPedido): Pedido {
  const existente = pedido.lineas.find((l) => l.clave === linea.clave);
  if (!existente) return { lineas: [...pedido.lineas, { ...linea, cantidad: 1 }] };

  return {
    lineas: pedido.lineas.map((l) =>
      l.clave === linea.clave ? { ...linea, cantidad: Math.min(l.cantidad + 1, MAX_CANTIDAD) } : l,
    ),
  };
}

/** Cambia la cantidad de una línea. 0 o menos la saca. */
export function cambiarCantidad(pedido: Pedido, clave: string, cantidad: number): Pedido {
  if (cantidad <= 0) return quitar(pedido, clave);
  const tope = Math.min(Math.floor(cantidad), MAX_CANTIDAD);
  return { lineas: pedido.lineas.map((l) => (l.clave === clave ? { ...l, cantidad: tope } : l)) };
}

export function quitar(pedido: Pedido, clave: string): Pedido {
  return { lineas: pedido.lineas.filter((l) => l.clave !== clave) };
}

/** Las líneas que el comensal pidió de verdad (sin el cubierto). */
export function lineasPedidas(pedido: Pedido): LineaPedido[] {
  return pedido.lineas.filter((l) => !esCubierto(l.itemId));
}

/** Saca el cubierto del pedido, al cambiar de salón a retiro o delivery. */
export function sinCubierto(pedido: Pedido): Pedido {
  return { lineas: pedido.lineas.filter((l) => !esCubierto(l.itemId)) };
}

export type TotalPedido = {
  unidades: number;
  total: number;
  lineasSinPrecio: number;
};

export function totalizar(pedido: Pedido): TotalPedido {
  let unidades = 0;
  let total = 0;
  let lineasSinPrecio = 0;

  for (const l of pedido.lineas) {
    if (!esCubierto(l.itemId)) unidades += l.cantidad;
    total += l.precioUnitario * l.cantidad;
    if (l.precioUnitario <= 0) lineasSinPrecio++;
  }

  return { unidades, total, lineasSinPrecio };
}

/** El pedido traducido a lo que `cuenta.ts` sabe leer. Un plato sin precio en
 *  carta es "a confirmar" (`null`) y NO cero. */
export function lineasDeCuenta(pedido: Pedido): LineaDeCuenta[] {
  return pedido.lineas.map((l) => ({
    importe: l.precioUnitario > 0 ? l.precioUnitario * l.cantidad : null,
    bonificada: false,
  }));
}

export type Aviso = {
  tipo: 'agotado' | 'sin-cubierto' | 'sin-precio';
  texto: string;
};

/** Lo que el comensal tiene que saber antes de creerle al total. */
export function revisarPedido(
  pedido: Pedido,
  itemsVigentes: Item[],
  {
    cubiertoPorPersona = 0,
    modalidad,
  }: { cubiertoPorPersona?: number; modalidad?: Modalidad } = {},
): Aviso[] {
  const avisos: Aviso[] = [];
  const porId = new Map(itemsVigentes.map((i) => [i.id, i]));

  const caidos = [
    ...new Set(
      pedido.lineas
        .map((l) => porId.get(l.itemId))
        .filter((i): i is Item => i != null && (i.agotado || !i.activo))
        .map((i) => i.nombre),
    ),
  ];

  if (caidos.length) {
    avisos.push({
      tipo: 'agotado',
      texto:
        caidos.length === 1
          ? `${caidos[0]} se quedó sin stock.`
          : `Se quedaron sin stock: ${caidos.join(', ')}.`,
    });
  }

  const cubiertosCargados = pedido.lineas.some((l) => esCubierto(l.itemId));
  if (modalidad === 'salon' && cubiertoPorPersona > 0 && !cubiertosCargados) {
    avisos.push({
      tipo: 'sin-cubierto',
      texto: `El cubierto es ${formatearPrecio(cubiertoPorPersona)} por persona: cargá cuántos son para incluirlo.`,
    });
  }

  if (totalizar(pedido).lineasSinPrecio > 0) {
    avisos.push({
      tipo: 'sin-precio',
      texto: 'Hay algo sin precio en carta: el total no lo incluye. Consultalo antes de enviar.',
    });
  }

  return avisos;
}

/** Convierte lo que había guardado en el navegador en un pedido confiable.
 *  Nada se cree — ni la clave, que se recalcula. */
export function sanearPedido(crudo: unknown): Pedido {
  if (!crudo || typeof crudo !== 'object') return PEDIDO_VACIO;
  const lineasCrudas = (crudo as { lineas?: unknown }).lineas;
  if (!Array.isArray(lineasCrudas)) return PEDIDO_VACIO;

  const porClave = new Map<string, LineaPedido>();

  for (const cruda of lineasCrudas) {
    if (!cruda || typeof cruda !== 'object') continue;
    const l = cruda as Record<string, unknown>;

    const itemId = typeof l.itemId === 'string' ? l.itemId.trim() : '';
    const nombre = typeof l.nombre === 'string' ? l.nombre.trim() : '';
    if (!itemId || !nombre) continue;

    const variante = typeof l.variante === 'string' ? l.variante.trim() : VARIANTE_UNICA;
    const clave = claveLinea(itemId, variante);

    const precioCrudo = typeof l.precioUnitario === 'number' ? l.precioUnitario : 0;
    const precioUnitario = Number.isFinite(precioCrudo) ? Math.max(0, Math.floor(precioCrudo)) : 0;

    const cantidadCruda = typeof l.cantidad === 'number' ? l.cantidad : 0;
    const cantidad = Number.isFinite(cantidadCruda)
      ? Math.min(Math.max(1, Math.floor(cantidadCruda)), MAX_CANTIDAD)
      : 1;

    const previa = porClave.get(clave);
    porClave.set(clave, {
      clave,
      itemId,
      nombre,
      variante,
      precioUnitario,
      cantidad: previa ? Math.min(previa.cantidad + cantidad, MAX_CANTIDAD) : cantidad,
    });
  }

  return { lineas: [...porClave.values()] };
}

/** El pedido en texto plano, sin los datos del comensal: para el botón de
 *  copiar. El mensaje completo que sale por WhatsApp lo arma `whatsapp.ts`.
 *  Recibe la `Cuenta` ya calculada (no suma por su cuenta) para que el botón
 *  de copiar y el mensaje de WhatsApp no puedan mostrar totales distintos. */
export function resumenTexto(pedido: Pedido, cuenta: Cuenta, nombreLocal: string): string {
  if (!pedido.lineas.length) return '';

  const filas = pedido.lineas.map((l) => {
    const cola =
      l.precioUnitario > 0 ? formatearPrecio(l.precioUnitario * l.cantidad) : 'consultar precio';
    return `${l.cantidad} × ${nombreDeLinea(l)} — ${cola}`;
  });

  const cierre =
    cuenta.total > 0 ? `Total: ${formatearPrecio(cuenta.total)}` : 'Total: a confirmar.';

  return [`PEDIDO — ${nombreLocal}`, '', ...filas, '', cierre].join('\n');
}
