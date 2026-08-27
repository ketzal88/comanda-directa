'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';
import { ENCABEZADO_PLANILLA } from '@/logica/planilla';
import type { ErrorFila, ItemBorrador } from '@/logica/planilla';

/** Importador CSV: pega el texto (exportado de Excel/Sheets como CSV), lo
 *  previsualiza, y recién con "Confirmar" escribe. Ver `logica/planilla.ts`
 *  para el formato exacto de cada columna. */
export function PanelImportar({ slug }: { slug: string }) {
  const router = useRouter();
  const [csv, setCsv] = useState('');
  const [filas, setFilas] = useState<ItemBorrador[] | null>(null);
  const [errores, setErrores] = useState<ErrorFila[]>([]);
  const [importadas, setImportadas] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);

  const previsualizar = async () => {
    setCargando(true);
    setImportadas(null);
    try {
      const r = await apiPanel(slug).importar(csv, false);
      setFilas(r.filas);
      setErrores(r.errores);
    } finally {
      setCargando(false);
    }
  };

  const confirmar = async () => {
    setCargando(true);
    try {
      const r = await apiPanel(slug).importar(csv, true);
      setImportadas(r.importadas);
      setFilas(null);
      router.refresh();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Importar carta</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-300">
        Pegá el CSV con estas columnas (las categorías tienen que existir de antes, en{' '}
        <a href={`/${slug}/panel/categorias`} className="text-orange-400 underline">Categorías</a>):
      </p>
      <code className="mt-2 block overflow-x-auto rounded-lg bg-white/5 p-3 text-xs text-neutral-300">
        {ENCABEZADO_PLANILLA}
      </code>

      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={10}
        placeholder="categoria,subcategoria,nombre,descripcion,piezas,precio,variantes,etiquetas"
        className="mt-4 w-full rounded-lg border border-white/15 bg-neutral-900 p-3 font-mono text-sm outline-none focus:border-orange-500"
      />

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={previsualizar}
          disabled={cargando || !csv.trim()}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Previsualizar
        </button>
        {filas && !errores.length && (
          <button
            type="button"
            onClick={confirmar}
            disabled={cargando || !filas.length}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-40"
          >
            Confirmar importación ({filas.length})
          </button>
        )}
      </div>

      {importadas != null && (
        <p className="mt-4 text-sm text-green-400">Se importaron {importadas} ítems.</p>
      )}

      {errores.length > 0 && (
        <div className="mt-4 rounded-lg bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-300">{errores.length} error(es):</p>
          <ul className="mt-2 grid gap-1 text-sm text-red-200">
            {errores.map((e, i) => (
              <li key={i}>
                Fila {e.fila}, {e.campo}: {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {filas && !errores.length && (
        <p className="mt-4 text-sm text-neutral-300">{filas.length} filas listas para importar.</p>
      )}
    </div>
  );
}
