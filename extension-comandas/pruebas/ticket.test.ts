import { describe, expect, it } from 'vitest';
import { calcularCuenta } from '../../src/logica/cuenta';
import { formatearPrecio } from '../../src/logica/precio';
import type { Descuento } from '../../src/logica/tipos';
import { textoSinImporte } from '../src/parser';
import type { PedidoParseado } from '../src/parser';
import { armarTicketCocina, armarTicketDelivery } from '../src/ticket';
import type { Cobro } from '../src/ticket';

const SIN_DESCUENTO: Descuento = { tipo: 'ninguno' };

const pedidoSalon: PedidoParseado = {
  lineaContacto: 'En el salón · Mesa 5',
  modalidad: 'salon',
  mesa: '5',
  nombre: 'Ana',
  direccion: null,
  telefono: null,
  items: [
    { texto: '2 × Roll California — $12.400', importe: 12_400 },
    { texto: '1 × Sashimi de salmón — $8.900', importe: 8_900 },
  ],
  total: '$21.300',
  aclaraciones: null,
  medioDePago: null,
  envio: null,
  descuentoRetiro: null,
  codigo: null,
};

const pedidoDelivery: PedidoParseado = {
  lineaContacto: 'Delivery',
  modalidad: 'delivery',
  mesa: null,
  nombre: 'Pedro',
  direccion: 'Av. Siempre Viva 742',
  telefono: '+5491100000000',
  items: [{ texto: '3 × Roll California — $18.600', importe: 18_600 }],
  total: '$18.600',
  aclaraciones: 'Sin wasabi',
  medioDePago: 'efectivo',
  envio: { zona: 'Zona 2', precio: 3_000 },
  descuentoRetiro: null,
  codigo: null,
};

const pedidoRetiro: PedidoParseado = {
  lineaContacto: 'Retiro por el local',
  modalidad: 'retiro',
  mesa: null,
  nombre: 'Milena',
  direccion: null,
  telefono: null,
  items: [{ texto: '2 × Roll California — $12.400', importe: 12_400 }],
  total: '$11.160',
  aclaraciones: null,
  medioDePago: 'transferencia',
  envio: null,
  descuentoRetiro: 1_240,
  codigo: null,
};

/** Un `Cobro` con la cuenta calculada de verdad por `cuenta.ts`, no con
 *  números escritos a mano: si el ticket y el módulo de plata dejaran de
 *  coincidir, es justo lo que estos tests tienen que ver. */
function cobroDe(
  pedido: PedidoParseado,
  {
    bonificadas = [],
    descuentoManual = SIN_DESCUENTO,
    descuentoRetiro = SIN_DESCUENTO,
    envio = null,
    medioDePago = pedido.medioDePago,
  }: Partial<Omit<Cobro, 'cuenta' | 'lineas'>> = {},
): Cobro {
  const lineas = pedido.items.map((item, indice) => ({
    texto: textoSinImporte(item.texto),
    importe: item.importe,
    bonificada: bonificadas.includes(indice),
  }));
  const cuenta = calcularCuenta({
    lineas: lineas.map(({ importe, bonificada }) => ({ importe, bonificada })),
    modalidad: pedido.modalidad,
    descuentoRetiro,
    descuentoManual,
    envio: envio?.precio ?? 0,
  });
  return { cuenta, lineas, medioDePago, envio, descuentoManual, descuentoRetiro, bonificadas };
}

