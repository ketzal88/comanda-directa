import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { VITRINAS } from '@/clientes/vitrinas';
import { leerCliente } from '@/datos/carta-repo';
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

export async function GET(_req: Request, { params }: Contexto) {
  const { cliente: slug, vitrina } = await params;
  if (!Object.hasOwn(VITRINAS, slug) || !VITRINAS[slug].includes(vitrina)) {
    return new Response('No existe', { status: 404 });
  }

  const archivo = path.join(process.cwd(), 'src', 'clientes', 'vitrinas', slug, `${vitrina}.html`);
  const html = await readFile(archivo, 'utf8');

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
