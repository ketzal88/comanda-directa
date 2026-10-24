import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarPedidosInternos } from '@/datos/panel-repo';
import { formatearPrecio } from '@/logica/precio';

export const dynamic = 'force-dynamic';

export default async function PaginaVentas({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const pedidos = await listarPedidosInternos(cliente.id);

  return (
    <PanelShell slug={slug} nombre={cliente.nombre}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <Link href={`/${slug}/panel/armar`} className="rounded bg-orange-500 px-3 py-1.5 text-sm font-semibold">
          + Nueva venta
        </Link>
      </div>

      {pedidos.length ? (
        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2 pr-3">#</th>
              <th className="pr-3">Fecha</th>
              <th className="pr-3">Comprador</th>
              <th className="pr-3">Pago</th>
              <th className="pr-3 text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="py-2 pr-3 font-semibold">#{p.numero}</td>
                <td className="pr-3 text-neutral-300">{new Date(p.creadoEn).toLocaleDateString('es-AR')}</td>
                <td className="max-w-[200px] truncate pr-3">{p.comprador || '—'}</td>
                <td className="pr-3 text-neutral-300">{p.medioPago || '—'}</td>
                <td className="pr-3 text-right">{formatearPrecio(p.total)}</td>
                <td className="text-right">
                  <Link href={`/${slug}/panel/ventas/${p.numero}/imprimir`} className="text-orange-400 hover:underline" target="_blank">
                    Imprimir ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-5 text-sm text-neutral-400">
          Todavía no cargaste ninguna venta. Tocá <strong>Nueva venta</strong> para empezar.
        </p>
      )}
    </PanelShell>
  );
}
