/** Clientes que cambiaron de slug, con su nombre viejo a la izquierda.
 *
 *  El slug es la URL del cliente y, una vez impreso en un QR o mandado por
 *  WhatsApp, deja de ser nuestro: renombrarlo sin dejar el desvío es romperle
 *  el link a todos los que ya lo tienen, y en un catálogo de temporada eso es
 *  justo la gente que está por comprar.
 *
 *  Lo usan dos lados:
 *  - `next.config.ts` desvía el viejo al nuevo (307, ver ahí por qué).
 *  - `datos/carta-repo.ts` encuentra al cliente por el nuevo aunque en la
 *    base siga con el viejo. Eso deja renombrar sin orden de pasos: la base
 *    puede cambiar antes o después del deploy, o nunca, y la URL nueva anda
 *    igual. Cambiar la base ANTES del deploy sí rompe: el código publicado
 *    todavía busca el slug viejo. */
export const SLUGS_RENOMBRADOS: Record<string, string> = {
  halloween: 'party-market',
  'piedro-shop': 'party-market',
};

/** Los slugs viejos que hoy apuntan a este. */
export function slugsAnteriores(slug: string): string[] {
  return Object.entries(SLUGS_RENOMBRADOS)
    .filter(([, nuevo]) => nuevo === slug)
    .map(([viejo]) => viejo);
}
