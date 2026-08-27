import { describe, expect, it } from 'vitest';
import { agregar, cambiarCantidad, lineaDeCubierto, lineaDeItem, quitar, sanearPedido, totalizar, PEDIDO_VACIO } from '../src/logica/pedido';
import type { Item } from '../src/logica/tipos';

const roll: Item = {
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

describe('agregar / totalizar', () => {
  it('suma cantidad al agregar el mismo ítem dos veces', () => {
    const linea = lineaDeItem(roll)!;
    let pedido = agregar(PEDIDO_VACIO, linea);
    pedido = agregar(pedido, linea);
    expect(pedido.lineas).toHaveLength(1);
    expect(pedido.lineas[0].cantidad).toBe(2);
    expect(totalizar(pedido).total).toBe(17800);
  });

  it('no supera MAX_CANTIDAD', () => {
    const linea = lineaDeItem(roll)!;
    let pedido = { lineas: [{ ...linea, cantidad: 40 }] };
    pedido = agregar(pedido, linea);
    expect(pedido.lineas[0].cantidad).toBe(40);
  });

  it('cambiarCantidad a 0 saca la línea', () => {
    const linea = lineaDeItem(roll)!;
    const pedido = agregar(PEDIDO_VACIO, linea);
    expect(cambiarCantidad(pedido, linea.clave, 0).lineas).toHaveLength(0);
  });

  it('el cubierto sin precio cargado no genera línea', () => {
    expect(lineaDeCubierto(0)).toBeNull();
    expect(lineaDeCubierto(1500)).not.toBeNull();
  });
});

describe('sanearPedido', () => {
  it('descarta basura y funde líneas con la misma clave', () => {
    const crudo = {
      lineas: [
        { itemId: 'roll', nombre: 'Roll', variante: '', precioUnitario: 8900, cantidad: 1 },
        { itemId: 'roll', nombre: 'Roll', variante: '', precioUnitario: 8900, cantidad: 2 },
        { itemId: '', nombre: '' }, // basura: sin itemId ni nombre
      ],
    };
    const pedido = sanearPedido(crudo);
    expect(pedido.lineas).toHaveLength(1);
    expect(pedido.lineas[0].cantidad).toBe(3);
  });

  it('cualquier cosa que no sea un objeto con lineas da el pedido vacío', () => {
    expect(sanearPedido(null)).toEqual(PEDIDO_VACIO);
    expect(sanearPedido('texto')).toEqual(PEDIDO_VACIO);
  });
});

describe('quitar', () => {
  it('saca la línea por clave', () => {
    const linea = lineaDeItem(roll)!;
    const pedido = agregar(PEDIDO_VACIO, linea);
    expect(quitar(pedido, linea.clave).lineas).toHaveLength(0);
  });
});
