'use client';

import { useEffect } from 'react';

/** Botón para imprimir la comanda. Dispara el diálogo de impresión solo al
 *  abrir (la página se abre en una pestaña nueva justo para eso), y deja el
 *  botón para reimprimir. `print:hidden` lo saca del papel. */
export function BotonImprimir() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
    >
      Imprimir
    </button>
  );
}
