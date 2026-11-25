import { describe, expect, it } from 'vitest';
import { cuotasDeTarjeta, efectivoDeCosto, efectivoDeTarjeta, tarjetaDeEfectivo } from '../src/logica/precios-admin';

describe('precios-admin', () => {
  it('el 10% off de la carta sobre la tarjeta da EXACTO el efectivo', () => {
    for (let e = 100; e <= 2_000_000; e += 100) {
      expect(efectivoDeTarjeta(tarjetaDeEfectivo(e))).toBe(e);
    }
  });

  it('la tarjeta no sube una centena de más por error de coma flotante', () => {
    expect(tarjetaDeEfectivo(2700)).toBe(3000);
    expect(tarjetaDeEfectivo(900)).toBe(1000);
    expect(tarjetaDeEfectivo(1000)).toBe(1200);
  });

  it('costo + margen a la centena más cercana, y cuotas hacia arriba', () => {
    expect(efectivoDeCosto(1000, 50)).toBe(1500);
    expect(efectivoDeCosto(0, 50)).toBe(0);
    expect(cuotasDeTarjeta(1000, 15)).toBe(1200);
    expect(cuotasDeTarjeta(1000, 0)).toBe(1000);
  });
});
