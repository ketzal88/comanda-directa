import { Caprasimo, Figtree, IBM_Plex_Mono } from 'next/font/google';

/** Las tres tipografías del design system "organic" del artboard:
 *  Caprasimo para los títulos, Figtree para el texto y IBM Plex Mono para el
 *  ticket de la impresora, que es lo único que tiene que parecer impreso.
 *
 *  Se cargan con `next/font` y no con el `<link>` a Google Fonts del
 *  artboard: se sirven desde el mismo dominio, sin un request a
 *  fonts.googleapis.com bloqueando el primer render. */

export const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--l-fuente-texto',
  display: 'swap',
});

export const caprasimo = Caprasimo({
  subsets: ['latin'],
  weight: '400',
  variable: '--l-fuente-titulo',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--l-fuente-mono',
  display: 'swap',
});

export const CLASES_FUENTES = `${figtree.variable} ${caprasimo.variable} ${plexMono.variable}`;
