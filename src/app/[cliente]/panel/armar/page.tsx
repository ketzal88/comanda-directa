import { notFound } from 'next/navigation';
import { ArmarPedido } from '@/componentes/panel/ArmarPedido';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarItemsPanel } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaArmar({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const items = await listarItemsPanel(cliente.id);

  return (
    <PanelShell slug={slug} nombre={cliente.nombre}>
      <ArmarPedido slug={slug} items={items} recargoCuotas={cliente.recargoCuotas} />
    </PanelShell>
  );
}
