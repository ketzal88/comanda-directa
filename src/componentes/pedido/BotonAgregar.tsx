'use client';

import { usePedido } from './usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import type { Item } from '@/logica/tipos';

/** El "+" de cada fila. Vacío es un círculo de contorno; con algo cargado se
 *  invierte y muestra la cantidad. Restar y sacar se hacen en la hoja.
 *
 *  Un ítem sin stock no se agrega. `variante` es la medida que suma este
 *  botón: un plato con dos medidas tiene dos botones, cada uno con su propia
 *  cuenta. */
export function BotonAgregar({ item, variante }: { item: Item; variante?: string }) {
  const { slug } = useClienteActual();
  const { agregarItem, cantidadDe } = usePedido(slug);
  if (item.agotado) return null;

  const cantidad = cantidadDe(item.id, variante);
  const nombrado = variante ? `${item.nombre}, ${variante}` : item.nombre;

  return (
    <button
      type="button"
      onClick={() => agregarItem(item, variante)}
      aria-label={
        cantidad > 0
          ? `${nombrado}: ${cantidad} en el pedido. Agregar otro`
          : `Agregar ${nombrado} al pedido`
      }
      className={`relative shrink-0 self-center w-8 h-8 rounded-full border text-[15px] leading-none tabular-nums transition-colors active:opacity-60 before:absolute before:-inset-[6px] before:content-[''] ${
        cantidad > 0 ? 'bg-tinta text-papel border-tinta' : 'border-tinta-suave text-tinta'
      }`}
    >
      <span aria-hidden="true">{cantidad > 0 ? cantidad : '+'}</span>
    </button>
  );
}
