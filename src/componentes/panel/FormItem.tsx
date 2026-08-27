'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';
import { ETIQUETAS } from '@/logica/tipos';
import type { Categoria, Etiqueta, Item, Variante } from '@/logica/tipos';

type Props = { slug: string; categorias: Categoria[]; item?: Item };

const CLASE_CAMPO =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500';
const CLASE_LABEL = 'block text-sm font-medium text-neutral-300';

/** Alta y edición de un ítem. Precio simple por defecto; "usa medidas"
 *  cambia a la lista de variantes (5 pz / 10 pz, cada una con su precio) —
 *  ver `logica/variantes.ts` para por qué conviven las dos formas. */
export function FormItem({ slug, categorias, item }: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [categoriaId, setCategoriaId] = useState(item?.categoriaId ?? categorias[0]?.id ?? '');
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '');
  const [precio, setPrecio] = useState(item?.precio ?? 0);
  const [usaMedidas, setUsaMedidas] = useState((item?.variantes?.length ?? 0) > 0);
  const [variantes, setVariantes] = useState<Variante[]>(item?.variantes ?? []);
  const [piezas, setPiezas] = useState(item?.piezas ?? '');
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(item?.etiquetas ?? []);
  const [orden, setOrden] = useState(item?.orden ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const alternarEtiqueta = (e: Etiqueta) =>
    setEtiquetas((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const agregarVariante = () => setVariantes((prev) => [...prev, { etiqueta: '', precio: 0 }]);
  const cambiarVariante = (i: number, campo: keyof Variante, valor: string) =>
    setVariantes((prev) =>
      prev.map((v, idx) =>
        idx === i ? { ...v, [campo]: campo === 'precio' ? Number(valor) || 0 : valor } : v,
      ),
    );
  const sacarVariante = (i: number) => setVariantes((prev) => prev.filter((_, idx) => idx !== i));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const datos = {
      nombre,
      categoriaId,
      descripcion: descripcion || null,
      precio: usaMedidas ? 0 : precio,
      variantes: usaMedidas ? variantes.filter((v) => v.etiqueta.trim()) : [],
      piezas: piezas === '' ? null : Number(piezas),
      etiquetas,
      orden,
    };
    try {
      if (item) await apiPanel(slug).editarItem(item.id, datos);
      else await apiPanel(slug).crearItem(datos);
      router.push(`/${slug}/panel`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  const marcar = async (campo: 'agotado' | 'activo', valor: boolean) => {
    if (!item) return;
    await apiPanel(slug).editarItem(item.id, { [campo]: valor });
    router.refresh();
  };

  return (
    <form onSubmit={guardar} className="grid gap-5">
      <label className={CLASE_LABEL}>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={CLASE_CAMPO} />
      </label>

      <label className={CLASE_LABEL}>
        Categoría
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={CLASE_CAMPO}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className={CLASE_LABEL}>
        Descripción (opcional)
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className={CLASE_CAMPO}
        />
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className={CLASE_LABEL}>
          Orden
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(Number(e.target.value) || 1)}
            className={CLASE_CAMPO}
          />
        </label>
        <label className={CLASE_LABEL}>
          Piezas (opcional)
          <input
            type="number"
            value={piezas}
            onChange={(e) => setPiezas(e.target.value === '' ? '' : Number(e.target.value))}
            className={CLASE_CAMPO}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
        <input type="checkbox" checked={usaMedidas} onChange={(e) => setUsaMedidas(e.target.checked)} />
        Se vende en más de una medida (5 pz / 10 pz, etc.)
      </label>

      {usaMedidas ? (
        <div className="grid gap-2">
          {variantes.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Medida (ej. 5 pz)"
                value={v.etiqueta}
                onChange={(e) => cambiarVariante(i, 'etiqueta', e.target.value)}
                className={CLASE_CAMPO}
              />
              <input
                type="number"
                placeholder="Precio"
                value={v.precio}
                onChange={(e) => cambiarVariante(i, 'precio', e.target.value)}
                className={CLASE_CAMPO}
              />
              <button type="button" onClick={() => sacarVariante(i)} className="px-3 text-neutral-400 hover:text-white">
                Sacar
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarVariante} className="justify-self-start text-sm text-orange-400 hover:underline">
            + Agregar medida
          </button>
        </div>
      ) : (
        <label className={CLASE_LABEL}>
          Precio
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value) || 0)}
            className={CLASE_CAMPO}
          />
        </label>
      )}

      <div>
        <p className={CLASE_LABEL}>Etiquetas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ETIQUETAS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => alternarEtiqueta(e)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                etiquetas.includes(e) ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-neutral-300'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {item && (
        <div className="flex gap-4 rounded-lg bg-white/5 p-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={item.agotado} onChange={(e) => marcar('agotado', e.target.checked)} />
            Sin stock hoy
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={item.activo} onChange={(e) => marcar('activo', e.target.checked)} />
            Visible en la carta
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={guardando || !categoriaId}
        className="justify-self-start rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-neutral-950 disabled:opacity-40"
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
