import 'server-only';
import type { VitrinaPlanilla } from '@/clientes/vitrinas';
import {
  agruparDisfraces,
  leerHoja,
  linkPorDisfraz,
  type Disfraz,
  type FilaConFuente,
} from '@/logica/vitrina-planilla';

/** Cada cuánto se vuelve a pedir una hoja. Un precio cambiado en la planilla
 *  tarda hasta esto en verse; si Google falla en el medio, sigue la copia
 *  anterior (el cache de `fetch` no se pisa con un error). */
const REFRESCO_SEGUNDOS = 300;

async function traerHoja(url: string): Promise<FilaConFuente[]> {
  const res = await fetch(url, { next: { revalidate: REFRESCO_SEGUNDOS } });
  if (!res.ok) throw new Error(`hoja HTTP ${res.status}`);
  const texto = await res.text();
  // Si la planilla deja de estar compartida, Google responde 200 con la
  // pantalla de login en HTML: eso no es una hoja vacía, es un error.
  if (/^\s*<(!doctype|html)/i.test(texto)) throw new Error('la hoja no es pública');
  return leerHoja(texto);
}

/** Todas las hojas de la vitrina, una sola vez cada una aunque estén en dos
 *  pestañas. */
export async function leerHojasVitrina(v: VitrinaPlanilla): Promise<Map<number, FilaConFuente[]>> {
  const gids = [...new Set(v.pestanas.flatMap((p) => p.hojas.map((h) => h.gid)))];
  const filas = await Promise.all(gids.map((gid) => traerHoja(v.csv(gid))));
  return new Map(gids.map((gid, i) => [gid, filas[i]]));
}

export type DatosVitrina = {
  pestanas: { id: string; etiqueta: string; titulo: string; secciones: { titulo: string; disfraces: string[] }[] }[];
  disfraces: Record<string, Disfraz>;
};

/** Lo que viaja al navegador: nombres, talles, los dos precios, el código y
 *  si es por encargo. Nada más (ver `Disfraz`). */
export function armarDatosVitrina(v: VitrinaPlanilla, hojas: Map<number, FilaConFuente[]>): DatosVitrina {
  const disfraces: Record<string, Disfraz> = {};
  const pestanas = v.pestanas.map((p) => ({
    id: p.id,
    etiqueta: p.etiqueta,
    titulo: p.titulo,
    secciones: p.hojas
      .map((h) => {
        const grupo = agruparDisfraces(hojas.get(h.gid) ?? []);
        for (const d of grupo) disfraces[d.s] ??= d;
        return { titulo: h.titulo, disfraces: grupo.map((d) => d.s) };
      })
      .filter((s) => s.disfraces.length),
  }));
  return { pestanas, disfraces };
}

/** El link de la página de un disfraz, buscado en todas las hojas de la
 *  vitrina. Para la ruta de fotos. */
export async function linkDeDisfraz(v: VitrinaPlanilla, slug: string): Promise<string | null> {
  const hojas = await leerHojasVitrina(v);
  for (const filas of hojas.values()) {
    const link = linkPorDisfraz(filas).get(slug);
    if (link) return link;
  }
  return null;
}
