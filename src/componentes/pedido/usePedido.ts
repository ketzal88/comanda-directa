'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { escribir, leer, leerEnServidor, suscribir } from '@/datos/pedido-almacen';
import {
  PEDIDO_VACIO,
  agregar,
  cambiarCantidad,
  claveLinea,
  lineaDeCubierto,
  lineaDeItem,
  quitar,
  sinCubierto,
  sincronizarPedido,
  totalizar,
} from '@/logica/pedido';
import type { Item } from '@/logica/tipos';

/** El pedido, conectado a la carta de un cliente puntual (`slug`).
 *  `useSyncExternalStore` y no `useState` porque el pedido vive fuera de
 *  React, en `datos/pedido-almacen.ts`. */
export function usePedido(slug: string) {
  const suscribirSlug = useCallback((oyente: () => void) => suscribir(slug, oyente), [slug]);
  const leerSlug = useCallback(() => leer(slug), [slug]);
  const pedido = useSyncExternalStore(suscribirSlug, leerSlug, leerEnServidor);
  const total = totalizar(pedido);

  return {
    pedido,
    total,

    agregarItem(item: Item, variante?: string) {
      const linea = lineaDeItem(item, variante);
      if (linea) escribir(slug, agregar(pedido, linea));
    },

    agregarCubierto(precioPorPersona: number) {
      const linea = lineaDeCubierto(precioPorPersona);
      if (linea) escribir(slug, agregar(pedido, linea));
    },

    sacarCubierto() {
      escribir(slug, sinCubierto(pedido));
    },

    cambiarCantidad(clave: string, cantidad: number) {
      escribir(slug, cambiarCantidad(pedido, clave, cantidad));
    },

    quitar(clave: string) {
      escribir(slug, quitar(pedido, clave));
    },

    vaciar() {
      escribir(slug, PEDIDO_VACIO);
    },

    cantidadDe(itemId: string, variante?: string): number {
      const clave = claveLinea(itemId, variante);
      return pedido.lineas.find((l) => l.clave === clave)?.cantidad ?? 0;
    },
  };
}

/** Pone el pedido guardado al día con la carta (`sincronizarPedido`) cada vez
 *  que llega una carta nueva. Va una sola vez por página, en la plantilla. */
export function useSincronizarPedido(slug: string, items: Item[]) {
  const { pedido } = usePedido(slug);
  useEffect(() => {
    const aldia = sincronizarPedido(pedido, items);
    if (aldia !== pedido) escribir(slug, aldia);
  }, [slug, items, pedido]);
}
