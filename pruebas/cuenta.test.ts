import { describe, expect, it } from 'vitest';
import { calcularCuenta } from '../src/logica/cuenta';

describe('calcularCuenta', () => {
  it('aplica el descuento de retiro solo en modalidad retiro', () => {
    const lineas = [{ importe: 10000, bonificada: false }];
    const conRetiro = calcularCuenta({
      lineas,
      modalidad: 'retiro',
      descuentoRetiro: { tipo: 'porcentaje', valor: 10 },
      descuentoManual: { tipo: 'ninguno' },
      envio: 0,
    });
    expect(conRetiro.total).toBe(9000);

    const enSalon = calcularCuenta({
      lineas,
      modalidad: 'salon',
      descuentoRetiro: { tipo: 'porcentaje', valor: 10 },
      descuentoManual: { tipo: 'ninguno' },
      envio: 0,
    });
    expect(enSalon.total).toBe(10000);
  });

  it('el envío se suma después de aplicar los descuentos', () => {
    const cuenta = calcularCuenta({
      lineas: [{ importe: 10000, bonificada: false }],
      modalidad: 'delivery',
      descuentoRetiro: { tipo: 'ninguno' },
      descuentoManual: { tipo: 'porcentaje', valor: 50 },
      envio: 3000,
    });
    expect(cuenta.total).toBe(5000 + 3000);
  });

  it('detecta líneas sin precio (a confirmar) sin contarlas como cero', () => {
    const cuenta = calcularCuenta({
      lineas: [{ importe: null, bonificada: false }, { importe: 5000, bonificada: false }],
      modalidad: 'retiro',
      descuentoRetiro: { tipo: 'ninguno' },
      descuentoManual: { tipo: 'ninguno' },
      envio: 0,
    });
    expect(cuenta.hayLineasSinPrecio).toBe(true);
    expect(cuenta.subtotal).toBe(5000);
  });

  it('nunca da un total negativo', () => {
    const cuenta = calcularCuenta({
      lineas: [{ importe: 1000, bonificada: false }],
      modalidad: 'retiro',
      descuentoRetiro: { tipo: 'monto', valor: 999999 },
      descuentoManual: { tipo: 'ninguno' },
      envio: 0,
    });
    expect(cuenta.total).toBe(0);
  });
});
