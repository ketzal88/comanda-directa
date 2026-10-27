import 'server-only';
import type { CatalogoDirecto } from '@/clientes/pedidos-directos';
import { CSV_CATALOGOS } from '@/datos/catalogo-directo-fuentes';
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

  const productos = armarCatalogoDirecto(cat.manifiesto, leerHojaCatalogo(texto));
  // Sólo las categorías que hoy tienen al menos un producto con stock.
  const conStock = new Set(productos.map((p) => p.categoria));
  return {
    titulo: cat.titulo,
    leyenda: cat.leyenda,
    categorias: cat.categorias.filter((c) => conStock.has(c)),
    productos,
  };
}
