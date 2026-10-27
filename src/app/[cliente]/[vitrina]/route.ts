import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { catalogoDirectoDe, type CatalogoDirecto } from '@/clientes/pedidos-directos';
import { pestanaDeVitrina, VITRINAS, VITRINAS_PLANILLA } from '@/clientes/vitrinas';
import { leerCliente } from '@/datos/carta-repo';
import { leerCatalogoDirecto } from '@/datos/catalogo-directo';
import { armarDatosVitrina, leerHojasVitrina } from '@/datos/vitrina-planilla';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { normalizarNumero, numeroUsable } from '@/logica/whatsapp';

/** `/<cliente>/<vitrina>`: un catálogo suelto del cliente (ver
 *  `clientes/vitrinas.ts`), con el WhatsApp del local puesto en el momento.
 *
 *  El HTML se lee de disco y no se pide por HTTP al propio sitio: armar esa
 *  URL desde la request la deja en manos del header Host, y lo que vuelve se
 *  sirve como HTML de este dominio. `next.config.ts` lo suma al bundle de la
 *  función (`outputFileTracingIncludes`). La ruta del archivo sale sólo de
 *  la lista de `VITRINAS`, nunca de lo que escribió el visitante. */
export const dynamic = 'force-dynamic';

type Contexto = { params: Promise<{ cliente: string; vitrina: string }> };

async function numeroDelLocal(slug: string): Promise<string> {
  // Sin base o sin número usable, el botón de WhatsApp no aparece y queda
  // el de copiar el pedido: la vitrina se puede mirar igual.
  const cliente = haySupabaseConfigurado() ? await leerCliente(slug) : null;
  return cliente && numeroUsable(cliente.whatsapp) ? normalizarNumero(cliente.whatsapp) : '';
}

const leerPlantilla = (slug: string, nombre: string) =>
  readFile(path.join(process.cwd(), 'src', 'clientes', 'vitrinas', slug, `${nombre}.html`), 'utf8');

/** JSON adentro de un `<script>`: un `</script>` en un nombre cerraría el
 *  bloque. Con `<` escapado no puede pasar. */
const jsonEnHtml = (dato: unknown) => JSON.stringify(dato).replace(/</g, '\\u003c');

export async function GET(_req: Request, { params }: Contexto) {
  const { cliente: slug, vitrina } = await params;

  const catalogo = catalogoDirectoDe(slug, vitrina);
  if (catalogo) return catalogoDirecto(slug, catalogo);

  const pestana = pestanaDeVitrina(slug, vitrina);
  if (pestana) return vitrinaDePlanilla(slug, pestana.id, pestana.titulo);

  if (!Object.hasOwn(VITRINAS, slug) || !VITRINAS[slug].includes(vitrina)) {
    return new Response('No existe', { status: 404 });
  }

  const html = await leerPlantilla(slug, vitrina);
  const numero = await numeroDelLocal(slug);

  return new Response(html.replace('__WHATSAPP__', numero), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

/** Catálogo de pedidos directos (ver `clientes/pedidos-directos.ts`): la
 *  plantilla con los productos de una unidad leídos en vivo de la hoja
 *  "Catálogo", con el WhatsApp del local puesto en el momento. */
async function catalogoDirecto(slug: string, cat: CatalogoDirecto) {
  let datos;
  try {
    datos = await leerCatalogoDirecto(cat);
  } catch (err) {
    console.error(`[catalogo ${slug}/${cat.ruta}]`, err);
    return new Response('El catálogo no está disponible en este momento. Probá de nuevo en unos minutos.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const [html, numero] = await Promise.all([leerPlantilla(slug, cat.plantilla), numeroDelLocal(slug)]);
  const pagina = html
    .replace('__DATOS__', () => jsonEnHtml(datos))
    .replaceAll('__TITULO__', datos.titulo)
    .replace('__WHATSAPP__', numero);

  return new Response(pagina, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

/** Vitrina armada desde la planilla (ver `VITRINAS_PLANILLA`): la plantilla
 *  con los datos de todas las pestañas y la pedida ya elegida. */
async function vitrinaDePlanilla(slug: string, pestana: string, titulo: string) {
  const v = VITRINAS_PLANILLA[slug];
  let hojas;
  try {
    hojas = await leerHojasVitrina(v);
  } catch (err) {
    console.error(`[vitrina ${slug}/${pestana}]`, err);
    return new Response('El catálogo no está disponible en este momento. Probá de nuevo en unos minutos.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const [html, numero] = await Promise.all([leerPlantilla(slug, v.plantilla), numeroDelLocal(slug)]);
  const pagina = html
    .replace('__DATOS__', () => jsonEnHtml(armarDatosVitrina(v, hojas)))
    .replace('__PESTANA__', pestana)
    .replaceAll('__TITULO__', titulo)
    .replace('__WHATSAPP__', numero);

  return new Response(pagina, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
