import { formatearPrecio } from '../../src/logica/precio';
import { ETIQUETA_MEDIO } from '../../src/logica/whatsapp';
import type { Cuenta } from '../../src/logica/cuenta';
import type { Descuento, MedioDePago } from '../../src/logica/tipos';
import type { PedidoParseado } from './parser';

/** Un renglón, con lo que el local decidió cobrarle.
 *
 *  `texto` viene SIN la cola de plata (eso lo hizo el parser) y el importe va
 *  aparte: es lo que permite imprimir un renglón bonificado en $0 sin que el
 *  papel muestre dos precios contradictorios en la misma línea. */
export type LineaDeCobro = {
  texto: string;
  importe: number | null;
  bonificada: boolean;
};

/** Todo lo que hace falta para imprimir la comanda de un pedido ya cobrado.
 *
 *  La `Cuenta` viene calculada por `cuenta.ts` — el ticket no suma nada por su
 *  cuenta, ni siquiera el subtotal. */
export type Cobro = {
  cuenta: Cuenta;
  /** Una por cada ítem del pedido, en el mismo orden. */
  lineas: LineaDeCobro[];
  medioDePago: MedioDePago | null;
  envio: { zona: string; precio: number } | null;
  descuentoManual: Descuento;
  /** El de retiro viaja como `Descuento`, NO como el entero ya resuelto. Sin
   *  esto la ruta de confirmación no puede recalcular la cuenta y el historial
   *  guardaría un total más alto que el que se imprimió y se cobró. */
  descuentoRetiro: Descuento;
  /** Posiciones bonificadas, para que el guardado pueda mandar lo mismo que se
   *  imprimió. */
  bonificadas: number[];
};

const ESTILO_80MM = `
  @page { size: 80mm auto; margin: 0; }
  .ticket {
    width: 80mm;
    box-sizing: border-box;
    padding: 4mm;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #000;
  }
  .ticket h1 { font-size: 15px; margin: 0 0 4mm; text-align: center; }
  .ticket p { margin: 0 0 2mm; white-space: pre-wrap; }
  .ticket .total { font-weight: bold; margin-top: 3mm; }
  .ticket hr { border: none; border-top: 1px dashed #000; margin: 3mm 0; }
`;

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parrafo(texto: string, clase = ''): string {
  const atributo = clase ? ` class="${clase}"` : '';
  return `<p${atributo}>${escaparHtml(texto)}</p>`;
}

/** El renglón completo, con el importe que corresponde cobrar.
 *
 *  Un renglón bonificado sale en $0 a propósito: es un cero que el local
 *  decidió, y el papel tiene que explicar por qué el total no cierra con la
 *  suma de los platos. */
function renglonDeLinea(linea: LineaDeCobro): string {
  const cola = linea.bonificada
    ? `${formatearPrecio(0)} (bonificado)`
    : linea.importe === null
      ? 'a confirmar'
      : formatearPrecio(linea.importe);
  return `${linea.texto} — ${cola}`;
}

/** Subtotal, descuentos y envío. Cada renglón aparece solo si mueve el total:
 *  una comanda sin descuentos ni envío no gana tres líneas que digan el mismo
 *  número tres veces. */
function renglonesDelDesglose(cobro: Cobro): string[] {
  const { cuenta } = cobro;
  const filas: string[] = [];

  if (cuenta.descuentoRetiro > 0) {
    filas.push(`Descuento por retiro −${formatearPrecio(cuenta.descuentoRetiro)}`);
  }
  if (cuenta.descuentoManual > 0) {
    filas.push(`Descuento −${formatearPrecio(cuenta.descuentoManual)}`);
  }
  if (cobro.envio) {
    // el bloque del envío llega igual con la zona en cero, así que acá también:
    // "sin cargo" en palabras, nunca "$0"
    const monto = cuenta.envio > 0 ? formatearPrecio(cuenta.envio) : 'sin cargo';
    filas.push(`Envío (${cobro.envio.zona}) ${monto}`);
  }

  if (filas.length) filas.unshift(`Subtotal ${formatearPrecio(cuenta.subtotal)}`);
  return filas;
}

