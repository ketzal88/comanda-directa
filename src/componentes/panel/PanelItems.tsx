'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde, tieneVariantes } from '@/logica/variantes';
import type { Categoria, Item } from '@/logica/tipos';

export function PanelItems({ slug, items, categorias }: { slug: string; items: Item[]; categorias: Categoria[] }) {
  const router = useRouter();
  const porCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));

  const marcar = async (id: string, campo: 'agotado' | 'activo', valor: boolean) => {
    await apiPanel(slug).editarItem(id, { [campo]: valor });
    router.refresh();
  };

  const activos = items.filter((i) => i.activo);
  const sacados = items.filter((i) => !i.activo);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ítems</h1>
        <Link href={`/${slug}/panel/nuevo`} className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-neutral-950">
          + Nuevo ítem
        </Link>
      </div>

      {!categorias.length && (
        <p className="mt-6 rounded-lg bg-white/5 p-4 text-sm text-neutral-300">
          Todavía no hay categorías. <Link href={`/${slug}/panel/categorias`} className="text-orange-400 underline">Creá la primera</Link> antes de cargar ítems.
        </p>
      )}

      <ul className="mt-6 divide-y divide-white/10">
        {activos.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className={`font-medium ${item.agotado ? 'line-through opacity-50' : ''}`}>{item.nombre}</p>
              <p className="text-xs text-neutral-400">
                {porCategoria.get(item.categoriaId) ?? '(categoría eliminada)'} ·{' '}
                {tieneVariantes(item) ? `desde ${formatearPrecio(precioDesde(item))}` : formatearPrecio(item.precio)}
              </p>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-neutral-300">
              <input type="checkbox" checked={item.agotado} onChange={(e) => marcar(item.id, 'agotado', e.target.checked)} />
              Sin stock
            </label>
            <Link href={`/${slug}/panel/editar/${item.id}`} className="text-sm text-orange-400 hover:underline">
              Editar
            </Link>
            <button type="button" onClick={() => marcar(item.id, 'activo', false)} className="text-sm text-neutral-500 hover:text-white">
              Sacar
            </button>
          </li>
        ))}
      </ul>

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
