import type { Metadata, Viewport } from 'next';
import './globals.css';

/** El dominio público. `metadataBase` es lo que le permite a Next convertir
 *  las URLs relativas de `openGraph` en absolutas: WhatsApp y los demás
 *  scrapers descartan un `og:image` relativo. */
const SITIO = new URL('https://www.hace-tu-pedido.site');

export const metadata: Metadata = {
  metadataBase: SITIO,
  // Este título es el de ÚLTIMO recurso: la landing y la carta de cada
  // cliente traen el suyo. Queda el nombre público y no "Comanda Directa",
  // que es el nombre del repo y no lo tiene que ver nadie de afuera.
  title: 'Hacé tu pedido',
  description: 'Pedidos por WhatsApp con catálogo online e impresión de tickets.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
