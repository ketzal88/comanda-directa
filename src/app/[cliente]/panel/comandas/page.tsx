import { notFound } from 'next/navigation';
import { PanelLogin } from '@/componentes/panel/PanelLogin';
import { PanelShell } from '@/componentes/panel/PanelShell';
import { leerCliente } from '@/datos/carta-repo';
import { esPanelAutorizado } from '@/datos/panel-auth';

export const dynamic = 'force-dynamic';

export default async function PaginaComandas({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await leerCliente(slug);
  if (!cliente) notFound();
  if (!(await esPanelAutorizado(slug, cliente.claveHash))) return <PanelLogin slug={slug} />;

  return (
    <PanelShell slug={slug}>
      <h1 className="text-2xl font-semibold">Imprimir las comandas</h1>
      <p className="mt-3 max-w-xl text-sm text-neutral-300">
        Un botón dentro de WhatsApp Web que imprime la comanda de cocina (y el ticket del cadete, en
        delivery) del pedido que llegó por el chat. Hace falta una computadora con WhatsApp Web y una
        impresora térmica de 80&nbsp;mm.
      </p>
      <ol className="mt-6 grid max-w-xl gap-3 text-sm text-neutral-300">
        <li>1. Comanda Directa te va a pasar la carpeta de la extensión (o un .zip para descomprimir).</li>
        <li>
          2. En Chrome, abrí <code className="rounded bg-white/10 px-1.5 py-0.5">chrome://extensions</code>{' '}
          y activá &quot;Modo de desarrollador&quot; (arriba a la derecha).
        </li>
        <li>3. Tocá &quot;Cargar descomprimida&quot; y elegí esa carpeta.</li>
        <li>4. Abrí WhatsApp Web: el botón de imprimir va a aparecer al lado de cada pedido.</li>
      </ol>
      <p className="mt-6 max-w-xl text-sm text-neutral-400">
        Es la misma extensión para todos los locales de Comanda Directa: no hay nada para configurar
        por cliente.
      </p>
    </PanelShell>
  );
}
