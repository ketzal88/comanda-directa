import { FICHAS_CATALOGOS } from '@/datos/catalogo-directo-fuentes';
import { videoDePagina } from '@/logica/vitrina-planilla';

/** `/<cliente>/pedido-video/<slug>`: el video de un producto del catálogo de
 *  pedidos directos, cuando la página del proveedor tiene uno.
 *
 *  Misma idea que `pedido-foto`: el link al proveedor no se muestra. La ruta
 *  resuelve la página → `og:video` (o el primer `.mp4` del sitio) → bytes, y
 *  los sirve bajo nuestro dominio para que el video se reproduzca en la misma
 *  página, sin sacar al visitante afuera. Reenvía el `Range` para que el video
 *  se pueda adelantar sin bajarlo entero.
 *
 *  El link sale de `FICHAS_CATALOGOS` (cerrado y `server-only`), nunca de la
 *  URL que pide el visitante: un `slug` que no esté ahí, o sin video, es 404. */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string; slug: string }> };

const NAVEGADOR = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};
const UN_DIA = 86400;

export async function GET(req: Request, { params }: Contexto) {
  const { cliente: slug, slug: producto } = await params;
  const ficha = FICHAS_CATALOGOS[slug]?.[producto];
  if (!ficha?.video) return new Response(null, { status: 404 });

  try {
    const pagina = await fetch(ficha.pagina, { headers: NAVEGADOR, next: { revalidate: UN_DIA } });
    if (!pagina.ok) return new Response(null, { status: 404 });
    const origen = videoDePagina(await pagina.text(), ficha.pagina);
    // Sólo https y del mismo sitio que la página (lo garantiza videoDePagina):
    // el valor sale del HTML de una página externa (SSRF).
    if (!origen || !origen.startsWith('https://')) return new Response(null, { status: 404 });

    const rango = req.headers.get('range');
    const video = await fetch(origen, {
      headers: { ...NAVEGADOR, ...(rango ? { range: rango } : {}) },
      cache: 'no-store',
    });
    const tipo = (video.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!video.ok || !tipo.startsWith('video/')) return new Response(null, { status: 404 });

    const headers = new Headers({
      'Content-Type': tipo,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Accept-Ranges': 'bytes',
      'Cache-Control': `public, max-age=${UN_DIA}, s-maxage=${UN_DIA * 7}, stale-while-revalidate=${UN_DIA}`,
    });
    for (const h of ['content-length', 'content-range'] as const) {
      const v = video.headers.get(h);
      if (v) headers.set(h, v);
    }
    // 206 si el proveedor respondió un rango parcial; si no, 200.
    return new Response(video.body, { status: video.status === 206 ? 206 : 200, headers });
  } catch (err) {
    console.error(`[pedido-video ${slug}/${producto}]`, err);
    return new Response(null, { status: 502 });
  }
}
