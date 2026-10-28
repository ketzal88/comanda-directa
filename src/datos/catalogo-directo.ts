import 'server-only';
import type { CatalogoDirecto } from '@/clientes/pedidos-directos';
import { CSV_CATALOGOS, FICHAS_CATALOGOS } from '@/datos/catalogo-directo-fuentes';
import {
  armarCatalogoDirecto,
  leerHojaCatalogo,
  type ProductoDirecto,
} from '@/logica/catalogo-directo';

/** Cada cuánto se vuelve a pedir la hoja "Catálogo". Un precio o un stock
 *  cambiado en la planilla tarda hasta esto en verse; si Google falla en el
 *  medio, sigue la copia anterior (el cache de `fetch` no se pisa con un
 *  error). Es el mismo refresco que las vitrinas de disfraces. */
const REFRESCO_SEGUNDOS = 300;

/** Lo que viaja al navegador de un catálogo directo. Nada del proveedor. */
export type DatosCatalogoDirecto = {
  titulo: string;
  leyenda: string;
  categorias: string[];
  productos: ProductoDirecto[];
};

/** Arma el catálogo leyendo la hoja en vivo. Lanza si la hoja no está
 *  disponible, para que la ruta responda 503 y no una página vacía. */
export async function leerCatalogoDirecto(slug: string, cat: CatalogoDirecto): Promise<DatosCatalogoDirecto> {
  const csv = CSV_CATALOGOS[slug];
  if (!csv) throw new Error(`sin fuente CSV para ${slug}`);
  const res = await fetch(csv, { next: { revalidate: REFRESCO_SEGUNDOS } });
  if (!res.ok) throw new Error(`hoja HTTP ${res.status}`);
  const texto = await res.text();
  // Si la planilla deja de estar compartida, Google responde 200 con la
  // pantalla de login en HTML: eso no es una hoja vacía, es un error.
  if (/^\s*<(!doctype|html)/i.test(texto)) throw new Error('la hoja no es pública');

  const base = armarCatalogoDirecto(cat.manifiesto, leerHojaCatalogo(texto));
  // La foto (y el video, cuando lo hay) se sirven proxeadas desde el proveedor
  // bajo nuestro dominio (ver `pedido-foto`/`pedido-video`). Al navegador le
  // viaja sólo la ruta de nuestro dominio; el link del proveedor queda en
  // `FICHAS_CATALOGOS`, que es server-only. Un producto sin ficha (sin página)
  // va sin foto y la tarjeta muestra el placeholder de Party Market.
  const fichas = FICHAS_CATALOGOS[slug] ?? {};
  const productos = base.map((p) => {
    const ficha = fichas[p.slug];
    if (!ficha) return p;
    return {
      ...p,
      foto: `/${slug}/pedido-foto/${p.slug}`,
      ...(ficha.video ? { video: `/${slug}/pedido-video/${p.slug}` } : {}),
    };
  });
  // Las categorías que hoy tienen al menos un producto (disponible o vendido):
  // una sección con sólo vendidos igual se muestra, con su contador.
  const presentes = new Set(productos.map((p) => p.categoria));
  return {
    titulo: cat.titulo,
    leyenda: cat.leyenda,
    categorias: cat.categorias.filter((c) => presentes.has(c)),
    productos,
  };
}
