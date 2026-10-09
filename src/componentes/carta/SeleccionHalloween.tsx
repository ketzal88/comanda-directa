'use client';

import { useMemo, useState } from 'react';
import { BarraPedidoHalloween } from './halloween/BarraPedidoHalloween';
import { ModalProducto } from './halloween/ModalProducto';
import { CLASES_FUENTES } from './halloween/tipografia';
import { useClienteActual } from '@/componentes/ClienteContext';
import { fijarVencimiento } from '@/datos/pedido-almacen';
import { usePedido, useSincronizarPedido } from '@/componentes/pedido/usePedido';
import { lineasDeOpcion, type Seleccion } from '@/clientes/selecciones';
import { precioConDescuentoPago } from '@/logica/cuenta';
import { lineaDeItem, type LineaPedido } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import type { Carta, ConfigPedido, Descuento, Item } from '@/logica/tipos';

type Props = { seleccion: Seleccion; carta: Carta; configPedido: ConfigPedido };

const VENCE_PEDIDO_MS = 7 * 24 * 60 * 60 * 1000;
const COLORES = ['var(--h-lila)', 'var(--h-durazno)', 'var(--h-menta)'];

/** Una selección armada para un comprador (`clientes/selecciones.ts`), con la
 *  ropa de la plantilla halloween: sólo esos productos, en sus cantidades,
 *  separados por opción. "Quiero la opción B" deja el pedido con todo lo de
 *  esa opción y el resto (cantidades, datos, WhatsApp) es la hoja de siempre.
 *
 *  Precio y foto salen de la carta: la selección sólo dice qué y cuánto. Un
 *  producto que ya no está en la carta no se muestra ni se suma (la prueba
 *  avisa antes de que pase). */
