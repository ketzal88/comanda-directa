import { VITRINAS } from '@/clientes/vitrinas';
import { leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { normalizarNumero, numeroUsable } from '@/logica/whatsapp';

/** `/<cliente>/<vitrina>`: un catálogo suelto del cliente (ver
 *  `clientes/vitrinas.ts`), con el WhatsApp del local puesto en el momento.
 *  El HTML se pide al propio sitio (`public/` no viaja dentro de la función
 *  en Vercel, sí se sirve como estático). */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string; vitrina: string }> };

export async function GET(req: Request, { params }: Contexto) {
  const { cliente: slug, vitrina } = await params;
  if (!VITRINAS[slug]?.includes(vitrina)) return new Response('No existe', { status: 404 });

  const estatico = await fetch(new URL(`/vitrinas/${slug}/${vitrina}.html`, req.url));
  if (!estatico.ok) return new Response('No existe', { status: 404 });
  const html = await estatico.text();

  // Sin base o sin número usable, el botón de WhatsApp no aparece y queda
  // el de copiar el pedido: la vitrina se puede mirar igual.
  const cliente = haySupabaseConfigurado() ? await leerCliente(slug) : null;
  const numero = cliente && numeroUsable(cliente.whatsapp) ? normalizarNumero(cliente.whatsapp) : '';

  return new Response(html.replace('__WHATSAPP__', numero), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
