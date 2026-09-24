/** Formatea un entero de pesos como "$32.000". El formateo es
 *  responsabilidad de la pantalla; el dato guardado es siempre el entero. */
export function formatearPrecio(pesos: number): string {
  return '$' + pesos.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

/** Lee un precio escrito por una persona en una planilla o un formulario.
 *  Devuelve null si no hay un precio válido, para que quien llama pueda
 *  reportar el error en vez de escribir un 0 silencioso. */
export function parsearPrecio(texto: string): number | null {
  const limpio = texto.trim().replace(/[$\s]/g, '');
  if (!limpio) return null;
  // separador decimal es la coma en es-AR: se descartan los centavos
  const soloEnteros = limpio.split(',')[0].replace(/\./g, '');
  if (!/^\d+$/.test(soloEnteros)) return null;
  const valor = Number(soloEnteros);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

/** Cómo se nombra el costo de una zona de envío. Los tres casos de
 *  `ZonaEnvio.precio` en un solo lugar: si cada pantalla los resuelve por su
 *  cuenta, alguna va a mostrar "$0" donde dice "sin cargo", o "sin cargo"
 *  donde nadie cotizó nada todavía. */
export function textoEnvio(precio: number | null): string {
  if (precio === null) return 'a convenir';
  return precio > 0 ? formatearPrecio(precio) : 'sin cargo';
}
