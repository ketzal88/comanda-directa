import { leerCarta, leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { xmlFeed } from '@/logica/feed-meta';

/** `/<cliente>/catalogo.xml`: el feed para el catálogo de Meta. Se arma en
 *  cada request contra la base (ver `logica/feed-meta.ts`), así que se
 *  actualiza solo: en el Commerce Manager se carga esta URL como origen de
 *  datos con bajada programada. */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string }> };

export async function GET(_req: Request, { params }: Contexto) {
  const { cliente: slug } = await params;
  if (!haySupabaseConfigurado()) return new Response('Sin base configurada', { status: 404 });

  const cliente = await leerCliente(slug);
  if (!cliente) return new Response('No existe', { status: 404 });

  const carta = await leerCarta(cliente);
  return new Response(xmlFeed(cliente, carta), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Unos minutos de CDN alcanzan: Meta baja el feed a lo sumo cada hora.
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