describe('armarTicketCocina', () => {
  it('incluye modalidad/mesa, nombre, items, total y aclaraciones', () => {
    const html = armarTicketCocina(pedidoDelivery, cobroDe(pedidoDelivery));

    expect(html).toContain('Delivery');
    expect(html).toContain('Pedro');
    expect(html).toContain('3 × Roll California — $18.600');
    expect(html).toContain('$18.600');
    expect(html).toContain('Sin wasabi');
  });

  it('nunca incluye la dirección', () => {
    const html = armarTicketCocina(pedidoDelivery, cobroDe(pedidoDelivery));
    expect(html).not.toContain('Av. Siempre Viva 742');
  });

  it('sin aclaraciones, no muestra esa línea', () => {
    const html = armarTicketCocina(pedidoSalon, cobroDe(pedidoSalon));
    expect(html).not.toContain('Aclaraciones');
  });

  it('escapa HTML en campos de texto libre', () => {
    const pedido: PedidoParseado = { ...pedidoSalon, nombre: '<script>Ana</script>' };
    const html = armarTicketCocina(pedido, cobroDe(pedido));
    expect(html).not.toContain('<script>Ana</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('la comanda muestra el desglose completo', () => {
    const cobro = cobroDe(pedidoDelivery, {
      descuentoManual: { tipo: 'monto', valor: 1_000 },
      envio: { zona: 'Zona 2', precio: 3_000 },
    });
    const html = armarTicketCocina(pedidoDelivery, cobro);

    expect(html).toContain('Subtotal');
    expect(html).toContain('Descuento');
    expect(html).toContain('Envío');
    expect(html).toContain(formatearPrecio(cobro.cuenta.total));
    // 18.600 − 1.000 + 3.000: al envío no se le aplica el descuento
    expect(cobro.cuenta.total).toBe(20_600);
  });

  it('el descuento por retiro tiene su propio renglón, con la zona del envío al lado del suyo', () => {
    const cobro = cobroDe(pedidoRetiro, { descuentoRetiro: { tipo: 'monto', valor: 1_240 } });
    const html = armarTicketCocina(pedidoRetiro, cobro);

    expect(html).toContain('Descuento por retiro');
    expect(html).toContain(formatearPrecio(1_240));
    expect(html).toContain(formatearPrecio(11_160));
  });

  it('sin descuento ni envío no muestra esos renglones', () => {
    const html = armarTicketCocina(pedidoSalon, cobroDe(pedidoSalon));
    expect(html).not.toContain('Descuento');
    expect(html).not.toContain('Envío');
  });

  it('con líneas sin precio el total dice a confirmar, con el parcial al lado', () => {
    const pedido: PedidoParseado = {
      ...pedidoSalon,
      items: [
        { texto: '2 × Roll California — $12.400', importe: 12_400 },
        { texto: '1 × Sake de la casa — a confirmar', importe: null },
      ],
    };
    const cobro = cobroDe(pedido);
    const html = armarTicketCocina(pedido, cobro);

    expect(html).toMatch(/a confirmar/);
    expect(html).toContain(`(parcial ${formatearPrecio(12_400)})`);
  });

  it('un pedido de un solo ítem sin precio no imprime "(parcial $0)"', () => {
    // misma regla que el mensaje: nunca se escribe un cero en plata que en
    // realidad es un dato que falta
    const pedido: PedidoParseado = {
      ...pedidoSalon,
      items: [{ texto: '1 × Sake de la casa — a confirmar', importe: null }],
    };
    const html = armarTicketCocina(pedido, cobroDe(pedido));

    expect(html).toContain('Total: a confirmar');
    expect(html).not.toContain('parcial');
    expect(html).not.toContain('$0');
  });

  it('un renglón bonificado sale en $0 y el total baja', () => {
    const cobro = cobroDe(pedidoSalon, { bonificadas: [1] });
    const html = armarTicketCocina(pedidoSalon, cobro);

    expect(html).toContain('1 × Sashimi de salmón — $0');
    // el otro renglón sigue con su importe, y el total es solo ese
    expect(html).toContain('2 × Roll California — $12.400');
    expect(cobro.cuenta.total).toBe(12_400);
    expect(html).toContain(`Total: ${formatearPrecio(12_400)}`);
  });

  it('con TODOS los renglones bonificados el total es "sin cargo", no "a confirmar"', () => {
    // es un cero exacto y decidido por el local, no un dato que falta: decir
    // "a confirmar" mandaría a preguntar un precio que ya está resuelto
    const cobro = cobroDe(pedidoSalon, { bonificadas: [0, 1] });
    const html = armarTicketCocina(pedidoSalon, cobro);

    expect(cobro.cuenta.total).toBe(0);
    expect(html).toContain('Total: sin cargo');
    expect(html).not.toContain('a confirmar');
  });

  it('muestra el medio de pago cuando el mensaje lo trajo', () => {
    const html = armarTicketCocina(pedidoRetiro, cobroDe(pedidoRetiro));
    expect(html).toContain('Pago:');
    expect(html).toContain('Transferencia');
  });

  it('sin medio de pago no deja un "Pago:" colgado', () => {
    const html = armarTicketCocina(pedidoSalon, cobroDe(pedidoSalon));
    expect(html).not.toContain('Pago:');
  });

  it('el teléfono sale en la comanda cuando el pedido lo trae', () => {
    const html = armarTicketCocina(pedidoDelivery, cobroDe(pedidoDelivery));
    expect(html).toContain('Tel: +5491100000000');
  });

  it('sin teléfono no deja un "Tel:" colgado', () => {
    const html = armarTicketCocina(pedidoSalon, cobroDe(pedidoSalon));
    expect(html).not.toContain('Tel:');
  });

  it('muestra la hora de impresión', () => {
    const html = armarTicketCocina(pedidoSalon, cobroDe(pedidoSalon), new Date(2026, 7, 27, 9, 5));
    expect(html).toContain('Hora: 09:05');
  });
});

describe('armarTicketDelivery', () => {
  it('incluye nombre, dirección, modalidad y total', () => {
    const html = armarTicketDelivery(pedidoDelivery, cobroDe(pedidoDelivery));

    expect(html).toContain('Pedro');
    expect(html).toContain('Av. Siempre Viva 742');
    expect(html).toContain('Delivery');
    expect(html).toContain('$18.600');
  });

  it('incluye el resumen de lo pedido, igual que la comanda de cocina', () => {
    const html = armarTicketDelivery(pedidoDelivery, cobroDe(pedidoDelivery));
    expect(html).toContain('3 × Roll California — $18.600');
  });

  // el motivo por el que el local lo pidió: el cadete toca el timbre y nadie
  // atiende, y hasta ahora el número no estaba en ningún papel
  it('lleva el teléfono, arriba y junto a la dirección', () => {
    const html = armarTicketDelivery(pedidoDelivery, cobroDe(pedidoDelivery));

    expect(html).toContain('Tel: +5491100000000');
    expect(html.indexOf('Tel:')).toBeLessThan(html.indexOf('Total a cobrar'));
  });

  it('el ticket del cadete muestra el total a cobrar con el envío incluido', () => {
    const cobro = cobroDe(pedidoDelivery, { envio: { zona: 'Zona 2', precio: 3_000 } });
    const html = armarTicketDelivery(pedidoDelivery, cobro);

    expect(cobro.cuenta.total).toBe(21_600);
    expect(html).toContain(formatearPrecio(cobro.cuenta.total));
    // la zona: es lo que el cadete necesita para saber a dónde va el viaje
    expect(html).toContain('Zona 2');
    // y cómo paga, para saber si tiene que cobrar
    expect(html).toContain('Efectivo');
  });
});
