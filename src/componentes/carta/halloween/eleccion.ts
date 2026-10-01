import type { Variante } from '@/logica/tipos';

/** Cómo se le pide al comprador que elija entre las variantes de un producto.
 *
 *  Una capa viene en 80 y 130 cm, no en talle M; el Disfraz completo viene en
 *  "Brujita" o "Esqueleto S 5-6". Decirle "talle" a eso hace dudar de si
 *  falta elegir algo más. */
export function textoEleccion(medidas: Variante[]): { titulo: string; boton: string } {
  if (medidas.some((v) => /\d\s*cm/i.test(v.etiqueta))) {
    return { titulo: 'Elegí la medida', boton: 'Elegir medida' };
  }
  const sonTalles = medidas.every((v) => /^talle\b|^\w{1,3} \(\d/i.test(v.etiqueta));
  return sonTalles
    ? { titulo: 'Elegí el talle', boton: 'Elegir talle' }
    : { titulo: 'Elegí una opción', boton: 'Elegir opción' };
}
