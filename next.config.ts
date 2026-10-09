import type { NextConfig } from 'next';
import { SLUGS_RENOMBRADOS } from './src/logica/slugs-renombrados';

/** Se desvía con 307 y no con 308 a propósito. Un 308 lo cachea el navegador
 *  para siempre, así que el slug viejo quedaría quemado aunque después se
 *  borre la línea; acá no hay SEO que cuidar (los links se reparten por
 *  WhatsApp), y sí conviene poder reusar un slug de temporada el año que
 *  viene. Los slugs, en `src/logica/slugs-renombrados.ts`. */
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
