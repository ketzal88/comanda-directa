# Comandas Comanda Directa — extensión de Chrome

Agrega un botón de impresora a los mensajes de pedido en WhatsApp Web.
Imprime la comanda de cocina y, si el pedido es delivery, también un ticket
con nombre/dirección/total para el cadete: las dos hojas con un solo clic.

Es genérica, no por cliente: parsea el formato de mensaje que arma
`armarMensaje()` (src/logica/whatsapp.ts del motor), así que la misma
extensión (el mismo .zip) sirve para todos los clientes de Comanda Directa.
Un solo build para todos, se reinstala una vez por PC de cada local.

> El guardado del pedido confirmado en el panel (mencionado en la pantalla
> de opciones) todavía no tiene el endpoint del lado del motor nuevo — ver
> el README de la raíz, sección "Lo que falta". La impresión funciona igual,
> con o sin esa conexión.

## Instalar (una sola vez)

1. `npm install` dentro de esta carpeta.
2. `npm run build`.
3. En Chrome: `chrome://extensions` → activar "Modo de desarrollador" →
   "Cargar descomprimida" → elegir esta carpeta (`extension-comandas/`).
4. Al instalarse abre sola la pantalla de opciones: cargar ahí la dirección del
   sitio y la clave del panel, y tocar "Probar conexión". Si queda vacía, la
   extensión imprime igual pero no guarda nada.

## La dirección del sitio tiene que estar en `host_permissions`

`manifest.json` declara a qué direcciones puede pegarle la extensión: hoy la de
Vercel (que es la que sirve el sitio), el dominio propio `carta.sagradosushi.com`
(que todavía no está armado, queda listo para cuando lo esté) y
`http://localhost:3000` (para probar). Una dirección que
no esté en esa lista se escribe igual en las opciones, pero el navegador corta
el pedido y la pantalla dice que no se pudo conectar. Si el sitio cambia de
dominio, hay que tocar `host_permissions` y volver a empaquetar.

## Actualizar

Cuando haya cambios: `npm run build` de nuevo y, en `chrome://extensions`,
tocar el botón de recargar (↻) en la tarjeta de la extensión. No se
actualiza sola.

## Las tres partes

- `src/content-script.ts` — el botón dentro de WhatsApp Web y la impresión.
- `src/worker.ts` — el service worker: es el único que le habla al sitio (desde
  el content script el `fetch` llevaría el origen de WhatsApp y habría que
  resolver CORS). La lógica del guardado está en `src/guardar.ts`, sin nada de
  Chrome adentro, y se prueba con `npm test`.
- `opciones.html` + `src/opciones.ts` — la pantalla de configuración.

Si se agrega otra parte, hay que agregarla en `build.mjs` **y** en
`scripts/empaquetar-extension.ts` del repo principal: un manifest que declara
un archivo que no está en el ZIP hace que Chrome no cargue la carpeta entera.
El script de empaquetado corta el build si eso pasa.

## Si algún día deja de aparecer el botón

WhatsApp Web puede cambiar su estructura interna. Si el botón deja de
aparecer, revisar `SELECTOR_MENSAJE` en `src/content-script.ts` contra el
DOM actual (ver el Step 1 de la Task 6 en
`docs/superpowers/plans/2026-08-25-extension-comandas-cocina.md` del repo
principal para el procedimiento).