export function SeleccionHalloween({ seleccion, carta, configPedido }: Props) {
  const { slug, nombre } = useClienteActual();
  fijarVencimiento(slug, VENCE_PEDIDO_MS);
  useSincronizarPedido(slug, carta.items);
  const { pedido, reemplazar } = usePedido(slug);
  const [abierto, setAbierto] = useState<Item | null>(null);

  const porNombre = useMemo(
    () => new Map(carta.items.filter((i) => i.activo).map((i) => [i.nombre, i])),
    [carta.items],
  );
  const d = configPedido.descuentosPago.efectivo;
  const efectivo: Descuento = configPedido.mediosDePago.includes('efectivo') && d ? d : { tipo: 'ninguno' };

  const lineasPedido = (letra: string): LineaPedido[] =>
    lineasDeOpcion(seleccion, letra).flatMap(({ producto, cantidad }) => {
      const item = porNombre.get(producto);
      const linea = item ? lineaDeItem(item) : null;
      return linea ? [{ ...linea, cantidad }] : [];
    });

  const totales = (letra: string) => {
    const lineas = lineasPedido(letra);
    return {
      tarjeta: lineas.reduce((t, l) => t + l.precioUnitario * l.cantidad, 0),
      efectivo: lineas.reduce((t, l) => t + precioConDescuentoPago(l.precioUnitario, efectivo) * l.cantidad, 0),
      unidades: lineas.reduce((t, l) => t + l.cantidad, 0),
    };
  };

  // Cuál opción está hoy en el pedido: la que coincide línea por línea.
  const huella = (lineas: LineaPedido[]) =>
    lineas.map((l) => `${l.clave}×${l.cantidad}`).sort().join('|');
  const enElPedido = seleccion.opciones.find(
    (o) => huella(lineasPedido(o.letra)) === huella(pedido.lineas),
  )?.letra;

  return (
    <div className={`halloween ${CLASES_FUENTES} min-h-dvh overflow-x-hidden`}>
      <header className="max-w-[900px] mx-auto px-5 pt-8 pb-2 text-center">
        <div className="text-[15px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--h-tinta-suave)' }}>
          {nombre}
        </div>
        <h1
          className="halloween-mano mt-2 leading-[1.05] text-[clamp(34px,9vw,52px)]"
          style={{ color: 'var(--h-naranja)' }}
        >
          {seleccion.titulo}
        </h1>
        {seleccion.bajada && (
          <p className="mx-auto mt-3 max-w-[520px] text-[16px] leading-[1.4] text-pretty" style={{ color: 'var(--h-tinta-suave)' }}>
            {seleccion.bajada}
          </p>
        )}
      </header>

      <main className="max-w-[900px] mx-auto px-4 pb-10">
        {seleccion.opciones.map((opcion, i) => {
          const t = totales(opcion.letra);
          const elegida = enElPedido === opcion.letra;
          const suma = seleccion.acumulativas && i > 0;
          return (
            <section key={opcion.letra} className="pt-8" aria-labelledby={`opcion-${opcion.letra}`}>
              <div
                className="rounded-[18px] p-4"
                style={{ background: COLORES[i % 3], border: '2px solid var(--h-tinta)' }}
              >
                <h2 id={`opcion-${opcion.letra}`} className="halloween-mano m-0 text-[clamp(26px,7vw,34px)] leading-[1.1]">
                  Opción {opcion.letra} · {opcion.nombre}
                </h2>
                {suma && (
                  <p className="mt-1 text-[14px] font-semibold">
                    Todo lo de la opción {seleccion.opciones[i - 1].letra}, más lo de abajo.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[24px] font-bold leading-none">{formatearPrecio(t.tarjeta)}</div>
                    {t.efectivo > 0 && t.efectivo < t.tarjeta && (
                      <div className="mt-1 text-[14px]">{formatearPrecio(t.efectivo)} en efectivo o transferencia</div>
                    )}
                    <div className="mt-1 text-[13px]" style={{ color: 'var(--h-tinta-suave)' }}>
                      {t.unidades} productos en total
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => reemplazar(lineasPedido(opcion.letra))}
                    aria-pressed={elegida}
                    className="rounded-full border-2 px-5 py-3 text-[15px] font-semibold"
                    style={{
                      borderColor: 'var(--h-tinta)',
                      background: elegida ? 'var(--h-tinta)' : 'var(--h-naranja)',
                      color: elegida ? 'var(--h-crema)' : '#fff',
                    }}
                  >
                    {elegida ? `Opción ${opcion.letra} en el pedido ✓` : `Quiero la opción ${opcion.letra}`}
                  </button>
                </div>
              </div>

              <ul className="mt-3 flex flex-col gap-2">
                {opcion.lineas.map((l) => {
                  const item = porNombre.get(l.producto);
                  if (!item) return null;
                  return (
                    <li key={l.producto}>
                      <button
                        type="button"
                        onClick={() => setAbierto(item)}
                        className="flex w-full items-center gap-3 rounded-[14px] bg-white p-2 text-left"
                      >
                        <span
                          className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[10px]"
                          style={{ background: 'var(--h-foto)' }}
                        >
                          {item.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.fotoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <span aria-hidden="true" className="text-[26px]">
                              🎃
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-medium leading-[1.2]">
                            {l.cantidad > 1 && <span className="font-bold">{l.cantidad} × </span>}
                            {item.nombre}
                          </span>
                          {l.nota && (
                            <span className="mt-0.5 block text-[13px]" style={{ color: 'var(--h-tinta-suave)' }}>
                              {l.nota}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 pr-1 text-right">
                          <span className="block text-[15px] font-bold">{formatearPrecio(item.precio * l.cantidad)}</span>
                          {l.cantidad > 1 && (
                            <span className="block text-[12px]" style={{ color: 'var(--h-tinta-suave)' }}>
                              {formatearPrecio(item.precio)} c/u
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="mt-8 text-center text-[13.5px] leading-[1.4]" style={{ color: 'var(--h-tinta-suave)' }}>
          Precios con tarjeta. Los productos a pedido tardan de 7 a 10 días: encargá hasta el 17/10 para
          tenerlos antes de Halloween.
        </p>
        <p className="mt-4 text-center">
          <a href={`/${slug}`} className="text-[15px] font-semibold underline underline-offset-2" style={{ color: 'var(--h-tinta)' }}>
            Ver el catálogo completo
          </a>
        </p>
      </main>

      {abierto && <ModalProducto item={abierto} onCerrar={() => setAbierto(null)} />}
      <BarraPedidoHalloween items={carta.items.filter((i) => i.activo)} configPedido={configPedido} />
    </div>
  );
}
