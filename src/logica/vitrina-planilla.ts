import { parsearPrecio } from './precio';

/** Vitrinas que se arman en cada request desde hojas de una planilla de
 *  Google (ver `clientes/vitrinas.ts`). Acá está sólo lo que no toca la red:
 *  leer el CSV, quedarse con las columnas que se pueden mostrar y agrupar
 *  los talles de cada disfraz.
 *
 *  Las hojas traen columnas del proveedor (su precio, el link a su página,
 *  el costo y la ganancia). Ninguna sale de este módulo hacia el navegador:
 *  `Fila` sólo tiene lo que se muestra, y el link viaja aparte, en
 *  `FilaConFuente`, para que la ruta de fotos lo use del lado del servidor. */

export type Talle = {
  /** Lo que se ve en el selector, tal cual la planilla: "S (5-6 años)". */
  t: string;
  /** Precio efectivo o transferencia. */
  e: number;
  /** Precio con tarjeta. */
  tj: number;
  /** Código interno: va en el pedido para que el local sepa qué preparar.
   *  Vacío si la hoja no tiene la columna. */
  c: string;
};

export type Fila = Talle & { disfraz: string; nota: string };
export type FilaConFuente = Fila & { link: string };

export type Disfraz = {
  /** Nombre como está en la planilla. */
  n: string;
  /** Slug del nombre: arma la URL de la foto y la clave del carrito. */
  s: string;
  /** "Por pedido" en la columna Nota: se muestra "Por encargo". */
  encargo: boolean;
  tal: Talle[];
};

const COLUMNA = {
  disfraz: 'disfraz',
  talle: 'talle',
  efectivo: 'precio efectivo / transferencia',
  tarjeta: 'precio con tarjeta',
  codigo: 'código',
  nota: 'nota',
  link: 'link',
} as const;

/** CSV completo a filas, con comillas dobles y saltos de línea adentro de
 *  un campo (una Nota larga puede traerlos). */
export function leerCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let enComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') enComillas = false;
      else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += c;
  }
  if (campo || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.map((f) => f.map((x) => x.trim()));
}

const normalizarEncabezado = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** Una hoja a filas. Se busca cada columna por su encabezado y no por su
 *  posición: la de hombre no tiene Código ni Nota, y alguien puede sumar o
 *  mover columnas sin avisar. Las filas sin nombre, sin talle o sin los dos
 *  precios se saltean (renglones vacíos o a medio cargar). */
export function leerHoja(csv: string): FilaConFuente[] {
  const [encabezado, ...resto] = leerCsv(csv);
  if (!encabezado) return [];
  const pos = new Map(encabezado.map((h, i) => [normalizarEncabezado(h), i]));
  const celda = (fila: string[], col: string) => {
    const i = pos.get(col);
    return i === undefined ? '' : (fila[i] ?? '');
  };

  const filas: FilaConFuente[] = [];
  for (const f of resto) {
    const disfraz = celda(f, COLUMNA.disfraz);
    const t = celda(f, COLUMNA.talle);
    const e = parsearPrecio(celda(f, COLUMNA.efectivo));
    const tj = parsearPrecio(celda(f, COLUMNA.tarjeta));
    if (!disfraz || !t || e == null || tj == null) continue;
    filas.push({
      disfraz,
      t,
      e,
      tj,
      c: celda(f, COLUMNA.codigo),
      nota: celda(f, COLUMNA.nota),
      link: celda(f, COLUMNA.link),
    });
  }
  return filas;
}

export function slugDisfraz(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const esPorPedido = (nota: string) => /por\s+pedido/i.test(nota);

/** Una fila por talle → una tarjeta por disfraz, en el orden en que aparece
 *  por primera vez. Si el mismo talle está dos veces, gana la primera. */
export function agruparDisfraces(filas: Fila[]): Disfraz[] {
  const porSlug = new Map<string, Disfraz>();
  for (const f of filas) {
    const s = slugDisfraz(f.disfraz);
    let d = porSlug.get(s);
    if (!d) {
      d = { n: f.disfraz, s, encargo: false, tal: [] };
      porSlug.set(s, d);
    }
    if (esPorPedido(f.nota)) d.encargo = true;
    if (!d.tal.some((x) => x.t === f.t)) d.tal.push({ t: f.t, e: f.e, tj: f.tj, c: f.c });
  }
  return [...porSlug.values()];
}

/** El link de la página del producto, por disfraz: el del primer talle que
 *  tenga uno. Sólo para la ruta de fotos, nunca para el navegador. */
export function linkPorDisfraz(filas: FilaConFuente[]): Map<string, string> {
  const links = new Map<string, string>();
  for (const f of filas) {
    const s = slugDisfraz(f.disfraz);
    if (f.link && !links.has(s)) links.set(s, f.link);
  }
  return links;
}

/** La foto que la página del producto declara para compartir (`og:image`).
 *  Sólo se acepta si está en el mismo sitio que la página: el link sale de
 *  la planilla, pero lo que devuelve esa página no. */
export function fotoDePagina(html: string, urlPagina: string): string | null {
  const crudo =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1];
  if (!crudo) return null;
  try {
    const foto = new URL(crudo, urlPagina);
    return foto.protocol === 'https:' && foto.host === new URL(urlPagina).host ? foto.href : null;
  } catch {
    return null;
  }
}
