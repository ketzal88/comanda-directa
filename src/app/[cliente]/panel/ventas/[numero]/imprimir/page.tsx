import { notFound } from 'next/navigation';
import { BotonImprimir } from '@/componentes/panel/BotonImprimir';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { leerPedidoInterno } from '@/datos/panel-repo';
import { formatearPrecio } from '@/logica/precio';

export const dynamic = 'force-dynamic';

const MEDIOS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  cuotas: 'Cuotas',
};

export default async function PaginaImprimir({
  params,
}: {
  params: Promise<{ cliente: string; numero: string }>;
}) {
  const { cliente: slug, numero } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const pedido = await leerPedidoInterno(cliente.id, Number(numero));
  if (!pedido) notFound();

  const fecha = pedido.creadoEn
    ? new Date(pedido.creadoEn).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    : '';

  return (
    <div className="min-h-dvh bg-neutral-100 p-6 text-black">
      <div className="mx-auto max-w-[360px]">
        <div className="mb-4 flex justify-end">
          <BotonImprimir />
        </div>

        <div className="rounded-lg bg-white p-6 shadow print:rounded-none print:shadow-none">
          <div className="text-center">
            <div className="text-lg font-bold uppercase tracking-wide">{cliente.nombre}</div>
            <div className="mt-1 text-sm text-neutral-600">Comanda · Pedido #{pedido.numero}</div>
            {fecha && <div className="text-xs text-neutral-500">{fecha}</div>}
          </div>

          <div className="my-4 border-t border-dashed border-neutral-300" />

          <dl className="space-y-1 text-sm">
            {pedido.comprador && (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Comprador</dt>
                <dd className="text-right font-medium">{pedido.comprador}</dd>
              </div>
            )}
            {pedido.telefono && (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Teléfono</dt>
                <dd className="text-right">{pedido.telefono}</dd>
              </div>
            )}
            {pedido.medioPago && (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Pago</dt>
                <dd className="text-right">{MEDIOS[pedido.medioPago] ?? pedido.medioPago}</dd>
              </div>
            )}
          </dl>

          <div className="my-4 border-t border-dashed border-neutral-300" />

          <table className="w-full text-sm">
            <tbody>
              {pedido.lineas.map((l, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1 pr-2">
                    {l.cantidad} × {l.nombre}
                    {l.variante ? <span className="text-neutral-500"> · {l.variante}</span> : null}
                  </td>
                  <td className="py-1 text-right whitespace-nowrap">
                    {formatearPrecio(l.precioUnitario * l.cantidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="my-3 border-t border-neutral-400" />

          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatearPrecio(pedido.total)}</span>
          </div>

          {pedido.nota && (
            <>
              <div className="my-3 border-t border-dashed border-neutral-300" />
              <div className="text-sm">
                <div className="text-neutral-500">Nota</div>
                <div>{pedido.nota}</div>
              </div>
            </>
          )}

          <div className="mt-5 text-center text-xs text-neutral-400">¡Gracias por tu compra! ♥</div>
        </div>
      </div>
    </div>
  );
}
