import { Carta } from '@/componentes/carta/Carta';
import { CartaHalloween } from '@/componentes/carta/CartaHalloween';
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
  const props = {
    carta,
    configPedido: configPedidoDe(cliente),
    ...(cliente.tema.logoUrl ? { logoUrl: cliente.tema.logoUrl } : {}),
  };

  // El campo `clientes.plantilla` elige la variante visual (ver README >
  // "Plantillas"). Un valor desconocido cae en la Clásica a propósito: un
  // typo en la base no puede dejar a un cliente sin carta.
  switch (cliente.plantilla) {
    case 'halloween':
      return <CartaHalloween {...props} />;
    default:
      return <Carta {...props} />;
  }
}
