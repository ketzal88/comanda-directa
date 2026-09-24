/** El convenio de nombres de las fotos de esta plantilla.
 *
 *  `scripts/fotos-halloween.ts` sube dos archivos por producto: la mini
 *  (360px), que es la que guarda `items.foto_url` porque es la que muestra
 *  la carta, y la grande (900px) al lado, con `@900` antes de la extensión.
 *  El modal es el único que pide la grande, y recién cuando alguien lo abre.
 *
 *  El convenio vive acá y no repartido por los componentes: es la única
 *  pieza que hay que tocar si mañana las fotos se guardan de otra forma. */

const SUFIJO_GRANDE = '@900';

/** La versión grande de una foto de esta plantilla. Si la URL no sigue el
 *  convenio —una foto pegada a mano en el panel, por ejemplo— devuelve la
 *  misma: mostrar la mini agrandada es feo, pero un 404 es peor. */
export function fotoGrande(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.endsWith('.webp') ? `${url.slice(0, -'.webp'.length)}${SUFIJO_GRANDE}.webp` : url;
}
