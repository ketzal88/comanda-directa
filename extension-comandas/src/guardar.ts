import { HEADER_CLAVE } from '../../src/logica/clave-panel';
import { esCodigoValido } from '../../src/logica/codigo-pedido';
import type { Descuento, MedioDePago, Modalidad } from '../../src/logica/tipos';
import type { Ajustes } from './ajustes';
import { textoSinImporte } from './parser';
import type { PedidoParseado } from './parser';
import type { Cobro } from './ticket';

/** El guardado del pedido confirmado, sin nada de Chrome adentro.
 *
 *  Todo lo que decide QUÉ se manda y A DÓNDE vive acá, con el `fetch` inyectado:
 *  es lo único de la extensión que puede escribir en la base del local, así que
 *  tiene que poder probarse sin abrir un navegador. El service worker
 *  (`worker.ts`) es una cáscara que lee el storage y llama a esto. */

/** Lo mínimo de `fetch` que se usa. El `fetch` real cumple este tipo; el de los
 *  tests es una función de tres líneas. */
export type OpcionesHttp = {
  method: string;
  headers: Record<string, string>;
  body?: string;
};

export type RespuestaHttp = {
  status: number;
  json: () => Promise<unknown>;
};

export type Traer = (url: string, opciones?: OpcionesHttp) => Promise<RespuestaHttp>;

export type Dependencias = {
  traer: Traer;
  /** Inyectado para que el test pueda fijar el código del fallback. */
  generarCodigo: () => string;
};

export type ResultadoDeGuardado =
  | {
      ok: true;
      /** Con el que quedó guardado. Puede NO ser el del mensaje. */
      codigo: string;
      /** `true` si esta llamada creó el registro. */
      creado: boolean;
      /** El que traía el mensaje, si traía uno válido. Cuando no es igual a
       *  `codigo`, el que el comensal tiene anotado ya no encuentra el pedido y
       *  hay que avisarle al local. */
      codigoDelMensaje: string | null;
    }
  | { ok: false; motivo: string };

export type ResultadoDeConexion = { ok: true } | { ok: false; motivo: string };

/** Lo que el content script le manda al service worker. El POST sale del
 *  worker y no de la página: desde el content script el `fetch` llevaría el
 *  origen `web.whatsapp.com` y habría que resolver CORS en la ruta; desde el
 *  worker, con `host_permissions`, no hay preflight que atender. */
export const MENSAJE_GUARDAR = 'guardar-pedido';

export type SolicitudDeGuardado = {
  tipo: typeof MENSAJE_GUARDAR;
  pedido: PedidoParseado;
  cobro: Cobro;
};

/** El worker escucha TODOS los mensajes de la extensión: los que no son una
 *  solicitud de guardado se dejan pasar sin tocar. */
export function esSolicitudDeGuardado(mensaje: unknown): mensaje is SolicitudDeGuardado {
  if (!mensaje || typeof mensaje !== 'object') return false;
  const posible = mensaje as Partial<SolicitudDeGuardado>;
  return posible.tipo === MENSAJE_GUARDAR && !!posible.pedido && !!posible.cobro;
}

/** El cuerpo del POST de confirmación.
 *
 *  Trae SIEMPRE los datos del pedido además de los del cobro, porque la ruta
 *  hace upsert: si el documento no existe (el fallback del diseño), este mismo
 *  cuerpo es el alta. Si existe, la ruta escribe solo los campos de cobro y el
 *  resto se ignora. No trae `codigo` a propósito: el código es el de la URL. */
export type CuerpoDeConfirmacion = {
  lineas: { texto: string; importe: number | null }[];
  modalidad: Modalidad | null;
  nombre: string;
  mesa: string;
  direccion: string;
  notas: string;
  /** Lo que eligió el comensal en la carta. */
  pagoElegido: MedioDePago | null;
  envioElegido: { zona: string; precio: number } | null;
  /** Lo que decidió el local en el formulario de cobro. */
  medioDePago: MedioDePago | null;
  envio: { zona: string; precio: number } | null;
  descuentoManual: Descuento;
  descuentoRetiro: Descuento;
  bonificadas: number[];
  codigoDelMensaje?: string;
};

const FALTA_CONFIGURAR =
  'Falta cargar la dirección del sitio y la clave en las opciones de la extensión.';
const CLAVE_RECHAZADA = 'El sitio rechazó la clave del panel. Revisala en las opciones.';
const SIN_CONEXION = 'No se pudo conectar con el sitio.';
const DIRECCION_EQUIVOCADA =
  'El sitio contesta, pero en esa dirección no está la carta. Tiene que ser la misma con la que se entra al panel.';

/** Un código con forma válida que casi seguro no existe, para el botón de
 *  probar conexión. Tiene que pasar `esCodigoValido()`: si fuera cualquier
 *  cosa, la ruta contestaría 404 sin llegar a mirar la clave y la prueba no
 *  probaría nada. */
const CODIGO_DE_PRUEBA = 'ZZZZZZ';

