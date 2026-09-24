'use client';

import { Calabaza } from './Adornos';
import { usePedido } from '@/componentes/pedido/usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde, tieneVariantes, variantesDe } from '@/logica/variantes';
import type { Item } from '@/logica/tipos';

type Props = { item: Item; onAbrir: (item: Item) => void; retraso: number };

/** Un producto en la grilla: foto, nombre y precio.
 *
 *  La tarjeta entera es el botón que abre la ficha, en vez de tener un "+"
 *  que agrega desde acá. Con talles no hay nada que agregar sin preguntar
 *  primero cuál, y con un blanco de 44px el nombre no alcanza para decidir
 *  una compra de $60.000: la foto grande es el paso obligado, no un extra.
 *
 *  Cuando el producto ya está en el pedido lo dice con un globo, así se ve
 *  scrolleando y no hay que abrir la hoja para saber qué se lleva. */
export function TarjetaProducto({ item, onAbrir, retraso }: Props) {
  const { slug } = useClienteActual();
  const { cantidadDe } = usePedido(slug);

  const enElPedido = variantesDe(item).reduce((n, v) => n + cantidadDe(item.id, v.etiqueta), 0);
  const desde = precioDesde(item);
  const variasMedidas = tieneVariantes(item) && variantesDe(item).length > 1;

  return (
    <button
      type="button"
      onClick={() => onAbrir(item)}
      style={{ animationDelay: `${retraso}ms` }}
      className={`halloween-tarjeta h-entra relative flex flex-col overflow-hidden text-left ${
        item.agotado ? 'opacity-60' : ''
      }`}
    >
      {enElPedido > 0 && (
        <span
          className="absolute right-2 top-2 z-10 grid place-items-center min-w-7 h-7 px-2 rounded-full border-2 text-[13px] font-extrabold tabular-nums"
          style={{
            background: 'var(--h-naranja)',
            borderColor: 'var(--h-violeta)',
            color: '#fff',
          }}
        >
          {enElPedido}
          <span className="sr-only"> en el pedido</span>
        </span>
      )}

      <span
        className="block w-full aspect-square"
        style={{ background: 'var(--h-papel)' }}
      >
        {item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fotoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="grid place-items-center w-full h-full">
            <Calabaza className="w-14 text-[color:var(--h-naranja-claro)]" />
          </span>
        )}
      </span>

      <span
        className="flex flex-1 flex-col gap-1 px-3 py-2.5 border-t-2"
        style={{ borderColor: 'var(--h-violeta)' }}
      >
        <span
          className="block text-[14px] font-bold leading-[1.25]"
          style={{ color: 'var(--h-violeta)' }}
        >
          {item.nombre}
        </span>

        <span className="mt-auto flex items-baseline gap-1.5 flex-wrap">
          {desde > 0 ? (
            <>
              {variasMedidas && (
                <span className="text-[11px] font-bold" style={{ color: 'var(--h-violeta-medio)' }}>
                  desde
                </span>
              )}
              <span
                className="text-[16px] font-extrabold tabular-nums"
                style={{ color: 'var(--h-naranja)' }}
              >
                {formatearPrecio(desde)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-bold" style={{ color: 'var(--h-violeta-medio)' }}>
              Consultar precio
            </span>
          )}
        </span>

        {item.agotado && (
          <span
            className="text-[11px] font-extrabold uppercase tracking-wide"
            style={{ color: 'var(--h-violeta-medio)' }}
          >
            Sin stock
          </span>
        )}
      </span>
    </button>
  );
}
