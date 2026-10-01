import { describe, expect, it } from 'vitest';
import { armarMensaje, enlaceWhatsApp, normalizarNumero, numeroUsable, validarDatos } from '../src/logica/whatsapp';
import { agregar, lineaDeItem, PEDIDO_VACIO, sincronizarPedido } from '../src/logica/pedido';
import type { Item } from '../src/logica/tipos';

const item: Item = {
  id: 'roll',
  numero: 1,
  nombre: 'Roll California',
  categoriaId: 'rolls',
  orden: 1,
  precio: 8900,
  variantes: [],
  agotado: false,
  activo: true,
  etiquetas: [],
};

describe('normalizarNumero', () => {
  it('prefija 549 a un celular argentino de 10 dígitos', () => {
    expect(normalizarNumero('1122223333')).toBe('5491122223333');
  });
  it('respeta un número que ya trae código de país (línea fija)', () => {
    expect(normalizarNumero('541164260758')).toBe('541164260758');
  });
  it('descarta separadores', () => {
    expect(normalizarNumero('11 2222-3333')).toBe('5491122223333');
  });
});

describe('numeroUsable', () => {
  it('un número corto no es usable', () => {
    expect(numeroUsable('123')).toBe(false);
  });
});

describe('validarDatos', () => {
  it('exige nombre y mesa en salón', () => {
    const errores = validarDatos({ nombre: '', modalidad: 'salon' }, ['salon']);
    expect(errores.map((e) => e.campo)).toEqual(expect.arrayContaining(['nombre', 'mesa']));
  });
  it('exige dirección en delivery', () => {
    const errores = validarDatos({ nombre: 'Ana', modalidad: 'delivery' }, ['delivery']);
    expect(errores.map((e) => e.campo)).toContain('direccion');
  });

  // El teléfono se pide, no se exige: un campo obligatorio más entre el pedido
  // armado y el botón de enviar son pedidos que no se mandan.
  it('el teléfono vacío no es un error', () => {
    const errores = validarDatos({ nombre: 'Ana', modalidad: 'retiro' }, ['retiro']);
    expect(errores).toEqual([]);
  });

  it('un teléfono a medias sí: en la comanda parecería que hay por dónde llamar', () => {
    const errores = validarDatos(
      { nombre: 'Ana', modalidad: 'retiro', telefono: '1234' },
      ['retiro'],
    );
    expect(errores.map((e) => e.campo)).toEqual(['telefono']);
  });

  it('un número normal pasa', () => {
    const errores = validarDatos(
      { nombre: 'Ana', modalidad: 'retiro', telefono: '11 0000-0000' },
      ['retiro'],
    );
    expect(errores).toEqual([]);
  });
});

describe('armarMensaje', () => {
  it('incluye el nombre del local recibido por parámetro, no hardcodeado', () => {
    const pedido = agregar(PEDIDO_VACIO, lineaDeItem(item)!);
    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, 'La Esquina');
    expect(mensaje).toContain('*Pedido — La Esquina*');
  });

  it('el teléfono va como bloque propio y antes de los ítems, o el parser lo leería como un plato', () => {
    const pedido = agregar(PEDIDO_VACIO, lineaDeItem(item)!);
    const mensaje = armarMensaje(
      pedido,
      { nombre: 'Ana', modalidad: 'delivery', direccion: 'Falsa 123', telefono: '11 0000-0000' },
      'La Esquina',
    );
    const bloques = mensaje.split('\n\n');
    const iTelefono = bloques.findIndex((b) => b.startsWith('Teléfono: '));
    const iItems = bloques.findIndex((b) => b.includes('Roll California'));

    expect(bloques[iTelefono]).toBe('Teléfono: 11 0000-0000');
    expect(iItems).toBeGreaterThan(-1);
    expect(iTelefono).toBeLessThan(iItems);
  });

  it('sin teléfono cargado no queda un "Teléfono:" colgado', () => {
    const pedido = agregar(PEDIDO_VACIO, lineaDeItem(item)!);
    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, 'La Esquina');
    expect(mensaje).not.toContain('Teléfono');
  });

  it('nunca escribe "$0": sin precios, el total dice "a confirmar"', () => {
    const sinPrecio: Item = { ...item, precio: 0 };
    const pedido = agregar(PEDIDO_VACIO, lineaDeItem(sinPrecio)!);
    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, 'La Esquina');
    expect(mensaje).not.toMatch(/\$0(?!\d)/);
    expect(mensaje).toContain('a confirmar');
  });
});