/** El total, con el mismo criterio que el mensaje de WhatsApp.
 *
 *  Con líneas sin precio dice "a confirmar", y el parcial al lado SOLO si hay
 *  algo que mostrar: un pedido de un único ítem sin precio diría "(parcial $0)",
 *  y acá tampoco se escribe un cero en plata que en realidad es un dato que
 *  falta.
 *
 *  Un total de cero con todos los precios conocidos es otra cosa: pasa cuando
 *  el local bonifica todos los renglones (o descuenta el 100%), y ahí el cero
 *  es una decisión tomada, no un dato faltante. Dice "sin cargo", igual que una
 *  zona de envío sin cargo, y no "a confirmar": mandar a preguntar un precio ya
 *  resuelto es peor que decirlo con palabras. */
function renglonDelTotal(cuenta: Cuenta, etiqueta: string): string {
  if (cuenta.hayLineasSinPrecio) {
    const parcial = cuenta.subtotal > 0 && cuenta.total > 0;
    return parcial
      ? `${etiqueta}: a confirmar (parcial ${formatearPrecio(cuenta.total)})`
      : `${etiqueta}: a confirmar`;
  }
  return cuenta.total > 0
    ? `${etiqueta}: ${formatearPrecio(cuenta.total)}`
    : `${etiqueta}: sin cargo`;
}

function renglonDelPago(cobro: Cobro): string[] {
  // sin medio de pago no se imprime un "Pago:" colgado, igual que en el mensaje
  return cobro.medioDePago ? [parrafo(`Pago: ${ETIQUETA_MEDIO[cobro.medioDePago]}`)] : [];
}

/** El HTML (con su propio `<style>`, listo para imprimirse solo o junto a
 *  otro ticket) de la comanda de cocina. Siempre incluye la línea de
 *  modalidad/mesa tal cual vino en el mensaje — nunca la dirección. */
export function armarTicketCocina(pedido: PedidoParseado, cobro: Cobro): string {
  const desglose = renglonesDelDesglose(cobro);
  const filas = [
    parrafo(pedido.lineaContacto),
    parrafo(pedido.nombre),
    '<hr>',
    ...cobro.lineas.map((linea) => parrafo(renglonDeLinea(linea))),
    ...(desglose.length ? ['<hr>', ...desglose.map((fila) => parrafo(fila))] : []),
    parrafo(renglonDelTotal(cobro.cuenta, 'Total'), 'total'),
    ...renglonDelPago(cobro),
  ];
  if (pedido.aclaraciones) {
    filas.push(parrafo(`Aclaraciones: ${pedido.aclaraciones}`));
  }

  return `<style>${ESTILO_80MM}</style><section class="ticket"><h1>COCINA</h1>${filas.join('')}</section>`;
}

/** El HTML del ticket para el cadete: nombre, dirección, modalidad, zona, cómo
 *  paga y total a cobrar. Sin el detalle de items. Se llama solo cuando
 *  `pedido.modalidad === 'delivery'`. */
export function armarTicketDelivery(pedido: PedidoParseado, cobro: Cobro): string {
  const filas = [
    parrafo(pedido.nombre),
    parrafo(pedido.direccion ?? ''),
    '<hr>',
    parrafo(pedido.lineaContacto),
    // la zona va aunque no tenga cargo: es lo que le dice al cadete a dónde va
    ...(cobro.envio ? [parrafo(`Zona: ${cobro.envio.zona}`)] : []),
    ...renglonDelPago(cobro),
    parrafo(renglonDelTotal(cobro.cuenta, 'Total a cobrar'), 'total'),
  ];

  return `<style>${ESTILO_80MM}</style><section class="ticket"><h1>DELIVERY</h1>${filas.join('')}</section>`;
}
