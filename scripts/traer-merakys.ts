import { writeFile } from 'node:fs/promises';

/** Trae una categoría entera del mayorista: nombre, precio y link de cada
 *  producto, recorriendo todas las páginas.
 *
 *  Existe porque cargar a mano una categoría de 158 productos es una tarde y
 *  un puñado de precios mal tipeados, y porque el mayorista cambia precios:
 *  con esto, actualizar es volver a correrlo y mirar el diff.
 *
 *  El link se guarda además del nombre: es lo que después le deja a
 *  `fotos-halloween.ts` ir directo a la ficha en vez de adivinar el slug
 *  —un cuarto de los links de la lista original daban 404 justamente por eso.
 *
 *    npx tsx scripts/traer-merakys.ts animatronics deco-inflables-gigantes
 */

const BASE = 'https://mayoristas.merakys.com.ar/etiqueta-producto/halloween';
const NAVEGADOR = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};

export type ProductoMayorista = {
  nombre: string;
  /** ENTERO en pesos, el precio del mayorista sin margen. */
  precio: number;
  /** El slug de la ficha, para ir a buscar la foto. */
  slug: string;
  categoria: string;
};

/** Saca las etiquetas y decodifica las entidades.
 *
 *  Las NUMÉRICAS (`&#36;` = "$") hay que decodificarlas ANTES de buscar el
 *  precio: dejarlas pasar hace que el primer número de la cadena sea el 36 del
 *  signo pesos, y todos los productos terminan valiendo 36. Pasó. */
function texto(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

/** El precio tal como lo escribe WooCommerce: "$&nbsp;27.900" dentro de un
 *  `<bdi>`. Se toma el ÚLTIMO `<bdi>` de la tarjeta: cuando el producto está
 *  en oferta hay dos (el tachado y el vigente) y el que vale es el segundo. */
function precioDe(tarjeta: string): number | null {
  const bdis = [...tarjeta.matchAll(/<bdi>([\s\S]*?)<\/bdi>/g)];
  if (!bdis.length) return null;
  const crudo = texto(bdis[bdis.length - 1][1]);
  // el signo pesos ya vino decodificado: lo que queda es el número
  const m = crudo.match(/([\d][\d.,]*)/);
  if (!m) return null;
  // es-AR: el punto es separador de miles y la coma decimal, que se descarta
  const entero = Number(m[1].replace(/\./g, '').split(',')[0]);
  return Number.isFinite(entero) && entero > 0 ? entero : null;
}

async function pagina(categoria: string, n: number): Promise<{ html: string; total: number }> {
  const url = n === 1 ? `${BASE}/?product_cat=${categoria}` : `${BASE}/page/${n}/?product_cat=${categoria}`;
  const res = await fetch(url, { headers: NAVEGADOR });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const html = await res.text();
  const conteo = html.match(/de\s+(\d+)\s+resultados/);
  return { html, total: conteo ? Number(conteo[1]) : 0 };
}

function productosDe(html: string, categoria: string): ProductoMayorista[] {
  const salida: ProductoMayorista[] = [];
  // Cada tarjeta del listado es un <li class="... product ...">
  for (const tarjeta of html.split(/<li[^>]*class="[^"]*\bproduct\b[^"]*"/).slice(1)) {
    const nombre = tarjeta.match(/woocommerce-loop-product__title">([^<]+)/);
    const link = tarjeta.match(/href="https:\/\/mayoristas\.merakys\.com\.ar\/producto\/([a-z0-9-]+)\//);
    const precio = precioDe(tarjeta);
    if (!nombre || !link || precio === null) continue;
    salida.push({ nombre: texto(nombre[1]), precio, slug: link[1], categoria });
  }
  return salida;
}

async function traerCategoria(categoria: string): Promise<ProductoMayorista[]> {
  const primera = await pagina(categoria, 1);
  const porPagina = productosDe(primera.html, categoria);
  const paginas = Math.max(1, Math.ceil(primera.total / Math.max(1, porPagina.length)));

  const todos = [...porPagina];
  for (let n = 2; n <= paginas; n++) {
    const { html } = await pagina(categoria, n);
    todos.push(...productosDe(html, categoria));
  }

  // El mismo producto puede aparecer en dos páginas si el mayorista reordena
  // entre un request y el otro: se deduplica por slug, que es su identidad.
  const porSlug = new Map(todos.map((p) => [p.slug, p]));
  console.log(`${categoria}: ${porSlug.size} productos (declara ${primera.total}, ${paginas} páginas)`);
  return [...porSlug.values()];
}

async function main() {
  const categorias = process.argv.slice(2);
  if (!categorias.length) {
    console.error('Uso: npx tsx scripts/traer-merakys.ts <categoria> [categoria...]');
    process.exit(1);
  }

  const todos: ProductoMayorista[] = [];
  for (const c of categorias) todos.push(...(await traerCategoria(c)));

  const porSlug = new Map(todos.map((p) => [p.slug, p]));
  const lista = [...porSlug.values()].sort((a, b) => a.precio - b.precio);

  const salida = 'scripts/data/merakys.json';
  await writeFile(salida, JSON.stringify(lista, null, 2), 'utf8');
  console.log(`\n${lista.length} productos distintos -> ${salida}`);
  console.log(`precios de ${lista[0].precio} a ${lista[lista.length - 1].precio}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