describe('enlaceWhatsApp', () => {
  it('null sin número usable', () => {
    expect(enlaceWhatsApp('', 'hola')).toBeNull();
  });
  it('arma el link wa.me con el mensaje codificado', () => {
    const link = enlaceWhatsApp('1122223333', 'hola mundo');
    expect(link).toBe('https://wa.me/5491122223333?text=hola%20mundo');
  });
});

describe('zona de envío en el mensaje', () => {
  const pedido = agregar(PEDIDO_VACIO, lineaDeItem(item)!);
  const base = { nombre: 'Ana', modalidad: 'delivery' as const, direccion: 'Av. Siempreviva 742' };

  it('una zona con precio se suma al total y sale con el monto', () => {
    const mensaje = armarMensaje(pedido, { ...base, zona: { nombre: 'Nordelta', precio: 5000 } }, 'Local');
    expect(mensaje).toContain('Envío: Nordelta — $5.000');
    expect(mensaje).toContain('*Total: $13.900*');
  });

  it('una zona en 0 dice "sin cargo" y no cambia el total', () => {
    const mensaje = armarMensaje(pedido, { ...base, zona: { nombre: 'Villanueva', precio: 0 } }, 'Local');
    expect(mensaje).toContain('Envío: Villanueva — sin cargo');
    expect(mensaje).toContain('*Total: $8.900*');
  });

  it('una zona a convenir sale SIN monto y lo aclara en el total', () => {
    // sin número, el local sabe que falta cotizarlo; y el comprador no puede
    // leer el total como final
    const mensaje = armarMensaje(pedido, { ...base, zona: { nombre: 'A convenir', precio: null } }, 'Local');
    expect(mensaje).toContain('Envío: A convenir');
    expect(mensaje).not.toContain('sin cargo');
    expect(mensaje).toContain('*Total: $8.900 + envío a convenir*');
  });

  it('la zona no viaja cuando no es un envío', () => {
    const mensaje = armarMensaje(
      pedido,
      { nombre: 'Ana', modalidad: 'retiro', zona: { nombre: 'Nordelta', precio: 5000 } },
      'Local',
    );
    expect(mensaje).not.toContain('Envío');
    expect(mensaje).toContain('*Total: $8.900*');
  });
});

