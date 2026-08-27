import { abrirFormularioDeCobro } from './formulario';
import { MENSAJE_GUARDAR } from './guardar';
import { parsearMensaje } from './parser';
import { textoDelMensaje } from './texto-mensaje';
import { armarTicketCocina, armarTicketDelivery } from './ticket';
import type { ResultadoDeGuardado, SolicitudDeGuardado } from './guardar';
import type { PedidoParseado } from './parser';
import type { Cobro } from './ticket';

/** Por dónde se buscan los mensajes del chat abierto.
 *
 *  Se prueban VARIAS anclas a la vez, a propósito, en vez de depender de una
 *  sola. Antes se buscaba solo por `data-testid^="conv-msg-"`, que existe en
 *  el WhatsApp Web de la máquina donde se desarrolló esto; pero `data-testid`
 *  es un atributo de testing y WhatsApp no lo incluye en todos sus builds. Se
 *  reprodujo el caso con el mismo mensaje sin esos atributos: la extensión
 *  encontraba CERO mensajes y el botón no aparecía nunca, sin ningún error a
 *  la vista. `data-pre-plain-text` y `.copyable-text` son parte de la función
 *  de copiar y pegar del propio WhatsApp, y `data-id` identifica la fila.
 *
 *  Escanear de más no molesta: el filtro real lo hace el parser, así que lo
 *  que no sea un pedido no recibe botón. */
/** El contenedor del TEXTO de cada mensaje. Es un solo nodo por mensaje y es
 *  chico (adentro está el texto, no la burbuja con sus íconos), así que
 *  revisarlo sale casi gratis.
 *
 *  Se mide, no se estima: con `[data-pre-plain-text], [data-testid^="conv-msg-"],
 *  [data-id]` juntos, un chat de 200 mensajes daba 700 candidatos y 13,9 ms por
 *  escaneo; solo con este, 200 candidatos y 0,4 ms. `[data-id]` era el peor:
 *  matchea también toda la lista de chats de la izquierda, que no tiene nada
 *  que ver, y hacía que cada mensaje se visitara tres veces. Como el escaneo
 *  corre con cada cambio del DOM (la hora, "escribiendo…", el estado de
 *  conexión), eso se comía varios segundos de CPU por segundo y dejaba la
 *  pestaña de WhatsApp sin responder. */
const SELECTOR_TEXTO_MENSAJE = '[data-pre-plain-text]';

/** El plan B, para un build de WhatsApp que no traiga `data-pre-plain-text`.
 *  Son las filas enteras: más caro de revisar, pero solo se usa si lo otro no
 *  encuentra nada. */
const SELECTOR_FILA = '[data-testid^="conv-msg-"]';

/** El encabezado fijo que pone `armarMensaje()`. Solo se usa como filtro
 *  previo barato del escaneo, nunca para decidir si el mensaje es válido:
 *  eso lo decide `parsearMensaje()`. */
const ANCLA = 'Pedido — Sagrado Sushi';

const CLASE_BOTON = 'comanda-cocina-boton';

/** Dónde se cuelga el botón: la burbuja del mensaje, no la fila. La fila
 *  ocupa todo el ancho del chat, así que un botón colgado de ella queda
 *  flotando lejos del mensaje al que pertenece. Si no se puede identificar la
 *  burbuja (builds sin `data-testid`), se usa el contenedor del texto del
 *  mensaje, que también está adentro de la burbuja. */
function ubicacionDelBoton(candidato: HTMLElement): HTMLElement {
  const burbuja =
    candidato.closest<HTMLElement>('[data-testid="msg-container"]') ??
    candidato.querySelector<HTMLElement>('[data-testid="msg-container"]');
  if (burbuja) return burbuja;

  const texto = candidato.matches('.copyable-text')
    ? candidato
    : candidato.querySelector<HTMLElement>('.copyable-text');
  return texto?.parentElement ?? candidato;
}

/** Abre una pestaña con el/los tickets y dispara el diálogo de impresión.
 *
 *  Abre la pestaña VACÍA y le mete el documento ya armado, en vez de navegar
 *  a la comanda y esperar que cargue. Antes hacía `window.open(urlDelBlob)` y
 *  enganchaba el evento `load` de la pestaña nueva, pero un blob local carga
 *  casi instantáneo: el `load` se disparaba ANTES de que llegáramos a
 *  escucharlo, así que el diálogo de impresión no aparecía nunca. Quedaba la
 *  comanda abierta en una pestaña y nada más, y el local terminaba
 *  imprimiendo WhatsApp entero con Ctrl+P (la columna de chats sale a una
 *  letra por renglón). Poblar el documento a mano es sincrónico, así que no
 *  hay carrera posible. */
