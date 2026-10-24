import { notFound } from 'next/navigation';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { PanelStock } from '@/componentes/panel/PanelStock';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarItemsPanel } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaStock({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const items = await listarItemsPanel(cliente.id);

  return (
    <PanelShell slug={slug} nombre={cliente.nombre}>
      <PanelStock slug={slug} items={items} recargoCuotas={cliente.recargoCuotas} />
    </PanelShell>
  );
}
