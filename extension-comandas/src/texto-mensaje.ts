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

/** El JID del chat, cuando el build de WhatsApp lo pone en la fila:
 *  `false_5493415550000@c.us_3EB0…` en un chat individual, y en un grupo el de
 *  quien escribió va al final, así que el mismo patrón sirve para los dos.
 *
 *  No siempre está: en la captura del DOM real que usa `texto-mensaje.test.ts`
 *  el `data-id` de la fila es solo el id del mensaje (`3EB07DC7F82…`). Por eso
 *  hay un segundo camino abajo. */
const JID = /(\d{7,15})@c\.us/;

/** El encabezado que WhatsApp deja para copiar y pegar:
 *  `[12:33 a. m., 26/8/2026] +54 9 341 555-0000: `. Lo que va después del
 *  corchete es el remitente, y cuando el contacto NO está agendado ese
 *  remitente ES el número — que es el caso normal de un restaurante, donde
 *  casi ningún comensal está en la agenda del local. Con el contacto agendado
 *  ahí dice el nombre y esto devuelve `null`, como debe ser: un nombre en el
 *  renglón del teléfono es peor que un renglón vacío. */
const REMITENTE = /^\[[^\]]*\]\s*([^:]+):/;

function pareceTelefono(texto: string): boolean {
  if (!/^\+[\d\s().-]+$/.test(texto)) return false;
  return (texto.match(/\d/g) ?? []).length >= 8;
}

/** De dónde sale el número cuando el mensaje no lo trae.
 *
 *  Es un RESPALDO, no la fuente: lo que manda es el campo que completó el
 *  comensal en la carta. El chat puede ser el de un tercero que reenvía el
 *  pedido, y el DOM de WhatsApp es de Meta y cambia sin aviso. Cuando no se
 *  puede leer devuelve `null` y la comanda sale igual, sin el renglón del
 *  teléfono: quedarse sin imprimir por un número sería muchísimo peor que
 *  imprimir sin él. */
export function telefonoDelChat(mensaje: HTMLElement): string | null {
  const conId =
    mensaje.closest<HTMLElement>('[data-id]') ?? mensaje.querySelector<HTMLElement>('[data-id]');
  const jid = JID.exec(conId?.getAttribute('data-id') ?? '');
  if (jid) return `+${jid[1]}`;

  const conEncabezado = mensaje.matches('[data-pre-plain-text]')
    ? mensaje
    : mensaje.querySelector<HTMLElement>('[data-pre-plain-text]');
  const remitente = REMITENTE.exec(conEncabezado?.getAttribute('data-pre-plain-text') ?? '');
  const candidato = remitente?.[1].trim() ?? '';
  return pareceTelefono(candidato) ? candidato : null;
}
