import { Carta } from '@/componentes/carta/Carta';
import { leerCarta, leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { CARTA_MUESTRA, CONFIG_PEDIDO_MUESTRA } from '@/fixtures/carta-muestra';
import { configPedidoDe } from '@/logica/tipos';

type Props = { params: Promise<{ cliente: string }> };

/** La carta: es la home de cada cliente porque el QR abre acá y no hay nada
 *  que elegir antes (mismo criterio que sagrado-sushi-carta). */
export default async function PaginaCarta({ params }: Props) {
  const { cliente: slug } = await params;

  // Sin Supabase configurado (todavía no se cargó .env.local): se sirve la
  // carta de muestra para poder trabajar la plantilla sin depender de un
  // proyecto real. El layout ya dejó pasar cualquier slug en este caso.
  if (!haySupabaseConfigurado()) {
    return <Carta carta={CARTA_MUESTRA} configPedido={CONFIG_PEDIDO_MUESTRA} />;
  }

  // El layout de `[cliente]` ya llamó a `notFound()` si el slug no existe;
  // `leerCliente` está cacheado con `cache()` de React, así que esto no
  // vuelve a pegarle a la base.
  const cliente = await leerCliente(slug);
  if (!cliente) return null;

  const carta = await leerCarta(cliente);
  return <Carta carta={carta} configPedido={configPedidoDe(cliente)} logoUrl={cliente.tema.logoUrl} />;
}
