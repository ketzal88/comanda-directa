'use client';

import { useEffect, useRef } from 'react';
import type { Categoria } from '@/logica/tipos';

type Props = {
  categorias: Categoria[];
  activaId: string | null;
  onIr: (categoriaId: string) => void;
};

/** El índice pegajoso: en papel se hojea, en pantalla sin esto el comensal
 *  scrollea la carta entera a ciegas. Fondo OPACO obligatorio. */
export function IndiceCategorias({ categorias, activaId, onIr }: Props) {
  const fila = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activaId) return;
    fila.current
      ?.querySelector(`[data-cat="${activaId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [activaId]);

  if (!categorias.length) return null;

  return (
    <nav
      aria-label="Secciones de la carta"
      className="sticky top-0 z-10 bg-papel border-b border-regla"
    >
      <div className="relative">
        <div
          ref={fila}
          className="flex gap-6 overflow-x-auto px-6 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categorias.map((c) => (
            <button
              key={c.id}
              data-cat={c.id}
              onClick={() => onIr(c.id)}
              aria-current={activaId === c.id ? 'true' : undefined}
              className={`shrink-0 text-[13px] tracking-[0.12em] uppercase pb-[2px] border-b ${
                activaId === c.id ? 'border-tinta' : 'border-transparent text-tinta-suave'
              }`}
            >
              {c.nombre}
            </button>
          ))}
          <span aria-hidden="true" className="shrink-0 w-2" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 desvanecido-papel"
        />
      </div>
    </nav>
  );
}
