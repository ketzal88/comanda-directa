'use client';

import { createContext, useContext } from 'react';

type ClienteContexto = { slug: string; nombre: string };

const Contexto = createContext<ClienteContexto | null>(null);

/** Evita pasar `slug`/`nombre` a mano por cada componente de la carta y el
 *  pedido: lo necesitan piezas hondas del árbol (BotonAgregar, HojaPedido)
 *  que ni siquiera saben en qué carta están montadas. */
export function ProveedorCliente({
  slug,
  nombre,
  children,
}: ClienteContexto & { children: React.ReactNode }) {
  return <Contexto.Provider value={{ slug, nombre }}>{children}</Contexto.Provider>;
}

export function useClienteActual(): ClienteContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useClienteActual() usado fuera de <ProveedorCliente>');
  return ctx;
}
