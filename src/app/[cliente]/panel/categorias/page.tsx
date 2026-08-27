import { notFound } from 'next/navigation';
import { PanelCategorias } from '@/componentes/panel/PanelCategorias';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarCategorias } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaCategorias({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const categorias = await listarCategorias(cliente.id);

  return (
    <PanelShell slug={slug}>
      <PanelCategorias slug={slug} categorias={categorias} />
    </PanelShell>
  );
}
