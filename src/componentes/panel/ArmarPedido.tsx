'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';
import { cuotasDeTarjeta, efectivoDeTarjeta } from '@/logica/precios-admin';
import { formatearPrecio } from '@/logica/precio';
import type { Item } from '@/logica/tipos';

type Medio = 'efectivo' | 'transferencia' | 'tarjeta' | 'cuotas';
const MEDIOS: { valor: Medio; etiqueta: string }[] = [
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
  { valor: 'cuotas', etiqueta: 'Cuotas' },
];

const INPUT = 'rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500';

/** El precio de un producto según el medio de pago elegido. La base guardada
 *  es el de tarjeta; el resto se deriva (igual que la carta). */
function precioSegunMedio(item: Item, medio: Medio, recargoCuotas: number): number {
  const tarjeta = item.precio;
  if (medio === 'tarjeta') return tarjeta;
  if (medio === 'cuotas') return cuotasDeTarjeta(tarjeta, recargoCuotas);
  return efectivoDeTarjeta(tarjeta); // efectivo y transferencia
}

export function ArmarPedido({
  slug,
  items,
  recargoCuotas,
}: {
  slug: string;
  items: Item[];
  recargoCuotas: number;
}) {
  const router = useRouter();
  const [medio, setMedio] = useState<Medio>('efectivo');
  const [busqueda, setBusqueda] = useState('');
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [comprador, setComprador] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const vendibles = useMemo(
    () => items.filter((i) => i.activo && i.precio > 0).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [items],
  );
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? vendibles.filter((i) => i.nombre.toLowerCase().includes(q)) : vendibles;
  }, [vendibles, busqueda]);

  const cambiar = (id: string, delta: number) =>
    setCantidades((c) => {
      const n = Math.max(0, (c[id] ?? 0) + delta);
      const resto = { ...c };
      delete resto[id];
      return n > 0 ? { ...resto, [id]: n } : resto;
    });

  const lineas = useMemo(
    () =>
      Object.entries(cantidades)
        .map(([id, cant]) => {
          const item = vendibles.find((i) => i.id === id);
          if (!item) return null;
          return {
            itemId: id,
            nombre: item.nombre,
            variante: '',
            precioUnitario: precioSegunMedio(item, medio, recargoCuotas),
            cantidad: cant,
            item,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l != null),
    [cantidades, vendibles, medio, recargoCuotas],
  );
  const total = lineas.reduce((t, l) => t + l.precioUnitario * l.cantidad, 0);
  const unidades = lineas.reduce((t, l) => t + l.cantidad, 0);

  const crear = async () => {
    if (!lineas.length) {
      setError('Agregá al menos un producto.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const { pedido } = await apiPanel(slug).crearPedido({
        comprador,
        telefono,
        nota,
        medioPago: medio,
        lineas: lineas.map((l) => ({
          itemId: l.itemId,
          nombre: l.nombre,
          variante: l.variante,
          precioUnitario: l.precioUnitario,
          cantidad: l.cantidad,
        })),
      });
      router.push(`/${slug}/panel/ventas/${pedido.numero}/imprimir`);
    } catch (e) {
      setError((e as Error).message);
      setGuardando(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section>
        <h1 className="text-2xl font-semibold">Armar venta</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Elegí el medio de pago, sumá productos y creá la venta. Descuenta stock e imprime la comanda.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {MEDIOS.map((m) => (
            <button
              key={m.valor}
              type="button"
              onClick={() => setMedio(m.valor)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                medio === m.valor ? 'bg-orange-500 text-white' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {m.etiqueta}
            </button>
          ))}
        </div>

        <input
          className={`${INPUT} mt-4 w-full`}
          placeholder="Buscar producto…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <ul className="mt-3 max-h-[52vh] divide-y divide-white/5 overflow-y-auto rounded border border-white/10">
          {filtrados.map((item) => {
            const precio = precioSegunMedio(item, medio, recargoCuotas);
            const sinStock = item.stock != null && item.stock <= 0 && item.tipoStock !== 'a_pedido';
            const cant = cantidades[item.id] ?? 0;
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{item.nombre}</div>
                  <div className="text-xs text-neutral-400">
                    {formatearPrecio(precio)}
                    {item.stock != null && (
                      <span className={sinStock ? 'text-red-400' : ''}> · stock {item.stock}</span>
                    )}
                    {item.tipoStock === 'a_pedido' && <span> · a pedido</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => cambiar(item.id, -1)} className="h-7 w-7 rounded bg-white/10 text-lg leading-none">−</button>
                  <span className="w-6 text-center text-sm">{cant}</span>
                  <button type="button" onClick={() => cambiar(item.id, 1)} className="h-7 w-7 rounded bg-white/10 text-lg leading-none">+</button>
                </div>
              </li>
            );
          })}
          {!filtrados.length && <li className="px-3 py-4 text-sm text-neutral-500">Sin resultados.</li>}
        </ul>
      </section>

      <aside className="h-max rounded border border-white/10 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Venta</h2>
        {lineas.length ? (
          <ul className="mt-3 space-y-1.5 text-sm">
            {lineas.map((l) => (
              <li key={l.itemId} className="flex justify-between gap-2">
                <span className="truncate">{l.cantidad} × {l.nombre}</span>
                <span className="shrink-0">{formatearPrecio(l.precioUnitario * l.cantidad)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Todavía no agregaste nada.</p>
        )}
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
          <span>Total ({unidades})</span>
          <span>{formatearPrecio(total)}</span>
        </div>

        <div className="mt-4 grid gap-2">
          <input className={INPUT} placeholder="Nombre del comprador" value={comprador} onChange={(e) => setComprador(e.target.value)} />
          <input className={INPUT} placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <textarea className={INPUT} placeholder="Nota (opcional)" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={crear}
          disabled={guardando || !lineas.length}
          className="mt-4 w-full rounded bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {guardando ? 'Creando…' : 'Crear venta e imprimir'}
        </button>
      </aside>
    </div>
  );
}
