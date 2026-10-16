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
