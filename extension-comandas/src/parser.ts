import { parsearPrecio } from '../../src/logica/precio';
import { MEDIOS_DE_PAGO } from '../../src/logica/tipos';
import type { MedioDePago, Modalidad } from '../../src/logica/tipos';
import { ETIQUETA_MODALIDAD } from '../../src/logica/whatsapp';

/** La misma `Modalidad` del sitio, no una copia. El alias se mantiene porque
 *  ya lo usan los tests y el resto del paquete. */
export type ModalidadReconocida = Modalidad;

/** Un renglón del pedido, con su plata ya separada del texto.
 *
 *  `texto` es la línea COMPLETA, tal como vino (con la cola de precio incluida):
 *  es lo que la comanda imprime cuando el local no toca nada. `importe` es el
 *  mismo número pero usable para calcular, y `null` cuando la línea dice
 *  "a confirmar" — que NO es lo mismo que cero (ver `cuenta.ts`). */
export type ItemParseado = {
  texto: string;
  importe: number | null;
};

/** La zona y el monto tal como viajaron en el mensaje. La extensión no lee la
 *  config del panel, así que el monto del texto es su única fuente. */
export type EnvioParseado = {
  zona: string;
  precio: number;
};

export type PedidoParseado = {
  /** La línea de modalidad tal cual llegó (p. ej. "En el salón · Mesa 5").
   *   Se guarda siempre, incluso cuando `modalidad` no se pudo identificar:
   *   la comanda de cocina la muestra tal cual antes que dejarla en blanco. */
  lineaContacto: string;
  modalidad: ModalidadReconocida | null;
  /** Solo tiene valor cuando `modalidad === 'salon'`. */
  mesa: string | null;
  nombre: string;
  /** Solo presente en delivery. */
  direccion: string | null;
  /** Un renglón por línea de pedido, con el importe ya separado. */
  items: ItemParseado[];
  /** El texto que sigue a "Total: ", tal cual (p. ej. "$21.300" o "a confirmar"). */
  total: string;
  aclaraciones: string | null;
  /** Cómo dijo el comensal que paga. `null` cuando el mensaje no lo trae (los
   *  mensajes viejos no lo traen) o cuando el valor no es uno de los conocidos:
   *  no se inventa un medio de pago que después se guardaría como cobrado. */
  medioDePago: MedioDePago | null;
  envio: EnvioParseado | null;
  /** El monto del descuento por retiro, ya resuelto en el mensaje. Entero en
   *  pesos, `null` cuando no vino. El tipo de descuento (porcentaje o monto) no
   *  viaja: al local le alcanza el monto, y la ruta de confirmación lo recibe
   *  envuelto como `{ tipo: 'monto' }`. */
  descuentoRetiro: number | null;
  /** El código del registro, sin el `#`. Todavía no lo emite ningún mensaje
   *  (llega con el registro de pedidos): se reconoce desde ahora para que un
   *  mensaje con código no imprima "Pedido #A7F3K2" como si fuera un plato. */
  codigo: string | null;
};

const ANCLA = 'Pedido — Sagrado Sushi';
const PREFIJO_DIRECCION = 'Dirección: ';
const PREFIJO_TOTAL = 'Total: ';
const PREFIJO_ACLARACIONES = 'Aclaraciones: ';
const PREFIJO_MESA = 'Mesa ';
const PREFIJO_PAGO = 'Pago: ';
const PREFIJO_ENVIO = 'Envío: ';
const PREFIJO_DESCUENTO = 'Descuento: ';
/** Con el numeral, no `Pedido ` a secas: sin el `#`, el ancla del mensaje
 *  ("Pedido — Sagrado Sushi") también empieza con ese prefijo. */
const PREFIJO_CODIGO = 'Pedido #';

/** Lo que separa el texto de su plata, tanto en los ítems como en el envío y el
 *  descuento. Se parte por el ÚLTIMO, porque un nombre de plato puede tenerlo
 *  adentro ("1 × Roll — especial — $9.000"). */
const SEPARADOR_IMPORTE = ' — ';
/** Lo que escribe el mensaje cuando el plato no tiene precio en la carta. */
const TEXTO_A_CONFIRMAR = 'a confirmar';
/** Lo que escribe el mensaje para una zona de envío en cero. Es un cero
 *  conocido, no un dato faltante: el mensaje no escribe "$0" nunca. */
const TEXTO_SIN_CARGO = 'sin cargo';

function partirBloques(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((bloque) => bloque.trim())
    .filter(Boolean);
}

/** Parte una línea en su texto y la cola que viene después del último ` — `.
 *  `cola` es `null` cuando no hay separador: eso es una línea sin plata, no una
 *  línea en cero. */
function partirImporte(linea: string): { texto: string; cola: string | null } {
  const corte = linea.lastIndexOf(SEPARADOR_IMPORTE);
  if (corte === -1) return { texto: linea, cola: null };
  return {
    texto: linea.slice(0, corte),
    cola: linea.slice(corte + SEPARADOR_IMPORTE.length),
  };
}

/** El renglón sin su cola de plata.
 *
 *  Se exporta porque el formulario de cobro arma las líneas con las que el
 *  ticket vuelve a escribir cada renglón (un renglón bonificado sale en $0), y
 *  nadie tiene que volver a partir la línea por su cuenta: el corte vive acá. */
export function textoSinImporte(linea: string): string {
  return partirImporte(linea).texto;
}

/** El importe de una cola de línea. `null` es "a confirmar", y también lo que
 *  se devuelve si la cola no es un precio legible: preferimos decir que no se
 *  sabe antes que imprimir un cero que nadie decidió. */
