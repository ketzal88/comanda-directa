'use client';

import { useState } from 'react';
import { HojaPedido } from './HojaPedido';
import { usePedido } from './usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { formatearPrecio } from '@/logica/precio';
import type { ConfigPedido, Item } from '@/logica/tipos';

type Props = {
  items: Item[];
  /** ENTERO en pesos; 0 = sin cargar y la hoja no ofrece cubierto */
  cubiertoPorPersona: number;
  configPedido: ConfigPedido;
};

/** La barra fija con el pedido. Aparece recién cuando hay algo cargado. */
export function BarraPedido({ items, cubiertoPorPersona, configPedido }: Props) {
  const { slug } = useClienteActual();
  const { pedido, total } = usePedido(slug);
  const [abierta, setAbierta] = useState(false);

  if (!pedido.lineas.length) return null;

  return (
    <>
      <div aria-hidden="true" className="h-20" />

      <div className="fixed bottom-0 inset-x-0 z-10 bg-papel border-t border-tinta">
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="columna-carta flex items-baseline justify-between gap-4 w-full px-6 py-4 text-left active:opacity-60"
        >
          <span>
            <span className="metadata-item block">
              {total.unidades} {total.unidades === 1 ? 'ítem' : 'ítems'}
            </span>
            <span className="nombre-item block">
              {total.total > 0 ? formatearPrecio(total.total) : 'Total a confirmar'}
            </span>
          </span>
          <span className="text-[13px] tracking-[0.14em] uppercase border-b border-tinta pb-[2px] shrink-0">
            Ver pedido
          </span>
        </button>
      </div>

      {abierta && (
        <HojaPedido
          items={items}
          cubiertoPorPersona={cubiertoPorPersona}
          configPedido={configPedido}
          onCerrar={() => setAbierta(false)}
        />
      )}
    </>
  );
}
