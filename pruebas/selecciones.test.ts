import { describe, expect, it } from 'vitest';
import { CATALOGO_HALLOWEEN, CONFIG_PEDIDO_HALLOWEEN } from '../scripts/catalogo-halloween';

const SLUG = 'party-market';
import { SELECCIONES, lineasDeOpcion } from '../src/clientes/selecciones';
import { precioConDescuentoPago } from '../src/logica/cuenta';

/** Una selección nombra productos de la carta: si uno no está, el comprador
 *  ve una opción incompleta y un total que no es el que se le pasó. */

const porNombre = new Map(CATALOGO_HALLOWEEN.items.map((i) => [i.nombre, i]));

describe('selecciones', () => {
  for (const [codigo, seleccion] of Object.entries(SELECCIONES[SLUG])) {
    it(`${codigo}: cada producto está en la carta, con precio`, () => {
      const faltan = seleccion.opciones
        .flatMap((o) => o.lineas)
        .filter((l) => !(porNombre.get(l.producto)?.precio ?? 0))
        .map((l) => l.producto);
      expect(faltan).toEqual([]);
    });

    it(`${codigo}: el código no dice de quién es`, () => {
      expect(codigo).toMatch(/^[a-z0-9]{6}$/);
    });
  }

  it('el presupuesto de octubre da los totales en efectivo de la planilla', () => {
    // Hoja "Resumen": A $321.600, B $630.200, C $1.052.700 (efectivo). B y C
    // dan $100 menos: el Colgante Pesadilla Blanco ya estaba en la web a
    // $25.600 en efectivo y la hoja lo calculó a $25.700 (redondeo para
    // arriba). Manda el precio de la web, que es el que se cobra.
    const seleccion = SELECCIONES[SLUG].upopj6;
    const efectivo = CONFIG_PEDIDO_HALLOWEEN.descuentosPago.efectivo!;
    const total = (letra: string) =>
      lineasDeOpcion(seleccion, letra).reduce(
        (t, l) => t + precioConDescuentoPago(porNombre.get(l.producto)!.precio, efectivo) * l.cantidad,
        0,
      );
    expect([total('A'), total('B'), total('C')]).toEqual([321600, 630100, 1052600]);
    expect(lineasDeOpcion(seleccion, 'C')).toHaveLength(25);
  });
});
