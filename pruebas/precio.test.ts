import { describe, expect, it } from 'vitest';
import { formatearPrecio, parsearPrecio } from '../src/logica/precio';

describe('formatearPrecio', () => {
  it('formatea con separador de miles es-AR', () => {
    expect(formatearPrecio(32000)).toBe('$32.000');
  });
  it('nunca escribe decimales', () => {
    expect(formatearPrecio(0)).toBe('$0');
  });
});

describe('parsearPrecio', () => {
  it('lee un precio con puntos de miles', () => {
    expect(parsearPrecio('$32.000')).toBe(32000);
  });
  it('descarta los centavos', () => {
    expect(parsearPrecio('32000,50')).toBe(32000);
  });
  it('devuelve null si no hay un precio válido', () => {
    expect(parsearPrecio('')).toBeNull();
    expect(parsearPrecio('gratis')).toBeNull();
  });
});
