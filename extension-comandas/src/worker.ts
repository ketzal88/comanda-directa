import { generarCodigo } from '../../src/logica/codigo-pedido';
import { leerAjustes } from './ajustes';
import { esSolicitudDeGuardado, guardarPedido } from './guardar';

/** El service worker: la única parte de la extensión que le habla al sitio.
 *
 *  El POST no sale del content script a propósito. Desde la página, el `fetch`
 *  llevaría el origen `web.whatsapp.com` y habría que resolver CORS en la ruta
 *  de confirmación; desde acá, con `host_permissions`, no hay preflight que
 *  atender. Y la clave del panel no queda expuesta en el contexto de una
 *  pestaña de WhatsApp.
 *
 *  Este archivo es una cáscara: la lógica (qué código usar, qué se manda) vive
 *  en `guardar.ts`, que no toca nada de Chrome y se prueba sin navegador. */

chrome.runtime.onMessage.addListener((mensaje, _remitente, responder) => {
  if (!esSolicitudDeGuardado(mensaje)) return false;

  void (async () => {
    const ajustes = await leerAjustes();
    const resultado = await guardarPedido(mensaje.pedido, mensaje.cobro, ajustes, {
      // envuelto y no `fetch` pelado: pasar la referencia suelta la desata de
      // su `this` y algunos contextos la rechazan
      traer: (url, opciones) => fetch(url, opciones),
      generarCodigo,
    });
    responder(resultado);
  })();

  // `true` sincrónico: sin esto Chrome cierra el canal antes de que la promesa
  // resuelva y el content script nunca se entera de si se guardó.
  return true;
});

/** Al instalarla, abrir las opciones. Sin la dirección y la clave cargadas la
 *  extensión imprime pero no guarda nada, y el local no tiene por qué adivinar
 *  que hay una pantalla de configuración. */
chrome.runtime.onInstalled.addListener((detalle) => {
  if (detalle.reason === 'install') void chrome.runtime.openOptionsPage();
});
