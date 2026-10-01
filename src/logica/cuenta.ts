import type { Descuento, Modalidad } from './tipos';

/** El cálculo de plata del pedido, en un solo lugar. Lo usa la carta y el
 *  panel: que viva acá es lo que evita que una pantalla le muestre un total
 *  al comensal y otra calcule uno distinto. */

export type LineaDeCuenta = {
  /** `null` es "a confirmar" (el plato no tiene precio en carta), y NO es lo
   *  mismo que un cero por bonificación. */
  importe: number | null;
  bonificada: boolean;
  /** Precio por unidad y cantidad. Con los dos, el descuento por medio de
   *  pago en % se calcula por unidad (ver `precioConDescuentoPago`); sin
   *  ellos (el panel, la extensión), sobre el subtotal. */
  precioUnitario?: number;
  cantidad?: number;
};

export type Cuenta = {
  subtotal: number;
  descuentoRetiro: number;
  descuentoManual: number;
  /** Por la forma de pago elegida ("10% en efectivo"). */
  descuentoPago: number;
  envio: number;
  total: number;
  /** Hay al menos una línea sin precio y sin bonificar: el total está incompleto. */
  hayLineasSinPrecio: boolean;
};

export type ArgsCuenta = {
  lineas: LineaDeCuenta[];
  /** `null` es "todavía no eligió". Tiene que ser un caso válido: con el
   *  descuento por retiro aplicado de arrastre, al elegir salón o delivery
   *  el total le subiría al comensal. */
  modalidad: Modalidad | null;
  descuentoRetiro: Descuento;
  descuentoManual: Descuento;
  /** El descuento del medio de pago que eligió el comensal. Opcional: el
   *  panel y la extensión no lo conocen todavía. */
  descuentoPago?: Descuento;
  /** Entero en pesos. Cero cuando no es delivery o no se cargó zona. */
  envio: number;
};

function importeUsable(valor: number | null | undefined): number {
  if (valor == null || !Number.isFinite(valor)) return 0;
  return Math.max(0, Math.floor(valor));
}

/** Cuánto descuenta un `Descuento` sobre una base. Redondea para abajo: con
 *  un porcentaje que da decimales, descontar de más sería cobrarle de menos
 *  al restaurante sin que nadie lo haya decidido. */
function montoDelDescuento(descuento: Descuento, base: number): number {
  if (descuento.tipo === 'ninguno') return 0;
  if (!Number.isFinite(descuento.valor)) return 0;
  if (descuento.tipo === 'monto') return Math.max(0, Math.floor(descuento.valor));
  const porcentaje = Math.min(100, Math.max(0, descuento.valor));
  return Math.floor((base * porcentaje) / 100);
}

/** El precio de UNA unidad pagando con un medio que descuenta un %: el de
 *  lista menos el %, redondeado a los $100 de abajo.
 *
 *  Es el mismo número que la tarjeta del producto muestra como "en efectivo"
 *  y, en Piedro, el de la columna "efectivo" de la planilla del cliente (que
 *  arma el de tarjeta como efectivo / 0,9 redondeado a los $100 de arriba:
 *  la vuelta da exacta, lo verifica `pruebas/catalogo-halloween.test.ts`).
 *  Redondear por unidad y no el total es lo que hace que el total del pedido
 *  sea la suma de los precios que el comprador vio. Con un descuento en
 *  monto fijo (no por unidad) devuelve el precio sin tocar. */
export function precioConDescuentoPago(precio: number, descuento: Descuento): number {
  if (descuento.tipo !== 'porcentaje' || !Number.isFinite(descuento.valor)) return precio;
  const porcentaje = Math.min(100, Math.max(0, descuento.valor));
  return Math.floor((precio * (100 - porcentaje)) / 10000) * 100;
}

function descuentoPagoPorUnidad(lineas: LineaDeCuenta[], descuento: Descuento): number | null {
  if (descuento.tipo !== 'porcentaje') return null;
  let monto = 0;
  for (const l of lineas) {
    if (l.bonificada || l.importe == null) continue;
    if (l.precioUnitario == null || l.cantidad == null) return null;
    const unidad = importeUsable(l.precioUnitario);
    monto += (unidad - precioConDescuentoPago(unidad, descuento)) * Math.floor(l.cantidad);
  }
  return monto;
}

export function calcularCuenta({
  lineas,
  modalidad,
  descuentoRetiro,
  descuentoManual,
  descuentoPago = { tipo: 'ninguno' },
  envio,
}: ArgsCuenta): Cuenta {
  const subtotal = lineas.reduce(
    (suma, l) => (l.bonificada ? suma : suma + importeUsable(l.importe)),
    0,
  );

  const hayLineasSinPrecio = lineas.some((l) => l.importe == null && !l.bonificada);

  // los descuentos se calculan sobre el MISMO subtotal, no en cascada
  const montoRetiro = modalidad === 'retiro' ? montoDelDescuento(descuentoRetiro, subtotal) : 0;
  const montoManual = montoDelDescuento(descuentoManual, subtotal);
  // Por unidad cuando se conocen las unidades: cada producto a su precio en
  // efectivo redondeado a los $100 de abajo, el mismo que se vio en la carta.
  // Si no, sobre el subtotal, también a los $100: el que paga en efectivo
  // paga con billetes, y $49.860 es un vuelto que nadie tiene.
  const montoPago =
    descuentoPagoPorUnidad(lineas, descuentoPago) ??
    Math.floor(montoDelDescuento(descuentoPago, subtotal) / 100) * 100;

  const envioEntero = Number.isFinite(envio) ? Math.max(0, Math.floor(envio)) : 0;
  const conDescuento = Math.max(0, subtotal - montoRetiro - montoManual - montoPago);

  return {
    subtotal,
    descuentoRetiro: montoRetiro,
    descuentoManual: montoManual,
    descuentoPago: montoPago,
    envio: envioEntero,
    total: conDescuento + envioEntero,
    hayLineasSinPrecio,
  };
}
