import { VITRINAS_PLANILLA } from '@/clientes/vitrinas';
import { linkDeDisfraz } from '@/datos/vitrina-planilla';
import { fotoDePagina, slugDisfraz } from '@/logica/vitrina-planilla';

/** `/<cliente>/foto/<disfraz>`: la foto de un disfraz de una vitrina de
 *  planilla (ver `clientes/vitrinas.ts`).
 *
 *  La planilla no tiene columna de foto: tiene el link a la página del
 *  producto en el proveedor, que no se puede mostrar. Esta ruta lo resuelve
 *  del lado del servidor (link → `og:image` → bytes) y devuelve sólo la
 *  imagen, bajo una URL de este dominio. La vitrina no la pide directo sino
 *  por `/_next/image`, que la achica y la pasa a webp (y le saca los
 *  metadatos del archivo original).
 *
 *  Un disfraz nuevo en la planilla trae su foto solo, sin correr nada. Si el
 *  link no tiene foto, 404 y la tarjeta muestra el recuadro vacío. */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string; disfraz: string }> };

const NAVEGADOR = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};
const UN_DIA = 86400;

export async function GET(_req: Request, { params }: Contexto) {
  const { cliente: slug, disfraz } = await params;
  if (!Object.hasOwn(VITRINAS_PLANILLA, slug) || disfraz !== slugDisfraz(disfraz)) {
    return new Response(null, { status: 404 });
  }

  try {
    const link = await linkDeDisfraz(VITRINAS_PLANILLA[slug], disfraz);
    if (!link || !link.startsWith('https://')) return new Response(null, { status: 404 });

    const pagina = await fetch(link, { headers: NAVEGADOR, next: { revalidate: UN_DIA } });
    if (!pagina.ok) return new Response(null, { status: 404 });
    const origen = fotoDePagina(await pagina.text(), link);
    if (!origen) return new Response(null, { status: 404 });

    // Sin cache de `fetch`: son imágenes de cientos de KB. Lo que se cachea
    // es la respuesta de esta ruta en el CDN y la versión achicada de
    // `/_next/image`.
    const foto = await fetch(origen, { headers: NAVEGADOR, cache: 'no-store' });
    const tipo = foto.headers.get('content-type') ?? '';
    if (!foto.ok || !tipo.startsWith('image/')) return new Response(null, { status: 404 });

    return new Response(await foto.arrayBuffer(), {
      headers: {
        'Content-Type': tipo,
        'Cache-Control': `public, max-age=${UN_DIA}, s-maxage=${UN_DIA * 7}, stale-while-revalidate=${UN_DIA}`,
      },
    });
  } catch (err) {
    console.error(`[foto ${slug}/${disfraz}]`, err);
    return new Response(null, { status: 502 });
  }
}
