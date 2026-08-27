import { describe, expect, it } from 'vitest';
import { renumerar } from '../src/logica/numeracion';
import type { Categoria, Item } from '../src/logica/tipos';

const categorias: Categoria[] = [
  { id: 'a', nombre: 'A', nombreEn: '', orden: 1, subcategorias: [] },
  { id: 'b', nombre: 'B', nombreEn: '', orden: 2, subcategorias: [] },
];

function item(parcial: Partial<Item> & Pick<Item, 'id' | 'categoriaId' | 'orden'>): Item {
  return {
    numero: 0,
    nombre: parcial.id,
    precio: 100,
    variantes: [],
    agotado: false,
    activo: true,
    etiquetas: [],
    ...parcial,
  };
}

describe('renumerar', () => {
  it('numera desde 1, por categoría y orden', () => {
    const items = [
      item({ id: '1', categoriaId: 'b', orden: 1 }),
      item({ id: '2', categoriaId: 'a', orden: 2 }),
      item({ id: '3', categoriaId: 'a', orden: 1 }),
    ];
    const resultado = renumerar(items, categorias);
    expect(resultado.map((i) => i.id)).toEqual(['3', '2', '1']);
    expect(resultado.map((i) => i.numero)).toEqual([1, 2, 3]);
  });

  it('excluye inactivos y no los cuenta en la numeración', () => {
    const items = [
      item({ id: '1', categoriaId: 'a', orden: 1 }),
      item({ id: '2', categoriaId: 'a', orden: 2, activo: false }),
      item({ id: '3', categoriaId: 'a', orden: 3 }),
    ];
    const resultado = renumerar(items, categorias);
    expect(resultado.map((i) => i.id)).toEqual(['1', '3']);
    expect(resultado.map((i) => i.numero)).toEqual([1, 2]);
  });

  it('excluye ítems de categorías que ya no existen', () => {
    const items = [item({ id: '1', categoriaId: 'fantasma', orden: 1 })];
    expect(renumerar(items, categorias)).toEqual([]);
  });

  it('marcar agotado no renumera', () => {
    const items = [
      item({ id: '1', categoriaId: 'a', orden: 1 }),
      item({ id: '2', categoriaId: 'a', orden: 2, agotado: true }),
    ];
    const resultado = renumerar(items, categorias);
    expect(resultado.find((i) => i.id === '2')?.numero).toBe(2);
  });
});
