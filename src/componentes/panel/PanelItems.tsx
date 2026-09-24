'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { apiPanel } from './api';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde, tieneVariantes } from '@/logica/variantes';
import type { Categoria, Item } from '@/logica/tipos';

/** Saca tildes y mayúsculas para buscar: quien escribe rápido pone "arana" y
 *  espera encontrar "Araña". */
function plano(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function PanelItems({
  slug,
  items,
  categorias,
}: {
  slug: string;
  items: Item[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  const marcar = async (id: string, campo: 'agotado' | 'activo', valor: boolean) => {
    await apiPanel(slug).editarItem(id, { [campo]: valor });
    router.refresh();
  };

  // La base ordena sólo por `orden`, que es POR CATEGORÍA: sin esto la lista
  // sale intercalada (todos los primeros de cada categoría, después todos los
  // segundos) y buscar un producto entre ochenta es imposible. Acá queda en
  // el mismo orden en que se ve la carta.
  const ordenCategoria = useMemo(
    () => new Map(categorias.map((c) => [c.id, c.orden])),
    [categorias],
  );
  const porCategoria = useMemo(
    () => new Map(categorias.map((c) => [c.id, c.nombre])),
    [categorias],
  );

  const ordenados = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          (ordenCategoria.get(a.categoriaId) ?? 999) - (ordenCategoria.get(b.categoriaId) ?? 999) ||
          a.orden - b.orden ||
          a.nombre.localeCompare(b.nombre),
      ),
    [items, ordenCategoria],
  );

  const consulta = plano(busqueda.trim());
  const coincide = (i: Item) =>
    !consulta ||
    plano(i.nombre).includes(consulta) ||
    plano(porCategoria.get(i.categoriaId) ?? '').includes(consulta);

  const activos = ordenados.filter((i) => i.activo && coincide(i));
  const sacados = ordenados.filter((i) => !i.activo);

  // el nombre de la categoría se repite en cada fila si no se agrupa; con un
  // encabezado por grupo la lista se recorre como la carta
  const grupos: { nombre: string; items: Item[] }[] = [];
  for (const item of activos) {
    const nombre = porCategoria.get(item.categoriaId) ?? '(categoría eliminada)';
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.nombre === nombre) ultimo.items.push(item);
    else grupos.push({ nombre, items: [item] });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Ítems</h1>
        <Link
          href={`/${slug}/panel/nuevo`}
          className="shrink-0 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-neutral-950"
        >
          + Nuevo ítem
        </Link>
      </div>

      {!categorias.length && (
        <p className="mt-6 rounded-lg bg-white/5 p-4 text-sm text-neutral-300">
          Todavía no hay categorías.{' '}
          <Link href={`/${slug}/panel/categorias`} className="text-orange-400 underline">
            Creá la primera
          </Link>{' '}
          antes de cargar ítems.
        </p>
      )}

      {items.length > 12 && (
        <div className="mt-5">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o categoría…"
            aria-label="Buscar un ítem"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-orange-400"
          />
          <p className="mt-1.5 text-xs text-neutral-500" aria-live="polite">
            {consulta
              ? `${activos.length} de ${items.filter((i) => i.activo).length} ítems`
              : `${activos.length} ítems en la carta`}
          </p>
        </div>
      )}

      {consulta && !activos.length && (
        <p className="mt-6 rounded-lg bg-white/5 p-4 text-sm text-neutral-300">
          No hay ningún ítem que coincida con “{busqueda.trim()}”.
        </p>
      )}

      {grupos.map((grupo) => (
        <section key={grupo.nombre} className="mt-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {grupo.nombre}
          </h2>
          <ul className="mt-1 divide-y divide-white/10">
            {grupo.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${item.agotado ? 'line-through opacity-50' : ''}`}>
                    {item.nombre}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {tieneVariantes(item)
                      ? `${item.variantes.length} ${item.variantes.length === 1 ? 'medida' : 'medidas'} · desde ${formatearPrecio(precioDesde(item))}`
                      : item.precio > 0
                        ? formatearPrecio(item.precio)
                        : 'sin precio cargado'}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={item.agotado}
                    onChange={(e) => marcar(item.id, 'agotado', e.target.checked)}
                  />
                  Sin stock
                </label>
                <Link
                  href={`/${slug}/panel/editar/${item.id}`}
                  className="text-sm text-orange-400 hover:underline"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => marcar(item.id, 'activo', false)}
                  className="text-sm text-neutral-500 hover:text-white"
                >
                  Sacar
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {sacados.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-neutral-400">
            Sacados de la carta ({sacados.length})
          </summary>
          <ul className="mt-3 divide-y divide-white/10">
            {sacados.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 opacity-60">
                <p className="min-w-0 flex-1">{item.nombre}</p>
                <button
                  type="button"
                  onClick={() => marcar(item.id, 'activo', true)}
                  className="text-sm text-orange-400 hover:underline"
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
