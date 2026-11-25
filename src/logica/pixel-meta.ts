import { esCubierto, MAX_CANTIDAD } from './pedido';
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

const MAX_CONTENTS = 50;
const MAX_PRECIO = 100_000_000;

const textoCorto = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim() && v.length <= max ? v : undefined;
const numeroEn = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : undefined;

/** El `custom_data` que llega del navegador, reducido a lo que el pixel
 *  realmente manda (ver `datosDeLineas` y `ModalProducto`). El endpoint es
 *  público: sin esto cualquiera le mete a Meta campos arbitrarios o un
 *  Purchase de millones. Moneda fija ARS, ítems y cantidades con tope, y
 *  `value` nunca por encima de lo que suman los productos (sí por debajo:
 *  Purchase lo manda con descuentos y sin envío).
 *  shortcut: los `item_price` no se cruzan con la carta; si aparecen compras
 *  infladas a precio de producto, recalcularlos server-side con `leerCarta`. */
export function sanearDatos(crudo: unknown): Record<string, unknown> | undefined {
  if (!crudo || typeof crudo !== 'object') return undefined;
  const d = crudo as Record<string, unknown>;
  const salida: Record<string, unknown> = {};

  const contents = Array.isArray(d.contents)
    ? d.contents
        .slice(0, MAX_CONTENTS)
        .map((c) => {
          const r = (c ?? {}) as Record<string, unknown>;
          const id = textoCorto(r.id, 200);
          const quantity = numeroEn(r.quantity, 1, MAX_CANTIDAD);
          const item_price = numeroEn(r.item_price, 0, MAX_PRECIO);
          return id && quantity && Number.isInteger(quantity) && item_price !== undefined
            ? { id, quantity, item_price }
            : null;
        })
        .filter((c) => c !== null)
    : [];

  if (contents.length) {
    salida.contents = contents;
    salida.content_ids = contents.map((c) => c.id);
    salida.num_items = contents.reduce((n, c) => n + c.quantity, 0);
  } else if (Array.isArray(d.content_ids)) {
    const ids = d.content_ids.map((i) => textoCorto(i, 200)).filter((i) => i !== undefined);
    if (ids.length) salida.content_ids = ids.slice(0, MAX_CONTENTS);
  }

  const nombre = textoCorto(d.content_name, 200);
  if (nombre) salida.content_name = nombre;

  const tope = contents.length ? contents.reduce((n, c) => n + c.quantity * c.item_price, 0) : MAX_PRECIO;
  const value = numeroEn(d.value, 0, tope);
  if (value !== undefined) {
    salida.value = value;
    salida.currency = 'ARS';
  }
  if (salida.content_ids) salida.content_type = 'product';

  return Object.keys(salida).length ? salida : undefined;
}

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