function importeDeLaCola(cola: string | null): number | null {
  if (cola === null) return null;
  if (cola.trim() === TEXTO_A_CONFIRMAR) return null;
  return parsearPrecio(cola);
}

/** La modalidad, reconocida contra la MISMA tabla que usa el sitio para
 *  escribirla (`ETIQUETA_MODALIDAD`), no contra una copia.
 *
 *  Esto es plata, no prolijidad: `calcularCuenta` aplica el descuento por
 *  retiro solo si la modalidad es `retiro`, así que con dos tablas que se
 *  desfasen el descuento que viajó resuelto en el mensaje se evapora del total
 *  impreso y la comanda SOBRECOBRA (se midió: $33.800 en el papel contra los
 *  $30.420 que vio el comensal). Con una sola tabla, desfasarse es imposible. */
function reconocerModalidad(lineaContacto: string): {
  modalidad: ModalidadReconocida | null;
  mesa: string | null;
} {
  const segmentos = lineaContacto.split(' · ');
  const etiqueta = segmentos[0];
  const modalidad =
    (Object.keys(ETIQUETA_MODALIDAD) as ModalidadReconocida[]).find(
      (candidata) => ETIQUETA_MODALIDAD[candidata] === etiqueta,
    ) ?? null;

  if (modalidad === 'salon' && segmentos[1]?.startsWith(PREFIJO_MESA)) {
    return { modalidad, mesa: segmentos[1].slice(PREFIJO_MESA.length) };
  }
  return { modalidad, mesa: null };
}

function reconocerMedioDePago(valor: string): MedioDePago | null {
  const limpio = valor.trim();
  return MEDIOS_DE_PAGO.find((medio) => medio === limpio) ?? null;
}

/** "Zona 2 — $3.000" o "Centro — sin cargo".
 *
 *  El bloque llega igual cuando la zona no tiene cargo, y eso es a propósito: es
 *  la única forma de que el nombre de la zona llegue al ticket del cadete. Por
 *  eso "sin cargo" es 0 y no `null`, y por eso una cola ilegible también cae en
 *  0 en vez de descartar el bloque entero: perder el monto se arregla en el
 *  formulario, perder la zona no. */
function reconocerEnvio(valor: string): EnvioParseado {
  const { texto, cola } = partirImporte(valor);
  const zona = texto.trim();
  if (cola === null || cola.trim() === TEXTO_SIN_CARGO) return { zona, precio: 0 };
  return { zona, precio: parsearPrecio(cola) ?? 0 };
}

/** Convierte el texto plano de un mensaje de WhatsApp Web en los datos del
 *  pedido, o `null` si el texto no es un mensaje de pedido de esta carta
 *  (no tiene el encabezado fijo que pone `armarMensaje()` en
 *  `src/logica/whatsapp.ts` del repo principal).
 *
 *  Todos los campos de plata son opcionales: los mensajes que ya están en el
 *  chat del local no los traen y tienen que seguir imprimiéndose igual. */
export function parsearMensaje(texto: string): PedidoParseado | null {
  const bloques = partirBloques(texto);
  const indiceAncla = bloques.indexOf(ANCLA);
  if (indiceAncla === -1) return null;

  const resto = bloques.slice(indiceAncla + 1);
  const [lineaContacto, nombre] = (resto[0] ?? '').split('\n');
  if (!lineaContacto || !nombre) return null;

  const { modalidad, mesa } = reconocerModalidad(lineaContacto);

  let direccion: string | null = null;
  let total = '';
  let aclaraciones: string | null = null;
  let medioDePago: MedioDePago | null = null;
  let envio: EnvioParseado | null = null;
  let descuentoRetiro: number | null = null;
  let codigo: string | null = null;
  const bloquesDeItems: string[] = [];

  for (const bloque of resto.slice(1)) {
    if (bloque.startsWith(PREFIJO_DIRECCION)) {
      direccion = bloque.slice(PREFIJO_DIRECCION.length);
    } else if (bloque.startsWith(PREFIJO_TOTAL)) {
      total = bloque.slice(PREFIJO_TOTAL.length);
    } else if (bloque.startsWith(PREFIJO_ACLARACIONES)) {
      aclaraciones = bloque.slice(PREFIJO_ACLARACIONES.length);
      // Los cuatro de abajo van ANTES de la rama que cae en ítems, que es lo
      // único que evita que "Pago: transferencia" se imprima como un plato.
    } else if (bloque.startsWith(PREFIJO_PAGO)) {
      medioDePago = reconocerMedioDePago(bloque.slice(PREFIJO_PAGO.length));
    } else if (bloque.startsWith(PREFIJO_ENVIO)) {
      envio = reconocerEnvio(bloque.slice(PREFIJO_ENVIO.length));
    } else if (bloque.startsWith(PREFIJO_DESCUENTO)) {
      // del descuento solo interesa el monto ya resuelto; el detalle
      // ("retiro 10%") es para que lo lea una persona
      descuentoRetiro = importeDeLaCola(partirImporte(bloque).cola);
    } else if (bloque.startsWith(PREFIJO_CODIGO)) {
      codigo = bloque.slice(PREFIJO_CODIGO.length).trim();
    } else {
      bloquesDeItems.push(bloque);
    }
  }

  const items = bloquesDeItems
    .flatMap((bloque) => bloque.split('\n'))
    .map((linea) => ({ texto: linea, importe: importeDeLaCola(partirImporte(linea).cola) }));

  return {
    lineaContacto,
    modalidad,
    mesa,
    nombre,
    direccion,
    items,
    total,
    aclaraciones,
    medioDePago,
    envio,
    descuentoRetiro,
    codigo,
  };
}
