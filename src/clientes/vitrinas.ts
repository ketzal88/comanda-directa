/** Vitrinas: catálogos sueltos de un cliente, en HTML cerrado, que se sirven
 *  en `/<cliente>/<vitrina>` (ver `app/[cliente]/[vitrina]/route.ts`).
 *
 *  Existen para los catálogos que se armaron fuera de la carta (un artifact
 *  de Claude con sus propias fotos, precios y talles) y que hay que poder
 *  mandar por WhatsApp a cualquiera: el link de un artifact pide cuenta o no
 *  abre en el navegador de Instagram, éste abre en cualquier teléfono.
 *
 *  - El HTML vive en `clientes/vitrinas/<cliente>/<vitrina>.html`, tal cual,
 *    con `__WHATSAPP__` donde va el número del local: la ruta lo completa en
 *    cada request con el que esté cargado en el panel. Si el local cambia de
 *    número, la vitrina lo toma sola.
 *  - Precios y fotos son los del HTML, NO los de la carta. Un cambio de
 *    precio acá es editar el archivo (está en el `<script id="data">`).
 *  - La contra: es un catálogo aparte de la carta, con su propio carrito. Si
 *    se vuelve rutina, los productos van a la carta y la vitrina pasa a ser
 *    un filtro de ella. */
export const VITRINAS: Record<string, string[]> = {
  'party-market': ['mujer', 'parejas', 'accesorios'],
};

/** Vitrinas que se arman en cada request desde hojas de una planilla de
 *  Google, en vez de un HTML cerrado: cambiar un precio es cambiarlo en la
 *  planilla, sin tocar código ni hacer deploy (tarda hasta 5 minutos en
 *  verse, por el cache).
 *
 *  - Todas las pestañas de un cliente se sirven con la MISMA plantilla
 *    (`clientes/vitrinas/<cliente>/<plantilla>.html`) y se cambia de una a
 *    otra sin recargar; cada pestaña tiene su link para mandar suelto.
 *  - `csv(gid)` es la URL de la hoja como CSV. Se lee del lado del servidor,
 *    nunca desde el navegador: las hojas traen columnas internas (precio del
 *    proveedor, costo, ganancia, link) y `logica/vitrina-planilla.ts` las
 *    descarta antes de armar la página.
 *  - Una hoja puede estar en más de una pestaña (bebés va en niña y en niño). */
export type HojaVitrina = { gid: number; titulo: string };
export type PestanaVitrina = { id: string; etiqueta: string; titulo: string; hojas: HojaVitrina[] };
export type VitrinaPlanilla = {
  plantilla: string;
  csv: (gid: number) => string;
  pestanas: PestanaVitrina[];
};

/** `catalogo-minorista-halloween-v2`. Se lee con el export de Google porque
 *  la planilla está compartida por link; si se deja de compartir, publicar
 *  cada hoja como CSV (Archivo > Compartir > Publicar en la web) y cambiar
 *  `csv` por `https://docs.google.com/spreadsheets/d/e/<id publicado>/pub?gid=${gid}&single=true&output=csv`. */
const PLANILLA_PARTY_MARKET = '1NrjjQeQIDaHqJzXnZ36PneYNqmgaMDe-1sq2x7umS1k';

const HOJA = {
  hombre: { gid: 543826381, titulo: 'Hombre' },
  nina: { gid: 2099890287, titulo: 'Niña' },
  nino: { gid: 1982796617, titulo: 'Niño' },
  bebe: { gid: 210371904, titulo: 'Bebé' },
} satisfies Record<string, HojaVitrina>;

export const VITRINAS_PLANILLA: Record<string, VitrinaPlanilla> = {
  'party-market': {
    plantilla: 'disfraces',
    csv: (gid) =>
      `https://docs.google.com/spreadsheets/d/${PLANILLA_PARTY_MARKET}/export?format=csv&gid=${gid}`,
    pestanas: [
      { id: 'hombre', etiqueta: 'Hombre', titulo: 'Disfraces de hombre', hojas: [HOJA.hombre] },
      { id: 'nina', etiqueta: 'Niña', titulo: 'Disfraces de niña', hojas: [HOJA.nina, HOJA.bebe] },
      { id: 'nino', etiqueta: 'Niño', titulo: 'Disfraces de niño', hojas: [HOJA.nino, HOJA.bebe] },
    ],
  },
};

/** La pestaña que pide la URL, sin acentos: `/niña` y `/nina` son la misma. */
export function pestanaDeVitrina(slug: string, vitrina: string): PestanaVitrina | null {
  if (!Object.hasOwn(VITRINAS_PLANILLA, slug)) return null;
  const id = vitrina.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return VITRINAS_PLANILLA[slug].pestanas.find((p) => p.id === id) ?? null;
}
