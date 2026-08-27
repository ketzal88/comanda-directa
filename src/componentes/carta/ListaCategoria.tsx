'use client';

import { FilaItem } from './FilaItem';
import { formatearPrecio } from '@/logica/precio';
import { preciosComunes } from '@/logica/variantes';
import type { Categoria, Item, Variante } from '@/logica/tipos';

type Props = {
  categoria: Categoria;
  items: Item[]; // ya filtrados; si está vacío, la categoría NO se renderiza
};

function PreciosDelBloque({ variantes }: { variantes: Variante[] }) {
  return (
    <span className="metadata-item whitespace-nowrap">
      {variantes
        .filter((v) => v.precio > 0)
        .map((v) => `${v.etiqueta} ${formatearPrecio(v.precio)}`)
        .join(' · ')}
    </span>
  );
}

function Bloque({ items }: { items: Item[] }) {
  const comunes = preciosComunes(items);
  return (
    <>
      {items.map((item) => (
        <FilaItem key={item.id} item={item} preciosEnTitulo={comunes != null} />
      ))}
    </>
  );
}

/** Título de la categoría + regla fina + ítems agrupados por subcategoría.
 *  Una categoría sin ítems visibles no aparece. */
export function ListaCategoria({ categoria, items }: Props) {
  if (!items.length) return null;

  const subcategorias = [...categoria.subcategorias].sort((a, b) => a.orden - b.orden);
  const sueltos = items.filter(
    (i) => !i.subcategoria || !subcategorias.some((s) => s.nombre === i.subcategoria),
  );
  const comunesSueltos = preciosComunes(sueltos);

  return (
    <section
      id={`cat-${categoria.id}`}
      data-seccion={categoria.id}
      aria-labelledby={`titulo-${categoria.id}`}
      className="px-6 pt-10 scroll-mt-14"
    >
      <h2 id={`titulo-${categoria.id}`} className="titulo-categoria">
        {categoria.nombre}
        {categoria.nombreEn && (
          <>
            {' '}
            <span aria-hidden="true">/</span> <span className="italic">{categoria.nombreEn}</span>
          </>
        )}
      </h2>
      <hr className="mt-2 mb-3 border-t border-regla" />

      {comunesSueltos && (
        <p className="text-right mb-1">
          <PreciosDelBloque variantes={comunesSueltos} />
        </p>
      )}

      <Bloque items={sueltos} />

      {subcategorias.map((sub) => {
        const deSub = items.filter((i) => i.subcategoria === sub.nombre);
        if (!deSub.length) return null;
        const comunes = preciosComunes(deSub);
        return (
          <div key={sub.nombre} className="mt-6">
            <h3 className="titulo-subcategoria">{sub.nombre}</h3>
            {comunes && (
              <p className="text-right -mt-[2px]">
                <PreciosDelBloque variantes={comunes} />
              </p>
            )}
            <div className="mt-2">
              <Bloque items={deSub} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