function imprimir(html: string): void {
  const ventana = window.open('', '_blank');
  if (!ventana) {
    // Sin esto el botón no hacía nada y no había forma de saber por qué.
    alert(
      'El navegador bloqueó la ventana de la comanda. Permitile las ventanas emergentes a web.whatsapp.com y tocá el botón de nuevo.',
    );
    return;
  }

  const documento = new DOMParser().parseFromString(html, 'text/html');
  ventana.document.replaceChild(
    ventana.document.importNode(documento.documentElement, true),
    ventana.document.documentElement,
  );

  ventana.focus();
  ventana.print();
}

/** Arma el documento de la comanda (y el ticket del cadete, si es delivery) y
 *  lo manda a imprimir. Todo sincrónico: se llama desde el click del botón
 *  "Imprimir" del formulario. */
function imprimirComanda(pedido: PedidoParseado, cobro: Cobro): void {
  const secciones = [armarTicketCocina(pedido, cobro)];
  if (pedido.modalidad === 'delivery') {
    secciones.push(armarTicketDelivery(pedido, cobro));
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Comanda</title></head><body>${secciones.join(
    '<div style="page-break-after: always"></div>',
  )}</body></html>`;

  imprimir(html);
}

const CLASE_AVISO = 'comanda-aviso';

/** Un cartelito abajo a la derecha, que se va solo.
 *
 *  No es un `alert()`: esto aparece DESPUÉS de imprimir, y un modal que hay que
 *  cerrar en cada comanda (por ejemplo mientras el sitio está caído) haría que
 *  el local termine odiando el botón. La ventana emergente bloqueada sí usa
 *  `alert()`, porque ahí no salió nada por la impresora. */
function avisar(texto: string): void {
  const aviso = document.createElement('div');
  aviso.className = CLASE_AVISO;
  aviso.textContent = texto;
  aviso.style.cssText =
    "position:fixed; right:16px; bottom:16px; z-index:2147483647; max-width:320px; box-sizing:border-box; padding:10px 12px; border-radius:8px; background:#2b2b2b; color:#fff; font-family:'Segoe UI', system-ui, sans-serif; font-size:13px; line-height:1.4; box-shadow:0 6px 20px rgba(0,0,0,0.35); cursor:pointer;";
  aviso.addEventListener('click', () => aviso.remove());
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 12_000);
}

/** Le pide al service worker que registre el pedido confirmado.
 *
 *  Se llama DESPUÉS de imprimir y no se espera nunca: la comanda es lo que
 *  desbloquea la cocina, y perder el registro es menos grave que no poder
 *  despachar. Si algo falla se avisa, pero el papel ya salió.
 *
 *  Lo manda al worker y no postea desde acá: desde la página el `fetch`
 *  llevaría el origen `web.whatsapp.com` y habría que resolver CORS. */
function pedirGuardado(pedido: PedidoParseado, cobro: Cobro): void {
  // La extensión recargada deja los content scripts viejos huérfanos: sin este
  // chequeo, cada impresión en una pestaña sin recargar tira una excepción.
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) return;

  const solicitud: SolicitudDeGuardado = { tipo: MENSAJE_GUARDAR, pedido, cobro };
  chrome.runtime
    .sendMessage<SolicitudDeGuardado, ResultadoDeGuardado>(solicitud)
    .then((resultado) => {
      if (!resultado?.ok) {
        avisar(`Se imprimió, pero no se guardó el pedido. ${resultado?.motivo ?? ''}`.trim());
        return;
      }
      // El código del mensaje no servía (chocó con otro pedido, o el comensal
      // editó el texto): el registro quedó con otro código y el que el comensal
      // tiene anotado ya no lo encuentra.
      if (resultado.codigoDelMensaje && resultado.codigoDelMensaje !== resultado.codigo) {
        avisar(
          `El pedido se guardó con el código ${resultado.codigo}, no con el ${resultado.codigoDelMensaje} del mensaje: los datos no coincidían.`,
        );
      }
    })
    .catch(() => avisar('Se imprimió, pero no se pudo guardar el pedido.'));
}

function agregarBotonSiCorresponde(mensaje: HTMLElement): void {
  // FILTRO BARATO PRIMERO. Esto no es microoptimización: sin este rechazo, la
  // extensión cuelga WhatsApp.
  //
  // El escaneo corre cada vez que cambia el DOM (o sea, todo el tiempo: la
  // hora, "escribiendo…", el estado de conexión), y los selectores matchean
  // también la lista de chats, que puede ser de cientos de nodos. Para cada
  // uno, `textoDelMensaje()` hace un `cloneNode(true)`: una copia profunda del
  // subárbol entero. Cientos de copias profundas por segundo dejan la pestaña
  // sin responder.
  //
  // `textContent` no copia nada, y el texto que mira `textoDelMensaje()` está
  // adentro de este mismo nodo, así que si el ancla no aparece acá tampoco va
  // a aparecer allá. Es un rechazo previo, no la decisión: la que manda sigue
  // siendo `parsearMensaje()` abajo, para que "muestro el botón" y "puedo
  // parsear" no vuelvan a ser dos preguntas distintas.
  if (!(mensaje.textContent ?? '').includes(ANCLA)) return;

  if (!parsearMensaje(textoDelMensaje(mensaje))) return;

  const ubicacion = ubicacionDelBoton(mensaje);

  // Se pregunta por el botón en sí, no por una clase marcadora: el mismo
  // mensaje aparece por varias anclas a la vez (la fila Y el contenedor del
  // texto), y las dos resuelven a la misma burbuja, así que así no se
  // duplica. De paso, si WhatsApp vuelve a dibujar la burbuja y se lleva el
  // botón puesto, el próximo escaneo lo repone (con una clase marcadora
  // quedaba marcado para siempre y el botón no volvía).
  if (ubicacion.querySelector('.' + CLASE_BOTON)) return;

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = CLASE_BOTON;
  boton.textContent = '🖨️ Imprimir comanda';
  // display:block + margin auto: dentro de la burbuja, el botón queda como
  // una fila propia alineada a la derecha, debajo del texto del pedido.
  boton.style.cssText =
    'display:block; margin:6px 8px 8px auto; padding:4px 10px; cursor:pointer; font-size:12px; line-height:1.4; border-radius:6px; border:1px solid rgba(255,255,255,0.35); background:rgba(0,0,0,0.25); color:inherit; font-family:inherit;';
  boton.addEventListener('click', (evento) => {
    evento.stopPropagation();

    // Se relee el texto en vez de reusar el del escaneo: WhatsApp permite
    // editar un mensaje ya enviado, y si el pedido se editó después de
    // agregar el botón, hay que imprimir la versión vigente.
    const pedido = parsearMensaje(textoDelMensaje(mensaje));
    if (!pedido) {
      console.warn('No se pudo parsear el pedido al imprimir la comanda', mensaje);
      return;
    }

    // El formulario de cobro se abre en el medio, pero la impresión sigue
    // colgando de un click: `alImprimir` corre SINCRÓNICO adentro del click del
    // botón "Imprimir" del formulario. Si esto pasara por una promesa o un
    // callback posterior, se perdería la activación del usuario y el navegador
    // bloquearía la ventana siempre.
    abrirFormularioDeCobro(pedido, (cobro) => {
      // La impresión PRIMERO y sin nada asincrónico en el medio. El guardado va
      // después y no se espera: si el sitio está caído, la comanda sale igual.
      imprimirComanda(pedido, cobro);
      pedirGuardado(pedido, cobro);
    });
  });

  ubicacion.appendChild(boton);
}

function escanear(): void {
  const porTexto = document.querySelectorAll<HTMLElement>(SELECTOR_TEXTO_MENSAJE);
  const candidatos = porTexto.length
    ? porTexto
    : document.querySelectorAll<HTMLElement>(SELECTOR_FILA);
  candidatos.forEach(agregarBotonSiCorresponde);
}

let escaneoProgramado = false;
function programarEscaneo(): void {
  if (escaneoProgramado) return;
  escaneoProgramado = true;
  setTimeout(() => {
    escaneoProgramado = false;
    escanear();
  }, 300);
}

const observador = new MutationObserver(programarEscaneo);
observador.observe(document.body, { childList: true, subtree: true });
escanear();
