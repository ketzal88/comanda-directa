import { notFound } from 'next/navigation';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelPedido } from '@/componentes/panel/PanelPedido';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { configPedidoDe } from '@/logica/tipos';

export const dynamic = 'force-dynamic';

export default async function PaginaPedido({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  return (
    <PanelShell slug={slug} nombre={cliente.nombre}>
      <PanelPedido
        slug={slug}
        configPedido={configPedidoDe(cliente)}
        cubiertoPorPersona={cliente.cubiertoPorPersona}
        notas={cliente.notas}
      />
    </PanelShell>
  );
}
