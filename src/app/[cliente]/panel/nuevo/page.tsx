import { notFound } from 'next/navigation';
import { FormItem } from '@/componentes/panel/FormItem';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';
import { listarCategorias } from '@/datos/panel-repo';

export const dynamic = 'force-dynamic';

export default async function PaginaNuevoItem({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  const categorias = await listarCategorias(cliente.id);

  return (
    <PanelShell slug={slug} nombre={cliente.nombre}>
      <h1 className="text-2xl font-semibold">Nuevo ítem</h1>
      <div className="mt-6 max-w-xl">
        <FormItem slug={slug} categorias={categorias} />
      </div>
    </PanelShell>
  );
}
