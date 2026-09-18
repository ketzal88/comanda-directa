/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { abrirFormularioDeCobro, armarCobro, seleccionInicial } from '../src/formulario';
import type { PedidoParseado } from '../src/parser';
import type { Cobro } from '../src/ticket';

const pedidoRetiro: PedidoParseado = {
  lineaContacto: 'Retiro por el local',
  modalidad: 'retiro',
  mesa: null,
  nombre: 'Milena',
  direccion: null,
  telefono: null,
  items: [
    { texto: '2 × Roll California — $12.400', importe: 12_400 },
    { texto: '1 × Sake de la casa — a confirmar', importe: null },
  ],
  total: '$11.160',
  aclaraciones: null,
  medioDePago: 'transferencia',
  envio: null,
  descuentoRetiro: 1_240,
  codigo: null,
};

const pedidoDelivery: PedidoParseado = {
  lineaContacto: 'Delivery',
  modalidad: 'delivery',
  mesa: null,
  nombre: 'Pedro',
  direccion: 'Av. Siempre Viva 742',
  telefono: null,
  items: [{ texto: '3 × Roll California — $18.600', importe: 18_600 }],
  total: '$21.600',
  aclaraciones: null,
  medioDePago: 'efectivo',
  envio: { zona: 'Zona 2', precio: 3_000 },
  descuentoRetiro: null,
  codigo: null,
};

afterEach(() => {
  document.body.replaceChildren();
});

describe('seleccionInicial', () => {
  it('viene precargada con lo que trajo el mensaje', () => {
    expect(seleccionInicial(pedidoDelivery)).toEqual({
      medioDePago: 'efectivo',
      envio: { zona: 'Zona 2', precio: 3_000 },
      // el descuento por retiro NO es el manual: ese lo carga el local acá
      descuentoManual: { tipo: 'ninguno' },
      bonificadas: [],
    });
  });
});

describe('armarCobro', () => {
  it('el descuento por retiro del mensaje viaja como Descuento, no como entero resuelto', () => {
    // sin esto la ruta de confirmación no puede recalcular la cuenta, y el
    // historial guardaría un total MÁS ALTO que el que se imprimió y se cobró
    const cobro = armarCobro(pedidoRetiro, seleccionInicial(pedidoRetiro));
    expect(cobro.descuentoRetiro).toEqual({ tipo: 'monto', valor: 1_240 });
    expect(cobro.cuenta.descuentoRetiro).toBe(1_240);
    expect(cobro.cuenta.total).toBe(12_400 - 1_240);
  });

  it('sin descuento en el mensaje, queda en ninguno', () => {
    const cobro = armarCobro(pedidoDelivery, seleccionInicial(pedidoDelivery));
    expect(cobro.descuentoRetiro).toEqual({ tipo: 'ninguno' });
    expect(cobro.cuenta.descuentoRetiro).toBe(0);
  });

  it('las líneas llevan el texto sin la cola de plata y el importe aparte', () => {
    const cobro = armarCobro(pedidoRetiro, seleccionInicial(pedidoRetiro));
    expect(cobro.lineas[0]).toEqual({
      texto: '2 × Roll California',
      importe: 12_400,
      bonificada: false,
    });
    // una línea sin precio sigue sin precio: no se convierte en cero
    expect(cobro.lineas[1].importe).toBeNull();
    expect(cobro.cuenta.hayLineasSinPrecio).toBe(true);
  });

  it('una línea bonificada no cuenta en el total pero conserva su importe original', () => {
    const cobro = armarCobro(pedidoRetiro, {
      ...seleccionInicial(pedidoRetiro),
      bonificadas: [0],
    });
    expect(cobro.lineas[0].bonificada).toBe(true);
    expect(cobro.lineas[0].importe).toBe(12_400);
    expect(cobro.cuenta.total).toBe(0);
    // la línea sin precio sigue sin bonificar: el total sigue siendo incierto
    expect(cobro.cuenta.hayLineasSinPrecio).toBe(true);
  });

  it('el envío entra en la cuenta y no recibe descuento', () => {
    const cobro = armarCobro(pedidoDelivery, {
      ...seleccionInicial(pedidoDelivery),
      descuentoManual: { tipo: 'porcentaje', valor: 50 },
    });
    // 18.600 − 9.300 = 9.300, + 3.000 de envío
    expect(cobro.cuenta.envio).toBe(3_000);
    expect(cobro.cuenta.total).toBe(12_300);
  });

  it('el cálculo no se duplica del lado de la extensión: sale de cuenta.ts', () => {
    // el subtotal es la suma de las líneas con las bonificadas en cero, igual
    // que en la carta y en el mensaje
    const cobro = armarCobro(pedidoDelivery, seleccionInicial(pedidoDelivery));
    expect(cobro.cuenta.subtotal).toBe(18_600);
  });
});

