'use client';

import { chispas } from './chispas';
import { usePedido } from '@/componentes/pedido/usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { claveLinea } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde, tieneVariantes, variantesDe } from '@/logica/variantes';
import type { Item } from '@/logica/tipos';

type Props = { item: Item; onAbrir: (item: Item) => void };

/** Un producto en la grilla: foto, nombre, precio y el botón de agregar.
 *
 *  La foto abre la ficha y el botón agrega, que son dos cosas distintas y por
 *  eso son dos botones. Con una excepción que el artboard no contemplaba: si
 *  el producto viene en varios talles, agregar desde acá sería elegir por el
 *  comprador. En ese caso el botón dice "Elegir talle" y abre la ficha, donde
 *  cada talle tiene su propio contador. Un disfraz en el talle equivocado es
 *  una devolución. */
export function TarjetaProducto({ item, onAbrir }: Props) {
  const { slug } = useClienteActual();
  const { agregarItem, cambiarCantidad, cantidadDe } = usePedido(slug);

  const medidas = variantesDe(item);
  const hayQueElegir = tieneVariantes(item) && medidas.length > 1;
  const cantidad = medidas.reduce((n, v) => n + cantidadDe(item.id, v.etiqueta), 0);
  const desde = precioDesde(item);

  const sumar = (e: React.MouseEvent<HTMLButtonElement>) => {
    chispas(e.currentTarget, cantidad === 0);
    agregarItem(item, medidas[0].etiqueta || undefined);
  };

  return (
    <article
      className="halloween-tarjeta hw-entra-scroll flex flex-col gap-2 p-2 pb-2.5"
      style={{ opacity: item.agotado ? 0.55 : 1 }}
    >
      <button
        type="button"
        onClick={() => onAbrir(item)}
        aria-label={`Ver ${item.nombre} en grande`}
        className="block w-full aspect-square overflow-hidden rounded-[10px] border-0 p-0 cursor-zoom-in"
        style={{ background: 'var(--h-foto)' }}
      >
        {item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fotoUrl}
            alt={item.nombre}
            loading="lazy"
            decoding="async"
            className="block w-full h-full object-cover"
          />
        ) : (
          <span className="grid place-items-center w-full h-full text-[38px]" aria-hidden="true">
            🎃
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-0.5 px-1">
        <div className="text-[14.5px] font-medium leading-[1.2] text-pretty">{item.nombre}</div>
        <div className="mt-auto pt-1 flex items-baseline gap-1">
          {hayQueElegir && (
            <span className="halloween-mano text-[15px]" style={{ color: 'var(--h-tinta-suave)' }}>
              desde
            </span>
          )}
          <span className="font-bold text-[17px]" style={{ color: 'var(--h-tinta)' }}>
            {desde > 0 ? formatearPrecio(desde) : 'Consultar'}
          </span>
        </div>
      </div>

      {item.agotado ? (
        <div
          className="h-10 grid place-items-center rounded-full text-[14px] font-semibold uppercase tracking-wide"
          style={{ background: 'var(--h-foto)', color: 'var(--h-tinta-suave)' }}
        >
          Sin stock
        </div>
      ) : hayQueElegir ? (
        <button
          type="button"
          onClick={() => onAbrir(item)}
          className="h-10 rounded-full border-2 font-semibold text-[15px] transition-colors"
          style={{
            borderColor: 'var(--h-tinta)',
            background: cantidad > 0 ? 'var(--h-tinta)' : 'var(--h-crema)',
            color: cantidad > 0 ? 'var(--h-crema)' : 'var(--h-tinta)',
          }}
        >
          {cantidad > 0 ? `${cantidad} en el pedido` : 'Elegir talle'}
        </button>
      ) : cantidad > 0 ? (
        <div
          className="h-10 flex items-center justify-between rounded-full px-1 text-white"
          style={{ background: 'var(--h-naranja)' }}
        >
          <button
            type="button"
            onClick={() => cambiarCantidad(claveLinea(item.id, medidas[0].etiqueta), cantidad - 1)}
            aria-label={`Sacar uno de ${item.nombre}`}
            className="w-[34px] h-[34px] rounded-full border-0 text-[20px] font-bold leading-none text-white"
            style={{ background: 'rgb(255 255 255 / 0.22)' }}
          >
            <span aria-hidden="true">−</span>
          </button>
          <span className="font-bold text-[16px] tabular-nums" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={sumar}
            aria-label={`Agregar otro ${item.nombre}`}
            className="w-[34px] h-[34px] rounded-full border-0 text-[20px] font-bold leading-none text-white"
            style={{ background: 'rgb(255 255 255 / 0.22)' }}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={sumar}
          aria-label={`Agregar ${item.nombre} al pedido`}
          className="h-10 rounded-full border-2 font-semibold text-[15px]"
          style={{
            borderColor: 'var(--h-tinta)',
            background: 'var(--h-crema)',
            color: 'var(--h-tinta)',
          }}
        >
          + Agregar
        </button>
      )}
    </article>
  );
}
