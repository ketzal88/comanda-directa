'use client';

import { useEffect, useRef } from 'react';
import { chispas } from './chispas';
import { fotoGrande } from './fotos';
import { usePedido } from '@/componentes/pedido/usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { claveLinea } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import { tieneVariantes, variantesDe } from '@/logica/variantes';
import type { Item } from '@/logica/tipos';

type Props = { item: Item; onCerrar: () => void };

/** La ficha del producto: la foto grande, lo que trae y los talles.
 *
 *  El artboard mostraba acá foto, nombre, precio y un "+ Agregar". Le falta
 *  una cosa que sí está en los datos: los talles. Nueve disfraces vienen en
 *  más de uno, y el talle tiene que llegar al mensaje de WhatsApp o el local
 *  despacha a ciegas. Así que cada talle tiene su fila, con su precio y su
 *  propio contador: quien arma una fiesta se lleva dos M y una S del mismo
 *  modelo, y eso son tres líneas distintas del pedido. */
export function ModalProducto({ item, onCerrar }: Props) {
  const { slug } = useClienteActual();
  const { agregarItem, cambiarCantidad, cantidadDe } = usePedido(slug);
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    cerrar.current?.focus();
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [onCerrar]);

  const medidas = variantesDe(item);
  const conMedidas = tieneVariantes(item);
  // Una capa viene en 80 y 130 cm, no en talle M. Decirle "talle" a eso hace
  // dudar de si falta elegir algo más.
  const eligeMedida = medidas.some((v) => /\d\s*cm/i.test(v.etiqueta));
  const enElPedido = medidas.reduce((n, v) => n + cantidadDe(item.id, v.etiqueta), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-5"
      role="presentation"
      onClick={onCerrar}
      style={{ background: 'rgb(20 12 34 / 0.8)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-producto"
        onClick={(e) => e.stopPropagation()}
        className="hw-rise relative w-full max-w-[480px] max-h-[92dvh] overflow-y-auto halloween-sin-barra rounded-t-[18px] sm:rounded-[18px] p-2.5 pb-5"
        style={{ background: '#fff' }}
      >
        <button
          ref={cerrar}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 w-11 h-11 rounded-full border-0 text-[20px]"
          style={{ background: 'var(--h-crema)', color: 'var(--h-tinta)' }}
        >
          <span aria-hidden="true">✕</span>
        </button>

        {item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoGrande(item.fotoUrl)}
            alt={item.nombre}
            // el alto se limita para que los talles entren en la misma
            // pantalla que la foto: elegir sin ver el producto, o ver el
            // producto sin poder elegir, son el mismo viaje en dos pasos
            className="block w-full max-h-[42dvh] aspect-square object-contain rounded-[10px]"
            // blanco y no `--h-foto`: la foto ya viene con su relleno blanco
            // horneado (`scripts/fotos-halloween.ts`), y como acá se limita el
            // alto, `object-contain` deja franjas a los costados. Con el beige
            // del diseño esas franjas se ven como un marco de otro color.
            style={{ background: '#fff' }}
          />
        ) : (
          <div
            className="grid place-items-center w-full aspect-square max-h-[42dvh] rounded-[10px] text-[64px]"
            style={{ background: 'var(--h-foto)' }}
            aria-hidden="true"
          >
            🎃
          </div>
        )}

        <h2
          id="ficha-producto"
          className="halloween-mano mt-3.5 px-1.5 text-[24px] leading-[1.1]"
          style={{ color: 'var(--h-tinta)' }}
        >
          {item.nombre}
        </h2>

        {item.descripcion && (
          <p className="px-1.5 mt-1 text-[14.5px]" style={{ color: 'var(--h-tinta-suave)' }}>
            {item.descripcion}
          </p>
        )}

        {item.agotado ? (
          <p
            className="mx-1.5 mt-3 inline-block rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-wide"
            style={{ background: 'var(--h-crema)', color: 'var(--h-tinta-suave)' }}
          >
            Sin stock
          </p>
        ) : (
          <div className="mt-4 px-1.5 flex flex-col gap-2">
            {conMedidas && (
              <p
                className="halloween-mano text-[19px] leading-none"
                style={{ color: 'var(--h-tinta-suave)' }}
              >
                {eligeMedida ? 'Elegí la medida' : 'Elegí el talle'}
              </p>
            )}

            {medidas.map((v) => {
              const cantidad = cantidadDe(item.id, v.etiqueta);
              return (
                <div
                  key={v.etiqueta || 'unica'}
                  className="flex items-center gap-3 rounded-[14px] p-2 pl-3.5"
                  style={{ background: 'var(--h-crema)' }}
                >
                  <span className="flex-1 min-w-0">
                    {v.etiqueta && (
                      <span
                        className="block font-semibold text-[15px]"
                        style={{ color: 'var(--h-tinta)' }}
                      >
                        {v.etiqueta}
                      </span>
                    )}
                    <span
                      className="block font-bold text-[17px]"
                      style={{ color: v.precio > 0 ? 'var(--h-tinta)' : 'var(--h-tinta-suave)' }}
                    >
                      {v.precio > 0 ? formatearPrecio(v.precio) : 'Consultar precio'}
                    </span>
                  </span>

                  {cantidad > 0 ? (
                    <span
                      className="flex items-center justify-between gap-1 h-10 rounded-full px-1 shrink-0 text-white"
                      style={{ background: 'var(--h-naranja)' }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          cambiarCantidad(claveLinea(item.id, v.etiqueta), cantidad - 1)
                        }
                        aria-label={`Sacar uno de ${item.nombre}${v.etiqueta ? ` ${v.etiqueta}` : ''}`}
                        className="w-[34px] h-[34px] rounded-full border-0 text-[20px] font-bold leading-none text-white"
                        style={{ background: 'rgb(255 255 255 / 0.22)' }}
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                      <span className="min-w-5 text-center font-bold tabular-nums" aria-live="polite">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          chispas(e.currentTarget);
                          agregarItem(item, v.etiqueta || undefined);
                        }}
                        aria-label={`Agregar otro ${item.nombre}${v.etiqueta ? ` ${v.etiqueta}` : ''}`}
                        className="w-[34px] h-[34px] rounded-full border-0 text-[20px] font-bold leading-none text-white"
                        style={{ background: 'rgb(255 255 255 / 0.22)' }}
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        chispas(e.currentTarget, true);
                        agregarItem(item, v.etiqueta || undefined);
                      }}
                      className="shrink-0 h-11 rounded-full border-0 px-5 font-semibold text-[15px] text-white"
                      style={{ background: 'var(--h-naranja)' }}
                    >
                      + Agregar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {enElPedido > 0 && (
          <button
            type="button"
            onClick={onCerrar}
            className="mt-4 mx-1.5 w-[calc(100%-12px)] h-12 rounded-full border-2 font-semibold"
            style={{ borderColor: 'var(--h-tinta)', color: 'var(--h-tinta)' }}
          >
            Seguir mirando ({enElPedido} en el pedido)
          </button>
        )}
      </div>
    </div>
  );
}
