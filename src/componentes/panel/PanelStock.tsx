'use client';

import { useMemo, useState } from 'react';
import { apiPanel } from './api';
import { formatearPrecio } from '@/logica/precio';
import {
  ETIQUETA_TIPO_STOCK,
  TIPOS_STOCK,
  cuotasDeTarjeta,
  efectivoDeCosto,
  efectivoDeTarjeta,
  tarjetaDeEfectivo,
  type TipoStock,
} from '@/logica/precios-admin';
import type { Item } from '@/logica/tipos';

const INPUT = 'w-20 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white';

type Fila = { costo: number; margen: number; tipoStock: TipoStock; stock: string };

/** Admin de precios y stock: costo mayorista + margen → efectivo/tarjeta/cuotas,
 *  más el stock por tipo (propio, consignación, a pedido). Guarda fila por fila;
 *  al guardar un costo, la web toma el precio de lista recalculado. */
export function PanelStock({
  slug,
  items,
  recargoCuotas,
}: {
  slug: string;
  items: Item[];
  recargoCuotas: number;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filas, setFilas] = useState<Record<string, Fila>>(() =>
    Object.fromEntries(
      items.map((i) => [
        i.id,
        {
          costo: i.costo ?? 0,
          margen: i.margen ?? 0,
          tipoStock: i.tipoStock ?? 'propio',
          stock: i.stock == null ? '' : String(i.stock),
        },
      ]),
    ),
  );
  const [estado, setEstado] = useState<Record<string, 'guardando' | 'ok' | string>>({});

  const ordenados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return [...items]
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .filter((i) => !q || i.nombre.toLowerCase().includes(q));
  }, [items, busqueda]);

  const set = (id: string, campo: keyof Fila, valor: string) =>
    setFilas((f) => ({ ...f, [id]: { ...f[id], [campo]: campo === 'tipoStock' ? (valor as TipoStock) : campo === 'stock' ? valor : Number(valor) || 0 } }));

  const precios = (item: Item, fila: Fila) => {
    const tarjeta = fila.costo > 0 ? tarjetaDeEfectivo(efectivoDeCosto(fila.costo, fila.margen)) : item.precio;
    const efectivo = fila.costo > 0 ? efectivoDeCosto(fila.costo, fila.margen) : efectivoDeTarjeta(item.precio);
    return { efectivo, tarjeta, cuotas: cuotasDeTarjeta(tarjeta, recargoCuotas) };
  };

  const guardar = async (item: Item) => {
    const fila = filas[item.id];
    setEstado((s) => ({ ...s, [item.id]: 'guardando' }));
    try {
      await apiPanel(slug).guardarStock({
        itemId: item.id,
        costo: fila.costo,
        margen: fila.margen,
        tipoStock: fila.tipoStock,
        stock: fila.stock === '' ? null : Number(fila.stock) || 0,
      });
      setEstado((s) => ({ ...s, [item.id]: 'ok' }));
    } catch (e) {
      setEstado((s) => ({ ...s, [item.id]: (e as Error).message }));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Stock y precios</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Cargá el costo del mayorista y el margen: el efectivo, la tarjeta y las cuotas se calculan
        solos, y la web toma el precio recalculado. El stock vive acá (ya no en el Excel).
      </p>

      <input
        className="mt-4 w-full max-w-sm rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500"
        placeholder="Buscar producto…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2 pr-3">Producto</th>
              <th className="px-2">Costo</th>
              <th className="px-2">Margen %</th>
              <th className="px-2">Efectivo</th>
              <th className="px-2">Tarjeta</th>
              <th className="px-2">Cuotas</th>
              <th className="px-2">Tipo</th>
              <th className="px-2">Stock</th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((item) => {
              const fila = filas[item.id];
              const p = precios(item, fila);
              const st = estado[item.id];
              return (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="max-w-[220px] truncate py-2 pr-3">{item.nombre}</td>
                  <td className="px-2"><input className={INPUT} inputMode="numeric" value={fila.costo || ''} onChange={(e) => set(item.id, 'costo', e.target.value)} /></td>
                  <td className="px-2"><input className="w-14 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm" inputMode="numeric" value={fila.margen || ''} onChange={(e) => set(item.id, 'margen', e.target.value)} /></td>
                  <td className="px-2 text-neutral-300">{formatearPrecio(p.efectivo)}</td>
                  <td className="px-2 text-neutral-300">{formatearPrecio(p.tarjeta)}</td>
                  <td className="px-2 text-neutral-300">{formatearPrecio(p.cuotas)}</td>
                  <td className="px-2">
                    <select className="rounded border border-white/15 bg-white/5 px-2 py-1 text-sm" value={fila.tipoStock} onChange={(e) => set(item.id, 'tipoStock', e.target.value)}>
                      {TIPOS_STOCK.map((t) => <option key={t} value={t} className="bg-neutral-900">{ETIQUETA_TIPO_STOCK[t]}</option>)}
                    </select>
                  </td>
                  <td className="px-2">
                    <input className="w-16 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm" inputMode="numeric" placeholder="∞" value={fila.stock} onChange={(e) => set(item.id, 'stock', e.target.value)} disabled={fila.tipoStock === 'a_pedido'} />
                  </td>
                  <td className="px-2">
                    <button type="button" onClick={() => guardar(item)} className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
                      {st === 'guardando' ? '…' : st === 'ok' ? '✓' : 'Guardar'}
                    </button>
                    {st && st !== 'guardando' && st !== 'ok' && <span className="ml-2 text-xs text-red-400">{st}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
