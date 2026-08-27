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
});

describe('armarMensaje', () => {
  it('incluye el nombre del local recibido por parámetro, no hardcodeado', () => {
    const pedido = agregar(PEDIDO_VACIO, lineaDeItem(item)!);
    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, 'La Esquina');
    expect(mensaje).toContain('*Pedido — La Esquina*');
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
