import { Creepster, Fredoka, Patrick_Hand } from 'next/font/google';

/** Las tres tipografías del artboard, cada una con un trabajo:
 *
 *  - **Fredoka** es el texto: nombres de producto, precios, botones.
 *  - **Patrick Hand** es la letra manuscrita de los globitos y los
 *    subtítulos, la que hace que el catálogo parezca hecho a mano y no
 *    generado.
 *  - **Creepster** es SOLO el título "Halloween" y el "Especiales" de los
 *    combos. Es ilegible en párrafos; en dos palabras grandes es la marca.
 *
 *  Se cargan con `next/font` y no con el `<link>` a Google Fonts del
 *  artboard: `next/font` las sirve desde el mismo dominio, sin request a
 *  fonts.googleapis.com bloqueando el primer render, y con `display: swap`
 *  el texto se lee desde el primer cuadro.
 *
 *  Van como variables CSS para que `globals.css` las use desde el bloque
 *  `.halloween` y el JSX no tenga que repartir `className` de fuente. */

export const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--h-fuente',
  display: 'swap',
});

export const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--h-fuente-mano',
  display: 'swap',
});

export const creepster = Creepster({
  subsets: ['latin'],
  weight: '400',
  variable: '--h-fuente-terror',
  display: 'swap',
});

export const CLASES_FUENTES = `${fredoka.variable} ${patrickHand.variable} ${creepster.variable}`;
