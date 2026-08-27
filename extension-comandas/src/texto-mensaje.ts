/** Dentro de la fila del mensaje, el nodo que tiene SOLO el texto que
 *  escribió quien mandó el mensaje. La hora y el check de leído viven
 *  fuera de él, así que no se cuelan en el texto. */
const SELECTOR_TEXTO = '.copyable-text';

/** El texto del mensaje tal como lo escribió quien lo mandó.
 *
 *  Va por `textContent` y NO por `innerText`: `innerText` devuelve el texto
 *  como se ve, y WhatsApp Web arma cada línea del mensaje como un `<span>`
 *  aparte, así que le mete un salto de línea de más entre TODAS las líneas
 *  — no solo entre bloques. Con eso, "Delivery" y el nombre de quien pidió
 *  (que van en líneas seguidas) quedan separados por una línea en blanco y
 *  `partirBloques()` los toma como dos bloques distintos: el parser no
 *  encuentra el nombre y descarta el pedido entero. `textContent` respeta
 *  los saltos de línea originales.
 *
 *  Se lee solo el `.copyable-text` para no arrastrar el título del ícono de
 *  la colita del globo ("tail-out"), que está afuera; y se descuentan los
 *  nodos `aria-hidden` de adentro, que traen una copia de la hora pegada al
 *  final de la última línea (dejaría "no hacer12:33 a. m." en las
 *  aclaraciones). */
export function textoDelMensaje(mensaje: HTMLElement): string {
  // `matches` primero: el elemento que se recibe puede ser la fila entera del
  // mensaje (y entonces el contenedor del texto está adentro) o el contenedor
  // del texto en sí, segun por donde lo encontro el escaneo.
  const contenedor = mensaje.matches(SELECTOR_TEXTO)
    ? mensaje
    : mensaje.querySelector<HTMLElement>(SELECTOR_TEXTO);
  if (!contenedor) return '';

  const copia = contenedor.cloneNode(true) as HTMLElement;
  copia.querySelectorAll('[aria-hidden="true"]').forEach((oculto) => oculto.remove());
  // Nuestro propio boton, si quedo adentro del contenedor: sin esto, su
  // texto ("Imprimir comanda") se sumaria al del pedido y lo desvirtuaria.
  copia.querySelectorAll('.comanda-cocina-boton').forEach((propio) => propio.remove());
  return copia.textContent ?? '';
}
