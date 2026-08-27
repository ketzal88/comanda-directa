import { notFound } from 'next/navigation';
import { PanelImportar } from '@/componentes/panel/PanelImportar';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';

export const dynamic = 'force-dynamic';

export default async function PaginaImportar({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  return (
    <PanelShell slug={slug}>
      <PanelImportar slug={slug} />
    </PanelShell>
  );
}
