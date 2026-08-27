'use client';

import { BotonAgregar } from '@/componentes/pedido/BotonAgregar';
import { nombreVisible } from '@/logica/nombre-item';
import { formatearPrecio } from '@/logica/precio';
import { tieneVariantes, variantesDe } from '@/logica/variantes';
import type { Item } from '@/logica/tipos';

type Props = {
  item: Item;
  /** true cuando el precio de las medidas ya está anunciado en el título del
   *  bloque: la fila muestra la medida y el "+", pero no repite el precio. */
  preciosEnTitulo?: boolean;
};

/** Un ítem de la carta: número, nombre, descripción, precio a la derecha, y
 *  el "+" del pedido. precio 0 = sin precio cargado: nunca se muestra "$0". */
export function FilaItem({ item, preciosEnTitulo = false }: Props) {
  const conMedidas = tieneVariantes(item);

  return (
    <div className={`flex gap-3 py-3 ${item.agotado ? 'opacity-40' : ''}`}>
      <div className="flex-1 min-w-0 flex gap-3">
        <span className="numero-item shrink-0 w-8 pt-[4px] text-tinta-suave">
          {String(item.numero).padStart(3, '0')}
        </span>
        {item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fotoUrl}
            alt=""
            loading="lazy"
            className="w-11 h-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="w-11 h-11 shrink-0" aria-hidden="true" />
        )}
        <span className="flex-1 min-w-0">
          <span className={`nombre-item block ${item.agotado ? 'line-through' : ''}`}>
            {nombreVisible(item)}
          </span>
          {item.descripcion && <span className="metadata-item block mt-[2px]">{item.descripcion}</span>}
          {(item.piezas != null || item.etiquetas.length > 0) && (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-[3px]">
              {item.piezas != null && <span className="metadata-item">{item.piezas} piezas</span>}
              {item.etiquetas.map((e) => (
                <span key={e} className={e === 'nuevo' ? 'etiqueta-nueva' : 'etiqueta-item'}>
                  {e}
                </span>
              ))}
            </span>
          )}
          {item.agotado && (
            <span className="metadata-item block mt-[2px] tracking-[0.08em] uppercase">
              Sin stock hoy
            </span>
          )}
        </span>
        {!conMedidas && item.precio > 0 && (
          <span className="numero-item shrink-0 pt-[4px]">{formatearPrecio(item.precio)}</span>
        )}
      </div>

      {conMedidas ? (
        <div className="shrink-0 flex flex-col items-end gap-3">
          {variantesDe(item).map((v) => (
            <div key={v.etiqueta} className="flex items-center gap-2">
              <span className="metadata-item whitespace-nowrap">{v.etiqueta}</span>
              {!preciosEnTitulo && v.precio > 0 && (
                <span className="numero-item whitespace-nowrap">{formatearPrecio(v.precio)}</span>
              )}
              <BotonAgregar item={item} variante={v.etiqueta} />
            </div>
          ))}
        </div>
      ) : (
        <BotonAgregar item={item} />
      )}
    </div>
  );
}