describe('descuento por medio de pago', () => {
  // $55.400 con tarjeta: 10% son $5.540, redondeado a $5.500 → $49.900
  const disfraz: Item = { ...item, id: 'disfraz', nombre: 'Disfraz', precio: 55400 };
  const pedido = agregar(PEDIDO_VACIO, lineaDeItem(disfraz)!);
  const descuentosPago = {
    efectivo: { tipo: 'porcentaje' as const, valor: 10 },
    transferencia: { tipo: 'porcentaje' as const, valor: 10 },
  };
  const base = {
    nombre: 'Ana',
    modalidad: 'delivery' as const,
    direccion: 'Calle 1',
    zona: { nombre: 'Nordelta', precio: 0 },
  };

  it('en efectivo el total sale con el 10% y el descuento viaja en el mensaje', () => {
    const msj = armarMensaje(pedido, { ...base, medioDePago: 'efectivo' }, 'Piedro Shop', { descuentosPago });
    // $55.400 × 0,9 = $49.860 → $49.800, el precio en efectivo de la carta.
    expect(msj).toContain('Descuento: efectivo 10% — $5.600');
    expect(msj).toContain('*Total: $49.800*');
  });

  it('en efectivo cada unidad va a su precio en efectivo, no el 10% del total', () => {
    // Set Diablita: $14.300 con tarjeta, $12.800 en efectivo en la planilla.
    // Sobre el total daría $25.740 → $25.700; por unidad, 2 × $12.800.
    const dos = {
      lineas: [{ clave: 'd::unica', itemId: 'd', nombre: 'Set Diablita', variante: '', precioUnitario: 14300, cantidad: 2 }],
    };
    const msj = armarMensaje(dos, { ...base, medioDePago: 'efectivo' }, 'Piedro Shop', { descuentosPago });
    expect(msj).toContain('*Total: $25.600*');
    expect(msj).toContain('Descuento: efectivo 10% — $3.000');
  });

  it('con tarjeta sale a precio de lista', () => {
    const msj = armarMensaje(pedido, { ...base, medioDePago: 'tarjeta' }, 'Piedro Shop', { descuentosPago });
    expect(msj).not.toContain('Descuento:');
    expect(msj).toContain('Pago: tarjeta');
    expect(msj).toContain('*Total: $55.400*');
  });

  it('la zona elegida llega en el mensaje', () => {
    const msj = armarMensaje(pedido, { ...base, medioDePago: 'efectivo' }, 'Piedro Shop', { descuentosPago });
    expect(msj).toContain('Envío: Nordelta — sin cargo');
  });

  it('con zonas cargadas, un delivery sin zona no se puede enviar', () => {
    const errores = validarDatos({ ...base, zona: null }, ['delivery'], { hayZonas: true });
    expect(errores.map((e) => e.campo)).toContain('zona');
  });
});

describe('pedido guardado vs. carta nueva', () => {
  const item = (id: string, nombre: string, precio: number, extra: Partial<Item> = {}): Item => ({
    id, numero: 1, nombre, categoriaId: 'c', orden: 1, precio, variantes: [], agotado: false,
    activo: true, etiquetas: [], ...extra,
  });
  const linea = (itemId: string, nombre: string, precio: number, cantidad = 1) => ({
    clave: `${itemId}::unica`, itemId, nombre, variante: '', precioUnitario: precio, cantidad,
  });

  it('saca lo que ya no está y actualiza el precio de lo que cambió', () => {
    const guardado = { lineas: [linea('a', 'Combo Halloween Básico', 12600), linea('b', 'Set Diablita', 14000, 2)] };
    const aldia = sincronizarPedido(guardado, [item('b', 'Set Diablita', 14300)]);
    expect(aldia.lineas).toEqual([linea('b', 'Set Diablita', 14300, 2)]);
  });

  it('reconoce por nombre un producto que el seed recargó con otro id', () => {
    const guardado = { lineas: [linea('viejo', 'Set Diablita', 14300)] };
    const aldia = sincronizarPedido(guardado, [item('nuevo', 'Set Diablita', 14300)]);
    expect(aldia.lineas.map((l) => l.itemId)).toEqual(['nuevo']);
  });

  it('una medida que ya no se vende sale del pedido', () => {
    const guardado = { lineas: [{ ...linea('p', 'Disfraz', 30000), clave: 'p::Talle XL', variante: 'Talle XL' }] };
    const aldia = sincronizarPedido(guardado, [
      item('p', 'Disfraz', 0, { variantes: [{ etiqueta: 'Talle M', precio: 30000 }] }),
    ]);
    expect(aldia.lineas).toEqual([]);
  });

  it('sin cambios devuelve el mismo pedido (no reescribe)', () => {
    const guardado = { lineas: [linea('b', 'Set Diablita', 14300)] };
    expect(sincronizarPedido(guardado, [item('b', 'Set Diablita', 14300)])).toBe(guardado);
  });
});
