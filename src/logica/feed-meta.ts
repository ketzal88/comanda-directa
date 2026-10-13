import { idCatalogo } from './pixel-meta';
import { variantesDe, tieneVariantes } from './variantes';
import type { Carta, Cliente } from './tipos';

/** El feed de productos para el catálogo de Meta (Commerce Manager), en el
 *  RSS 2.0 con namespace `g:` que Meta lee igual que Google Merchant.
 *
 *  Es una vista de la carta y no un archivo exportado: Meta lo baja con la
 *  "programación" del origen de datos, así que un precio cambiado o un
 *  producto marcado agotado desde el panel llega al catálogo en la próxima
 *  bajada sin que nadie tenga que acordarse de regenerar nada.
 *
 *  Una fila por variante. Si todas las variantes del producto son talles,
 *  van agrupadas con `item_group_id` + `size` y Meta arma el selector de
 *  talles; si no ("Brujita" / "Esqueleto S 5-6"), salen como productos
 *  sueltos, porque meter un personaje en `size` es mentirle al catálogo. */

export const SITIO = 'https://www.hace-tu-pedido.site';

/** Meta corta el título en 200 y la descripción en 9999. */
const MAX_TITULO = 200;
const MAX_DESCRIPCION = 9999;

export type FilaFeed = {
  id: string;
  grupo?: string;
  titulo: string;
  descripcion: string;
  disponible: boolean;
  precio: number;
  link: string;
  imagen: string;
  marca: string;
  tipo: string;
  talle?: string;
};

/** "S (5 a 6)", "Talle L", "XL", "80 cm". */
const PARECE_TALLE = /^(talle\s+)?(xxs|xs|s|m|l|xl|xxl|xxxl|\d+)(\s*\(.*\)|\s*cm)?$/i;

function absoluta(ruta: string): string {
  return /^https?:\/\//.test(ruta) ? ruta : `${SITIO}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

/** Las filas del feed. Quedan afuera los productos que Meta rechazaría de
 *  todos modos (sin foto o sin precio) y los dados de baja: mejor un
 *  catálogo más corto que uno lleno de errores en el Commerce Manager. */
export function filasFeed(cliente: Cliente, carta: Carta): FilaFeed[] {
  const categorias = new Map(carta.categorias.map((c) => [c.id, c]));
  const filas: FilaFeed[] = [];

  for (const item of carta.items) {
    if (!item.activo || !item.fotoUrl) continue;
    const categoria = categorias.get(item.categoriaId);
    const tipo = [categoria?.nombre, item.subcategoria].filter(Boolean).join(' > ');
    const descripcion = (item.descripcion?.trim() || item.nombre).slice(0, MAX_DESCRIPCION);
    // El ancla de la categoría y no la del producto: la carta colapsa las
    // categorías largas, y un producto escondido no tiene a dónde scrollear.
    const link = `${SITIO}/${cliente.slug}${categoria ? `#cat-${categoria.id}` : ''}`;
    const conVariantes = tieneVariantes(item);
    const conTalles = conVariantes && variantesDe(item).every((v) => PARECE_TALLE.test(v.etiqueta.trim()));

    for (const variante of variantesDe(item)) {
      if (variante.precio <= 0) continue;
      filas.push({
        id: idCatalogo(item.id, conVariantes ? variante.etiqueta : undefined),
        ...(conTalles ? { grupo: item.id, talle: variante.etiqueta } : {}),
        titulo: (conVariantes ? `${item.nombre} - ${variante.etiqueta}` : item.nombre).slice(0, MAX_TITULO),
        descripcion,
        disponible: !item.agotado,
        precio: variante.precio,
        link,
        imagen: absoluta(variante.foto ?? item.fotoUrl),
        marca: cliente.nombre,
        tipo,
      });
    }
  }
  return filas;
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function etiqueta(nombre: string, valor: string | undefined): string {
  return valor ? `      <g:${nombre}>${escapar(valor)}</g:${nombre}>\n` : '';
}

export function xmlFeed(cliente: Cliente, carta: Carta): string {
  const items = filasFeed(cliente, carta)
    .map(
      (f) =>
        '    <item>\n' +
        etiqueta('id', f.id) +
        etiqueta('item_group_id', f.grupo) +
        etiqueta('title', f.titulo) +
        etiqueta('description', f.descripcion) +
        etiqueta('availability', f.disponible ? 'in stock' : 'out of stock') +
        etiqueta('condition', 'new') +
        // Entero en pesos, como lo guarda la carta: es el precio de lista.
        etiqueta('price', `${f.precio}.00 ARS`) +
        etiqueta('link', f.link) +
        etiqueta('image_link', f.imagen) +
        etiqueta('brand', f.marca) +
        etiqueta('product_type', f.tipo) +
        etiqueta('size', f.talle) +
        '    </item>\n',
    )
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '  <channel>\n' +
    `    <title>${escapar(cliente.nombre)}</title>\n` +
    `    <link>${SITIO}/${cliente.slug}</link>\n` +
    `    <description>${escapar(`Catálogo de ${cliente.nombre}`)}</description>\n` +
    items +
    '  </channel>\n' +
    '</rss>\n'
  );
}
