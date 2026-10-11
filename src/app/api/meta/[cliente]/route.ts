import { after, type NextRequest } from 'next/server';
import { enviarCapi, tokenCapi } from '@/datos/meta-capi';
import { esEventoMeta, pixelDe } from '@/logica/pixel-meta';

/** El reenvío por la Conversions API de los eventos del pixel.
 *
 *  El navegador manda cada evento dos veces: por el pixel y, con el mismo
 *  `eventId`, acá. Meta se queda con uno. El de acá llega aunque un
 *  bloqueador de anuncios o el navegador hayan frenado el pixel, que en
 *  celulares es una parte grande del tráfico.
 *
 *  Responde 204 siempre y manda a Meta después de responder (`after`): el
 *  comprador no espera a Graph, y un error de Meta no le dice nada a quien
 *  esté probando el endpoint. */

const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 120;
const conteos = new Map<string, { n: number; hasta: number }>();

/** Por instancia y en memoria: no frena a alguien decidido, pero sí un
 *  bucle accidental, que es el abuso realista acá. */
function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const actual = conteos.get(ip);
  if (!actual || ahora > actual.hasta) {
    conteos.set(ip, { n: 1, hasta: ahora + VENTANA_MS });
    return false;
  }
  return ++actual.n > MAX_POR_VENTANA;
}

const texto = (v: unknown, max = 500) => (typeof v === 'string' && v.length <= max ? v : undefined);

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const listo = new Response(null, { status: 204 });
  const { cliente: slug } = await params;

  const pixel = pixelDe(slug);
  const token = pixel && tokenCapi(pixel);
  if (!pixel || !token) return listo;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
  if (ip && excedeLimite(ip)) return listo;

  const crudo = await req.text();
  if (crudo.length > 20_000) return listo;
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(crudo);
  } catch {
    return listo;
  }

  const eventId = texto(body.eventId, 100);
  const url = texto(body.url, 2000);
  if (!esEventoMeta(body.evento) || !eventId || !url) return listo;
  // Sólo URLs de la carta de este cliente: el evento dice de dónde viene.
  if (!new URL(url, req.nextUrl.origin).pathname.startsWith(`/${slug}`)) return listo;

  const datos = body.datos && typeof body.datos === 'object' ? (body.datos as Record<string, unknown>) : undefined;
  const pedido = {
    evento: body.evento,
    eventId,
    url,
    ...(datos ? { datos } : {}),
    ...(texto(body.fbp) ? { fbp: texto(body.fbp) } : {}),
    ...(texto(body.fbc) ? { fbc: texto(body.fbc) } : {}),
    ...(ip ? { ip } : {}),
    ...(req.headers.get('user-agent') ? { userAgent: req.headers.get('user-agent')! } : {}),
    ahora: Math.floor(Date.now() / 1000),
  };

  after(() => enviarCapi(pixel, token, pedido).catch((e) => console.error('[meta-capi]', e.message)));
  return listo;
}