describe('abrirFormularioDeCobro', () => {
  const abrir = (pedido: PedidoParseado) => {
    const cobros: Cobro[] = [];
    abrirFormularioDeCobro(pedido, (cobro) => cobros.push(cobro));
    return cobros;
  };

  const boton = (accion: string): HTMLButtonElement => {
    const encontrado = document.querySelector<HTMLButtonElement>(`[data-cobro="${accion}"]`);
    if (!encontrado) throw new Error(`no hay botón de ${accion} en el formulario`);
    return encontrado;
  };

  it('el click de Imprimir llama al callback SINCRÓNICO', () => {
    // No es un detalle de estilo: el `window.open` de la impresión cuelga de
    // este click. Si el cobro llegara en un callback asincrónico posterior se
    // perdería la activación del usuario y el navegador bloquearía la ventana
    // SIEMPRE.
    const cobros = abrir(pedidoRetiro);
    boton('imprimir').click();
    expect(cobros).toHaveLength(1);
    expect(cobros[0].cuenta.total).toBe(11_160);
  });

  it('cierra el formulario al imprimir y al cancelar, y cancelar no imprime nada', () => {
    const cobros = abrir(pedidoRetiro);
    boton('cancelar').click();
    expect(cobros).toHaveLength(0);
    expect(document.querySelector('[data-cobro="imprimir"]')).toBeNull();

    const otros = abrir(pedidoRetiro);
    boton('imprimir').click();
    expect(otros).toHaveLength(1);
    expect(document.querySelector('[data-cobro="imprimir"]')).toBeNull();
  });

  it('viene precargado con el medio de pago y el envío del mensaje', () => {
    abrir(pedidoDelivery);
    expect(document.querySelector<HTMLInputElement>('[data-cobro="envio-zona"]')?.value).toBe(
      'Zona 2',
    );
    expect(document.querySelector<HTMLInputElement>('[data-cobro="envio-precio"]')?.value).toBe(
      '3000',
    );
    expect(
      document.querySelector<HTMLInputElement>('[data-cobro="pago"][value="efectivo"]')?.checked,
    ).toBe(true);
  });

  it('tildar un renglón lo bonifica en el cobro que sale a imprimir', () => {
    const cobros = abrir(pedidoRetiro);
    const tilde = document.querySelectorAll<HTMLInputElement>('[data-cobro="bonificar"]')[0];
    tilde.checked = true;
    tilde.dispatchEvent(new Event('change', { bubbles: true }));
    boton('imprimir').click();

    expect(cobros[0].bonificadas).toEqual([0]);
    expect(cobros[0].lineas[0].bonificada).toBe(true);
    expect(cobros[0].cuenta.total).toBe(0);
  });

  it('el descuento que carga el local a mano entra en la cuenta', () => {
    const cobros = abrir(pedidoDelivery);
    const tipo = document.querySelector<HTMLSelectElement>('[data-cobro="descuento-tipo"]');
    const valor = document.querySelector<HTMLInputElement>('[data-cobro="descuento-valor"]');
    if (!tipo || !valor) throw new Error('faltan los controles de descuento');
    tipo.value = 'porcentaje';
    tipo.dispatchEvent(new Event('change', { bubbles: true }));
    valor.value = '50';
    valor.dispatchEvent(new Event('input', { bubbles: true }));
    boton('imprimir').click();

    expect(cobros[0].descuentoManual).toEqual({ tipo: 'porcentaje', valor: 50 });
    expect(cobros[0].cuenta.total).toBe(12_300);
  });

  it('no se abren dos formularios a la vez', () => {
    abrir(pedidoRetiro);
    abrir(pedidoDelivery);
    expect(document.querySelectorAll('[data-cobro="imprimir"]')).toHaveLength(1);
  });
});