/** La dirección lista para pegarle rutas, o `null` si no sirve.
 *
 *  La escribe una persona en la pantalla de opciones, así que puede venir con
 *  barra al final o sin protocolo. Sin `http(s)` no se sigue: un `javascript:`
 *  no es un sitio. */
export function direccionUsable(direccion: string): string | null {
  const limpia = direccion.trim().replace(/\/+$/, '');
  if (!limpia) return null;
  try {
    const url = new URL(limpia);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  } catch {
    return null;
  }
  return limpia;
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLowerCase();
}

/** ¿El registro que devolvió el sitio es de ESTE pedido?
 *
 *  Dos salvaguardas, las dos obligatorias antes de confirmar: el nombre (el
 *  código pudo chocar con el pedido de otra persona, y confirmar encima
 *  cruzaría los datos de dos comensales) y la cantidad de líneas (el texto de
 *  wa.me es editable: si el comensal borró un renglón, las posiciones de
 *  `bonificadas` ya no indexan el mismo renglón que muestra el registro). */
export function coincideElRegistro(pedido: PedidoParseado, registro: unknown): boolean {
  if (!registro || typeof registro !== 'object') return false;
  const guardado = registro as { nombre?: unknown; lineas?: unknown };

  const nombre = typeof guardado.nombre === 'string' ? guardado.nombre : '';
  if (!nombre || normalizarNombre(nombre) !== normalizarNombre(pedido.nombre)) return false;

  return Array.isArray(guardado.lineas) && guardado.lineas.length === pedido.items.length;
}

/** El cuerpo del POST.
 *
 *  `codigoDelMensaje` se pasa SOLO cuando el registro se va a crear con un
 *  código distinto al del mensaje: es lo único que después permite rastrear el
 *  código que el comensal tiene anotado. */
export function armarCuerpo(
  pedido: PedidoParseado,
  cobro: Cobro,
  codigoDelMensaje: string | null,
): CuerpoDeConfirmacion {
  return {
    // El texto va SIN la cola de precio, igual que lo guarda la carta
    // (`textoDeLinea()` en `whatsapp.ts`). El registro tiene el importe en su
    // propio campo, así que dejar el precio también adentro del texto lo
    // duplicaría, y el historial mostraría el mismo renglón de dos formas
    // distintas según si lo creó la carta o la extensión.
    lineas: pedido.items.map((item) => ({
      texto: textoSinImporte(item.texto),
      importe: item.importe,
    })),
    // verbatim, `null` incluido: `Cobro` no lleva modalidad, y completarla con
    // 'retiro' haría que la ruta aplique el descuento de retiro y guarde un
    // total MÁS BAJO que el que dice el papel
    modalidad: pedido.modalidad,
    nombre: pedido.nombre,
    mesa: pedido.mesa ?? '',
    direccion: pedido.direccion ?? '',
    notas: pedido.aclaraciones ?? '',
    pagoElegido: pedido.medioDePago,
    envioElegido: pedido.envio ? { ...pedido.envio } : null,
    medioDePago: cobro.medioDePago,
    envio: cobro.envio,
    // los dos como `Descuento` y no como el entero resuelto: la ruta recalcula
    // la cuenta con ellos, y con el entero pelado no podría
    descuentoManual: cobro.descuentoManual,
    descuentoRetiro: cobro.descuentoRetiro,
    bonificadas: cobro.bonificadas,
    ...(codigoDelMensaje ? { codigoDelMensaje } : {}),
  };
}

function encabezados(clave: string): Record<string, string> {
  return { 'Content-Type': 'application/json', [HEADER_CLAVE]: clave };
}

/** El cuerpo, o `null` si no era JSON. Una página de error de HTML no es una
 *  respuesta de las rutas: sirve para saber que la dirección no es la del
 *  sitio, no solo que ese pedido no está. */
async function leerJson(respuesta: RespuestaHttp): Promise<unknown | null> {
  try {
    return await respuesta.json();
  } catch {
    return null;
  }
}

/** El `error` que manda la ruta, para no inventar un motivo peor que el suyo
 *  (el 409 dice exactamente qué pasó). */
async function motivoDelSitio(respuesta: RespuestaHttp): Promise<string> {
  const error = (await leerJson(respuesta)) as { error?: unknown } | null;
  if (typeof error?.error === 'string' && error.error) return error.error;
  return `El sitio respondió ${respuesta.status}.`;
}

/** ¿Existe un registro con ese código, y es de este pedido?
 *
 *  Devuelve el código a usar: el del mensaje si el registro coincide, o `null`
 *  para que el llamador genere uno nuevo. Un 401 corta todo: postear con una
 *  clave que el sitio ya rechazó solo sumaría otro 401. */
