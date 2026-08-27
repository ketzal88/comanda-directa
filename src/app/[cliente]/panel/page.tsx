import { notFound } from 'next/navigation';
import { PanelItems } from '@/componentes/panel/PanelItems';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarCategorias, listarItemsPanel } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaPanel({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();

  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const [items, categorias] = await Promise.all([
    listarItemsPanel(cliente.id),
    listarCategorias(cliente.id),
  ]);

  return (
    <PanelShell slug={slug}>
      <PanelItems slug={slug} items={items} categorias={categorias} />
    </PanelShell>
  );
}
