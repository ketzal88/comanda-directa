import 'server-only';
import { eventoCapi, variableToken, type PedidoCapi } from '@/logica/pixel-meta';

const VERSION_API = process.env.META_API_VERSION ?? 'v25.0';

/** El token de la Conversions API de un pixel, o null si no está cargado.
 *  Sin token el pixel del navegador sigue andando solo: la CAPI suma
 *  señal, no es condición para medir. */
export function tokenCapi(pixel: string): string | null {
  return process.env[variableToken(pixel)]?.trim() || null;
}

/** Manda un evento a la Conversions API. Tira si Meta lo rechaza: el que
 *  llama decide si lo loguea, porque el comprador no tiene que enterarse. */
export async function enviarCapi(pixel: string, token: string, pedido: PedidoCapi): Promise<void> {
  const cuerpo: Record<string, unknown> = { data: [eventoCapi(pedido)], access_token: token };
  // Para ver los eventos en "Probar eventos" del Administrador de eventos
  // sin mezclarlos con los reales.
  if (process.env.META_TEST_EVENT_CODE) cuerpo.test_event_code = process.env.META_TEST_EVENT_CODE;

  const res = await fetch(`https://graph.facebook.com/${VERSION_API}/${pixel}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) throw new Error(`Meta CAPI ${res.status}: ${(await res.text()).slice(0, 300)}`);
}
