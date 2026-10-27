import { FICHAS_CATALOGOS } from '@/datos/catalogo-directo-fuentes';
import { fotoDePagina } from '@/logica/vitrina-planilla';

/** `/<cliente>/pedido-foto/<slug>`: la foto de un producto del catálogo de
 *  pedidos directos (ver `clientes/pedidos-directos.ts`).
 *
 *  La planilla no tiene columna de foto: tiene el link a la página del
 *  producto en el proveedor, que no se puede mostrar. Esta ruta lo resuelve
 *  del lado del servidor (link → `og:image` → bytes) y devuelve sólo la
 *  imagen, bajo una URL de este dominio. La página no la pide directo sino por
 *  `/_next/image`, que la achica, la pasa a webp y le saca los metadatos. Es
 *  la misma mecánica que `/<cliente>/foto/<disfraz>` de las vitrinas.
 *
 *  El link NO sale de lo que escribe el visitante: sale de `FICHAS_CATALOGOS`,
 *  un mapa cerrado y `server-only`. Un `slug` que no esté ahí es 404. */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string; slug: string }> };

const NAVEGADOR = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};
const UN_DIA = 86400;

/** Sólo imágenes de mapa de bits. Excluye `image/svg+xml` a propósito: un SVG
 *  puede traer scripts y esta ruta sirve bajo NUESTRO dominio, así que servirlo
 *  sería un XSS en origen propio. */
const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export async function GET(_req: Request, { params }: Contexto) {
  const { cliente: slug, slug: producto } = await params;
  const ficha = FICHAS_CATALOGOS[slug]?.[producto];
  if (!ficha) return new Response(null, { status: 404 });

  try {
    const pagina = await fetch(ficha.pagina, { headers: NAVEGADOR, next: { revalidate: UN_DIA } });
    if (!pagina.ok) return new Response(null, { status: 404 });
    const origen = fotoDePagina(await pagina.text(), ficha.pagina);
    // Sólo https: el `origen` sale del og:image de una página externa; sin esto
    // podría apuntar a un recurso interno (SSRF).
    if (!origen || !origen.startsWith('https://')) return new Response(null, { status: 404 });

    const foto = await fetch(origen, { headers: NAVEGADOR, cache: 'no-store' });
    const tipo = (foto.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!foto.ok || !TIPOS_PERMITIDOS.has(tipo)) return new Response(null, { status: 404 });

    return new Response(await foto.arrayBuffer(), {
      headers: {
        'Content-Type': tipo,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Content-Disposition': 'inline; filename="foto"',
        'Cache-Control': `public, max-age=${UN_DIA}, s-maxage=${UN_DIA * 7}, stale-while-revalidate=${UN_DIA}`,
      },
    });
  } catch (err) {
    console.error(`[pedido-foto ${slug}/${producto}]`, err);
    return new Response(null, { status: 502 });
  }
}
