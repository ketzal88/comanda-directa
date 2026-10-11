import { esCubierto } from './pedido';
import type { LineaPedido } from './pedido';

/** El pixel de Meta de cada cliente, por slug. Un cliente que no figura acá
 *  no carga el pixel ni manda eventos.
 *
 *  Está en el código y no en la base por lo mismo que `SLUGS_RENOMBRADOS`:
 *  son pocos, cambian casi nunca y así el alta queda en el diff. El ID del
 *  pixel no es secreto (viaja en el HTML de cualquier página que lo use). */
export const PIXELES_META: Record<string, string> = {
  'party-market': '',
};

export function pixelDe(slug: string): string | null {
  const id = PIXELES_META[slug]?.trim();
  return id && /^\d+$/.test(id) ? id : null;
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
