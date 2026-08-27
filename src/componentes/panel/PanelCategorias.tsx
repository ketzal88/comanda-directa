'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';
import type { Categoria } from '@/logica/tipos';

const CLASE_CAMPO = 'rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500';

/** Alta, renombre y orden de categorías. Las subcategorías (para agrupar
 *  dentro de una categoría, ej. "Rolls clásicos" / "Rolls especiales") no
 *  tienen UI todavía — quedan para una próxima etapa, ver README. */
export function PanelCategorias({ slug, categorias: iniciales }: { slug: string; categorias: Categoria[] }) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(iniciales);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError(null);
    try {
      const orden = (categorias.at(-1)?.orden ?? 0) + 1;
      const { categoria } = await apiPanel(slug).crearCategoria({ nombre: nombre.trim(), orden });
      setCategorias((prev) => [...prev, categoria]);
      setNombre('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear');
    }
  };

  const renombrar = async (id: string, nuevoNombre: string) => {
    setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: nuevoNombre } : c)));
    await apiPanel(slug).editarCategoria(id, { nombre: nuevoNombre });
    router.refresh();
  };

  const cambiarOrden = async (id: string, orden: number) => {
    setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, orden } : c)));
    await apiPanel(slug).editarCategoria(id, { orden });
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Categorías</h1>

      <ul className="mt-6 grid gap-2">
        {[...categorias]
          .sort((a, b) => a.orden - b.orden)
          .map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <input
                type="number"
                value={c.orden}
                onChange={(e) => cambiarOrden(c.id, Number(e.target.value) || 1)}
                className={`${CLASE_CAMPO} w-20`}
                aria-label="Orden"
              />
              <input
                value={c.nombre}
                onChange={(e) => renombrar(c.id, e.target.value)}
                className={`${CLASE_CAMPO} flex-1`}
              />
            </li>
          ))}
      </ul>

      <form onSubmit={crear} className="mt-6 flex gap-3">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la categoría nueva"
          className={`${CLASE_CAMPO} flex-1`}
        />
        <button type="submit" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-neutral-950">
          Agregar
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
