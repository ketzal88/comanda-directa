import type { NextConfig } from 'next';

/** Clientes que cambiaron de slug, con su nombre viejo a la izquierda.
 *
 *  El slug es la URL del cliente y, una vez impreso en un QR o mandado por
 *  WhatsApp, deja de ser nuestro: renombrarlo sin dejar el desvío es romperle
 *  el link a todos los que ya lo tienen, y en un catálogo de temporada eso es
 *  justo la gente que está por comprar.
 *
 *  Se desvía con 307 y no con 308 a propósito. Un 308 lo cachea el navegador
 *  para siempre, así que el slug viejo quedaría quemado aunque después se
 *  borre esta línea; acá no hay SEO que cuidar (los links se reparten por
 *  WhatsApp), y sí conviene poder reusar un slug de temporada el año que
 *  viene. */
const SLUGS_RENOMBRADOS: Record<string, string> = {
  halloween: 'piedro-shop',
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(SLUGS_RENOMBRADOS).flatMap(([viejo, nuevo]) => [
      { source: `/${viejo}`, destination: `/${nuevo}`, permanent: false },
      // el panel y cualquier otra subruta del cliente
      { source: `/${viejo}/:resto*`, destination: `/${nuevo}/:resto*`, permanent: false },
    ]);
  },
};

export default nextConfig;
