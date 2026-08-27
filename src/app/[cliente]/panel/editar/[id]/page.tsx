import { notFound } from 'next/navigation';
import { FormItem } from '@/componentes/panel/FormItem';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarCategorias, obtenerItem } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaEditarItem({
  params,
}: {
  params: Promise<{ cliente: string; id: string }>;
}) {
  const { cliente: slug, id } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const [categorias, item] = await Promise.all([listarCategorias(cliente.id), obtenerItem(cliente.id, id)]);
  if (!item) notFound();

  return (
    <PanelShell slug={slug}>
      <h1 className="text-2xl font-semibold">Editar ítem</h1>
      <div className="mt-6 max-w-xl">
        <FormItem slug={slug} categorias={categorias} item={item} />
      </div>
    </PanelShell>
  );
}
