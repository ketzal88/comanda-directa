import { esCubierto } from './pedido';
import type { LineaPedido } from './pedido';

/** El pixel de Meta de cada cliente, por slug. Un cliente que no figura acá
 *  no carga el pixel ni manda eventos.
 *
 *  Está en el código y no en la base por lo mismo que `SLUGS_RENOMBRADOS`:
 *  son pocos, cambian casi nunca y así el alta queda en el diff. El ID del
 *  pixel no es secreto (viaja en el HTML de cualquier página que lo use). */
export const PIXELES_META: Record<string, string> = {
  'party-market': '1104531105669169',
};

export function pixelDe(slug: string): string | null {
  const id = PIXELES_META[slug]?.trim();
  return id && /^\d+$/.test(id) ? id : null;
}

/** Los eventos que el navegador puede pedirle al servidor que reenvíe por
 *  la Conversions API. Lista cerrada: el endpoint es público y sin esto
 *  cualquiera podría meterle eventos inventados al pixel del cliente. */
export const EVENTOS_META = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'] as const;
export type EventoMeta = (typeof EVENTOS_META)[number];

export function esEventoMeta(nombre: unknown): nombre is EventoMeta {
  return typeof nombre === 'string' && (EVENTOS_META as readonly string[]).includes(nombre);
}

/** El nombre de la variable de entorno con el token de la CAPI de un pixel.
 *  Uno por pixel porque cada token lo genera el Business del cliente para
 *  SU dataset, y el motor sirve a varios. */
export function variableToken(pixel: string): string {
  return `META_CAPI_TOKEN_${pixel}`;
}

export type PedidoCapi = {
  evento: EventoMeta;
  eventId: string;
  url: string;
  datos?: Record<string, unknown>;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
  /** Segundos. */
  ahora: number;
};

/** El evento tal como lo pide la Conversions API. Sin datos personales: lo
 *  que matchea es la cookie del pixel (`fbp`), el click del anuncio (`fbc`),
 *  la IP y el navegador. El `event_id` es el mismo que mandó el pixel desde
 *  el navegador, y con eso Meta descarta el duplicado. */
export function eventoCapi(p: PedidoCapi) {
  const userData = Object.fromEntries(
    Object.entries({
      fbp: p.fbp,
      fbc: p.fbc,
      client_ip_address: p.ip,
      client_user_agent: p.userAgent,
    }).filter(([, v]) => v),
  );
  return {
    event_name: p.evento,
    event_time: p.ahora,
    event_id: p.eventId,
    event_source_url: p.url,
    action_source: 'website',
    user_data: userData,
    ...(p.datos && Object.keys(p.datos).length ? { custom_data: p.datos } : {}),
  };
}

/** El id con el que el producto figura en el feed (`/<slug>/catalogo.xml`).
 *  Los eventos tienen que usar EXACTAMENTE este: si el `content_id` del
 *  pixel no coincide con el `id` del catálogo, Meta no puede cruzar quién
 *  vio o agregó qué, y los anuncios de catálogo pierden el remarketing. */
export function idCatalogo(itemId: string, variante?: string): string {
  return variante ? `${itemId}--${variante}` : itemId;
}

export type DatosEvento = {
  content_ids: string[];
  contents: { id: string; quantity: number; item_price: number }[];
  content_type: 'product';
  num_items: number;
  value: number;
  currency: 'ARS';
};

/** Lo que llevan AddToCart, InitiateCheckout y Purchase: los productos del
 *  pedido con su cantidad y precio. El cubierto del salón no es un producto
 *  del catálogo y no viaja. `value` es lo de los productos; si hace falta
 *  otro (con descuentos, sin envío), se pasa a mano. */
export function datosDeLineas(lineas: LineaPedido[], value?: number): DatosEvento {
  const productos = lineas.filter((l) => !esCubierto(l.itemId));
  const contents = productos.map((l) => ({
    id: idCatalogo(l.itemId, l.variante),
    quantity: l.cantidad,
    item_price: l.precioUnitario,
  }));
  return {
    content_ids: contents.map((c) => c.id),
    contents,
    content_type: 'product',
    num_items: contents.reduce((n, c) => n + c.quantity, 0),
    value: value ?? contents.reduce((n, c) => n + c.quantity * c.item_price, 0),
    currency: 'ARS',
  };
}
