import { describe, expect, it } from 'vitest';
import { validarCubierto, validarDescuento, validarNotas, validarZonas } from '../src/logica/validar-config';

describe('validar-config', () => {
  it('zonas: precio entero, 0 o null; nada de negativos ni basura', () => {
    expect(validarZonas([{ nombre: ' Centro ', precio: 1500.7 }, { nombre: 'Lejos', precio: null }])).toEqual([
      { nombre: 'Centro', precio: 1500 },
      { nombre: 'Lejos', precio: null },
    ]);
    expect(validarZonas([{ nombre: 'X', precio: -1 }])).toBeNull();
    expect(validarZonas([{ nombre: '', precio: 0 }])).toBeNull();
    expect(validarZonas([{ nombre: 'X', precio: '100' }])).toBeNull();
    expect(validarZonas('x')).toBeNull();
  });

  it('descuento: porcentaje hasta 100, monto entero, ninguno', () => {
    expect(validarDescuento({ tipo: 'ninguno', valor: 9 })).toEqual({ tipo: 'ninguno' });
    expect(validarDescuento({ tipo: 'porcentaje', valor: 10 })).toEqual({ tipo: 'porcentaje', valor: 10 });
    expect(validarDescuento({ tipo: 'porcentaje', valor: 150 })).toBeNull();
    expect(validarDescuento({ tipo: 'monto', valor: -5 })).toBeNull();
    expect(validarDescuento({ tipo: 'regalo' })).toBeNull();
  });

  it('notas y cubierto', () => {
    expect(validarNotas([' a ', '', 'b'])).toEqual(['a', 'b']);
    expect(validarNotas([1])).toBeNull();
    expect(validarCubierto(500)).toBe(500);
    expect(validarCubierto(-1)).toBeNull();
  });
});
