'use client';

import { useState } from 'react';
import { HojaPedidoHalloween } from './HojaPedidoHalloween';
import { usePedido } from '@/componentes/pedido/usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { formatearPrecio } from '@/logica/precio';
import type { ConfigPedido, Item } from '@/logica/tipos';

type Props = { items: Item[]; configPedido: ConfigPedido };

/** La barra flotante del pedido, con la forma del artboard: una píldora
 *  oscura despegada del borde, con el total a la izquierda y el botón verde
 *  de WhatsApp a la derecha.
 *
 *  Es una copia visual de `pedido/BarraPedido.tsx`, no un reemplazo: abre la
 *  hoja del pedido con el diseño de la campaña, que a su vez corre sobre
 *  `useHojaPedido()` — el mismo hook que la Clásica. Las validaciones, el
 *  total con envío y el mensaje de WhatsApp son los del motor. */
export function BarraPedidoHalloween({ items, configPedido }: Props) {
  const { slug } = useClienteActual();
  const { pedido, total } = usePedido(slug);
  const [abierta, setAbierta] = useState(false);

  if (!pedido.lineas.length) return null;

  return (
    <>
      {/* el hueco que deja la barra: sin esto tapa la última fila de tarjetas */}
      <div aria-hidden="true" className="h-[84px]" />

      <div
        className="fixed inset-x-0 bottom-0 z-30 px-3 pt-2.5 pointer-events-none"
        style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="pointer-events-auto mx-auto flex w-full max-w-[560px] items-center justify-between gap-3 rounded-full border-0 py-2 pl-5 pr-2"
          style={{
            background: 'var(--h-tinta)',
            color: 'var(--h-crema)',
            boxShadow: '0 10px 30px rgb(42 27 69 / 0.35)',
          }}
        >
          <span className="flex flex-col items-start leading-[1.1]">
            <span className="text-[13px]" style={{ color: 'var(--h-lila-medio)' }}>
              {total.unidades} {total.unidades === 1 ? 'producto' : 'productos'}
            </span>
            <span className="text-[18px] font-bold">
              {total.total > 0 ? formatearPrecio(total.total) : 'A confirmar'}
              {total.lineasSinPrecio > 0 && total.total > 0 && ' +'}
            </span>
          </span>
          <span
            className="rounded-full px-[18px] py-3 text-[15px] font-semibold"
            style={{ background: 'var(--h-whatsapp)', color: 'var(--h-whatsapp-tinta)' }}
          >
            Ver pedido
          </span>
        </button>
      </div>

      {abierta && (
        <HojaPedidoHalloween
          items={items}
          configPedido={configPedido}
          onCerrar={() => setAbierta(false)}
        />
      )}
    </>
  );
}
