import { describe, expect, it } from 'vitest';
import { armarMensaje, enlaceWhatsApp, normalizarNumero, numeroUsable, validarDatos } from '../src/logica/whatsapp';
import { agregar, lineaDeItem, PEDIDO_VACIO } from '../src/logica/pedido';
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
