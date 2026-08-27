/** El código que identifica un pedido: seis caracteres que viajan en el
 *  mensaje de WhatsApp. El alfabeto NO tiene `O`/`0` ni `I`/`1` (se dicta por
 *  teléfono y ese es el par que se confunde al leerlo en voz alta), ni
 *  minúsculas.
 *
 *  No es un secreto ni un id de nada acá (no hay historial server-side
 *  todavía): alcanza con que dos pedidos del mismo día no se confundan al
 *  nombrarlos de palabra. */
export const ALFABETO_CODIGO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const LARGO_CODIGO = 6;

/** `Math.random()` y no `crypto`: no es un secreto, y se llama en el render
 *  del navegador antes de armar el enlace de WhatsApp, de forma sincrónica. */
export function generarCodigo(): string {
  let codigo = '';
  for (let i = 0; i < LARGO_CODIGO; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}
