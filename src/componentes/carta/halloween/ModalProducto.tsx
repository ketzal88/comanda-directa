'use client';

import { useEffect, useRef } from 'react';
import { Calabaza } from './Adornos';
import { fotoGrande } from './fotos';
import { usePedido } from '@/componentes/pedido/usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { claveLinea } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import { VARIANTE_UNICA, tieneVariantes, variantesDe } from '@/logica/variantes';
import type { Item } from '@/logica/tipos';

type Props = { item: Item; onCerrar: () => void };

/** La ficha del producto: la foto grande, lo que trae, y los talles con su
 *  precio y su cantidad.
 *
 *  Existe porque en un catálogo de cotillón la foto ES la decisión de compra
 *  —nadie elige una "Bruja Misteriosa" de $64.800 por el nombre— y porque el
 *  talle hay que poder elegirlo mirando la prenda, no de memoria desde una
 *  fila de 44px.
 *
 *  Cada talle lleva su propio contador: quien compra disfraces para una
 *  fiesta se lleva dos M y una S del mismo modelo, y eso son tres líneas
 *  distintas del pedido (`logica/pedido.ts` las separa por variante). */
export function ModalProducto({ item, onCerrar }: Props) {
  const { slug } = useClienteActual();
  const { agregarItem, cambiarCantidad, cantidadDe } = usePedido(slug);
  const hoja = useRef<HTMLDivElement>(null);
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
      className="halloween fixed inset-0 z-40 flex items-end sm:items-center justify-center"
      role="presentation"
      onClick={onCerrar}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'rgb(30 12 48 / 0.62)' }}
      />

      <div
        ref={hoja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-producto"
        onClick={(e) => e.stopPropagation()}
        className="h-modal-entra relative w-full max-w-[430px] max-h-[92dvh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] border-2 border-b-0 sm:border-b-2 px-5 pt-5 pb-8"
        style={{ background: 'var(--h-crema)', borderColor: 'var(--h-violeta)' }}
      >
        <button
          ref={cerrar}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full border-2 text-[18px] leading-none font-bold"
          style={{
            background: 'var(--h-papel)',
            borderColor: 'var(--h-violeta)',
            color: 'var(--h-violeta)',
          }}
        >
          <span aria-hidden="true">×</span>
        </button>

        {item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoGrande(item.fotoUrl)}
            alt={item.nombre}
            // el alto se limita para que los talles entren en la misma
            // pantalla que la foto: elegir sin ver el producto, o ver el
            // producto sin poder elegir, son el mismo viaje en dos pasos
            className="w-full max-h-[44dvh] aspect-square object-contain rounded-[18px] border-2"
            style={{ background: 'var(--h-papel)', borderColor: 'var(--h-violeta)' }}
          />
        ) : (
          <div
            className="w-full max-h-[44dvh] aspect-square rounded-[18px] border-2 grid place-items-center"
            style={{ background: 'var(--h-papel)', borderColor: 'var(--h-violeta)' }}
          >
            <Calabaza className="w-20 h-flota text-[color:var(--h-naranja)]" />
          </div>
        )}

        <h2
          id="titulo-producto"
          className="mt-4 text-[22px] font-extrabold leading-tight"
          style={{ color: 'var(--h-violeta)' }}
        >
          {item.nombre}
        </h2>

        {item.descripcion && (
          <p className="mt-1 text-[15px]" style={{ color: 'var(--h-violeta-medio)' }}>
            {item.descripcion}
          </p>
        )}

        {item.agotado && (
          <p
            className="mt-3 inline-block rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-wide"
            style={{ background: 'var(--h-lila)', color: 'var(--h-violeta)' }}
          >
            Sin stock
          </p>
        )}

        {!item.agotado && (
          <div className="mt-5 space-y-2">
            {conMedidas && (
              <p
                className="text-[13px] font-bold uppercase tracking-[0.1em]"
                style={{ color: 'var(--h-violeta-medio)' }}
              >
                {eligeMedida ? 'Elegí la medida' : 'Elegí el talle'}
              </p>
            )}

            {medidas.map((v) => {
              const cantidad = cantidadDe(item.id, v.etiqueta || VARIANTE_UNICA);
              return (
                <div
                  key={v.etiqueta || 'unica'}
                  className="flex items-center gap-3 rounded-[16px] border-2 px-3 py-2"
                  style={{
                    background: 'var(--h-papel)',
                    borderColor: cantidad > 0 ? 'var(--h-naranja)' : 'var(--h-violeta)',
                  }}
                >
                  <span className="flex-1 min-w-0">
                    {v.etiqueta && (
                      <span className="block font-bold" style={{ color: 'var(--h-violeta)' }}>
                        {v.etiqueta}
                      </span>
                    )}
                    <span
                      className="block text-[15px] font-extrabold"
                      style={{ color: v.precio > 0 ? 'var(--h-naranja)' : 'var(--h-violeta-medio)' }}
                    >
                      {v.precio > 0 ? formatearPrecio(v.precio) : 'A confirmar'}
                    </span>
                  </span>

                  {cantidad > 0 ? (
                    <span className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          // la clave la arma `logica/pedido.ts`: repetir el
                          // formato acá es el bug que aparece el día que cambie
                          cambiarCantidad(claveLinea(item.id, v.etiqueta), cantidad - 1)
                        }
                        aria-label={`Sacar uno de ${item.nombre}${v.etiqueta ? ` ${v.etiqueta}` : ''}`}
                        className="w-9 h-9 rounded-full border-2 font-bold text-[18px] leading-none"
                        style={{ borderColor: 'var(--h-violeta)', color: 'var(--h-violeta)' }}
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                      <span
                        className="w-5 text-center font-extrabold tabular-nums"
                        aria-live="polite"
                        style={{ color: 'var(--h-violeta)' }}
                      >
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => agregarItem(item, v.etiqueta || undefined)}
                        aria-label={`Agregar otro ${item.nombre}${v.etiqueta ? ` ${v.etiqueta}` : ''}`}
                        className="halloween-boton w-9 h-9 text-[18px] leading-none"
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => agregarItem(item, v.etiqueta || undefined)}
                      className="halloween-boton shrink-0 px-4 py-2 text-[14px] uppercase tracking-wide"
                    >
                      Agregar
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
            className="mt-5 w-full rounded-[16px] border-2 py-3 font-bold"
            style={{
              background: 'var(--h-lila-suave)',
              borderColor: 'var(--h-violeta)',
              color: 'var(--h-violeta)',
            }}
          >
            Seguir mirando ({enElPedido} en el pedido)
          </button>
        )}
      </div>
    </div>
  );
}
