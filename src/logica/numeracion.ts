import type { Categoria, Item } from './tipos';

/** Devuelve los ítems ACTIVOS ordenados como se ven en la carta, con
 *  `numero` corrido desde 1. El número es DERIVADO del orden: nunca se edita
 *  a mano, y marcar algo sin stock NO renumera.
 *
 *  Los inactivos se excluyen (borrado suave) y los huérfanos —ítems cuya
 *  categoría ya no existe— también, en vez de tirar error. */
export function renumerar(items: Item[], categorias: Categoria[]): Item[] {
  const ordenCategoria = new Map(categorias.map((c) => [c.id, c.orden]));
  const ordenSub = new Map<string, number>();
  for (const c of categorias) {
    for (const s of c.subcategorias) ordenSub.set(`${c.id}::${s.nombre}`, s.orden);
  }

  const ordenados = items
    .filter((i) => i.activo && ordenCategoria.has(i.categoriaId))
    .sort((a, b) => {
      const porCategoria = ordenCategoria.get(a.categoriaId)! - ordenCategoria.get(b.categoriaId)!;
      if (porCategoria !== 0) return porCategoria;

      const subA = ordenSub.get(`${a.categoriaId}::${a.subcategoria ?? ''}`) ?? 0;
      const subB = ordenSub.get(`${b.categoriaId}::${b.subcategoria ?? ''}`) ?? 0;
      if (subA !== subB) return subA - subB;

      if (a.orden !== b.orden) return a.orden - b.orden;
      return a.id.localeCompare(b.id); // desempate estable
    });

  return ordenados.map((item, i) => ({ ...item, numero: i + 1 }));
}