async function codigoQueSirve(
  pedido: PedidoParseado,
  codigo: string,
  base: string,
  clave: string,
  traer: Traer,
): Promise<{ codigo: string | null } | { motivo: string }> {
  const respuesta = await traer(`${base}/api/pedidos/${codigo}`, {
    method: 'GET',
    headers: encabezados(clave),
  });

  if (respuesta.status === 401) return { motivo: CLAVE_RECHAZADA };
  // 404 es "no existe": cae al fallback, igual que un registro que no coincide
  if (respuesta.status === 404) return { codigo: null };
  if (respuesta.status !== 200) return { motivo: await motivoDelSitio(respuesta) };

  const cuerpo = (await respuesta.json()) as { pedido?: unknown };
  return { codigo: coincideElRegistro(pedido, cuerpo?.pedido) ? codigo : null };
}

/** Guarda el pedido confirmado.
 *
 *  Nunca tira: la impresión ya salió cuando esto corre, y una excepción acá no
 *  tiene que aparecer como un error suelto en la consola de WhatsApp. Todo lo
 *  que sale mal vuelve como `{ ok: false, motivo }` para que el local lo lea. */
export async function guardarPedido(
  pedido: PedidoParseado,
  cobro: Cobro,
  ajustes: Ajustes,
  { traer, generarCodigo }: Dependencias,
): Promise<ResultadoDeGuardado> {
  const base = direccionUsable(ajustes.direccion);
  const clave = ajustes.clave.trim();
  if (!base || !clave) return { ok: false, motivo: FALTA_CONFIGURAR };

  // Se valida ACÁ, antes de armar ninguna URL. `Pedido #` a secas parsea a '' y
  // `Pedido #../../admin` sale del parser tal cual: pegado a
  // `/api/pedidos/<codigo>/confirmar` eso es una ruta distinta de la que se
  // quiso llamar. Delegárselo a la ruta sería mandárselo igual.
  const codigoDelMensaje =
    pedido.codigo && esCodigoValido(pedido.codigo) ? pedido.codigo : null;

  try {
    let codigo = codigoDelMensaje;
    if (codigoDelMensaje) {
      const encontrado = await codigoQueSirve(pedido, codigoDelMensaje, base, clave, traer);
      if ('motivo' in encontrado) return { ok: false, motivo: encontrado.motivo };
      codigo = encontrado.codigo;
    }

    // Ni el mensaje traía código, ni el registro coincidía: se crea uno nuevo.
    // El POST de confirmación hace el alta y la confirmación juntas.
    const codigoFinal = codigo ?? generarCodigo();
    const cuerpo = armarCuerpo(
      pedido,
      cobro,
      codigoFinal === codigoDelMensaje ? null : codigoDelMensaje,
    );

    const respuesta = await traer(`${base}/api/pedidos/${codigoFinal}/confirmar`, {
      method: 'POST',
      headers: encabezados(clave),
      body: JSON.stringify(cuerpo),
    });

    if (respuesta.status === 401) return { ok: false, motivo: CLAVE_RECHAZADA };
    if (respuesta.status !== 200) return { ok: false, motivo: await motivoDelSitio(respuesta) };

    const datos = (await respuesta.json()) as { creado?: unknown };
    return {
      ok: true,
      codigo: codigoFinal,
      creado: datos?.creado === true,
      codigoDelMensaje,
    };
  } catch {
    // sin red, sitio caído o dirección que no resuelve
    return { ok: false, motivo: SIN_CONEXION };
  }
}

/** El botón "probar conexión" de la pantalla de opciones.
 *
 *  Pide un código con forma válida que no existe: 401 es la clave mal, 404 es
 *  que está todo bien (el sitio contesta, la clave sirve, ese pedido no está). */
export async function probarConexion(ajustes: Ajustes, traer: Traer): Promise<ResultadoDeConexion> {
  const base = direccionUsable(ajustes.direccion);
  if (!base) {
    return { ok: false, motivo: 'La dirección tiene que empezar con https:// o http://' };
  }
  const clave = ajustes.clave.trim();
  if (!clave) return { ok: false, motivo: 'Falta la clave del panel.' };

  try {
    const respuesta = await traer(`${base}/api/pedidos/${CODIGO_DE_PRUEBA}`, {
      method: 'GET',
      headers: encabezados(clave),
    });

    if (respuesta.status === 401) return { ok: false, motivo: CLAVE_RECHAZADA };
    // el 200 sería el pedido `ZZZZZZ`, que existir puede pero no importa: si
    // contestó 200 la clave también sirve
    if (respuesta.status === 200) return { ok: true };
    if (respuesta.status === 404) {
      // CUALQUIER sitio contesta 404 en una ruta que no tiene, así que un 404
      // pelado no prueba nada: se mira que el cuerpo sea el JSON de la ruta.
      // Con una dirección equivocada, el 404 viene con la página de error en
      // HTML y esto diría "todo bien" sin que la extensión pueda guardar nada.
      return (await leerJson(respuesta)) !== null
        ? { ok: true }
        : { ok: false, motivo: DIRECCION_EQUIVOCADA };
    }
    return { ok: false, motivo: await motivoDelSitio(respuesta) };
  } catch {
    return { ok: false, motivo: SIN_CONEXION };
  }
}
