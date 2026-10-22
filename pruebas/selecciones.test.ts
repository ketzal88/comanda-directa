import { describe, expect, it } from 'vitest';
import { CATALOGO_HALLOWEEN } from '../scripts/catalogo-halloween';

const SLUG = 'party-market';
import { SELECCIONES } from '../src/clientes/selecciones';

/** Una selección nombra productos de la carta: si uno no está, el comprador
 *  ve una opción incompleta y un total que no es el que se le pasó. Hoy no hay
 *  ninguna cargada (ver `src/clientes/selecciones.ts`), pero la invariante se
 *  verifica igual para la próxima que se sume. */

const porNombre = new Map(CATALOGO_HALLOWEEN.items.map((i) => [i.nombre, i]));

describe('selecciones', () => {
  const seleccionesDelCliente = Object.entries(SELECCIONES[SLUG] ?? {});

  for (const [codigo, seleccion] of seleccionesDelCliente) {
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

  it('la estructura de selecciones del cliente es válida', () => {
    expect(SELECCIONES[SLUG]).toBeDefined();
  });
});
