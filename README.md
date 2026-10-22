# Comanda Directa

El motor del producto: pedidos por WhatsApp con carta QR e impresión de
comandas. Un solo Next.js sirve la landing (`/`) y la carta de **todos** los
clientes (`/[cliente]`), contra un único proyecto de Supabase multi-tenant.

**Ojo con los nombres:** de cara al público el producto se llama **"Hacé tu
pedido"** (igual que el dominio, `hace-tu-pedido.site`). "Comanda Directa" es
el nombre del repo, del proyecto de Vercel y del de Supabase. No hace falta
renombrar nada: son capas distintas, y el nombre comercial vive en la landing
(`src/app/page.tsx`). Es la productización del sistema que se construyó
primero para Sagrado Sushi (`sagrado-sushi-carta/`, fork de
`presencia-carta/`) — ver `landing/Brief Landing.dc.html` para el brief
original.

`presencia-carta/` y `sagrado-sushi-carta/` son otros dos productos, cada uno
en su propio repo git, Firebase y Vercel: no se tocan desde acá. Están en el
working tree solo como referencia de código para portar; el `.gitignore` los
excluye del historial de este repo.

## Cómo sumar un cliente nuevo

1. Insertar una fila en `clientes` (Supabase) con su `slug` (la URL será
   `/slug`), `nombre`, un `clave_panel_hash` (`sha256` de la clave que le des
   al local) y, si ya tenés su manual de marca, el `tema` (cuatro colores +
   logo, ver `logica/tipos.ts`). Sin tema, usa el de por defecto.
2. Entrar a `/slug/panel`, crear las categorías y cargar la carta (a mano o
   importando el CSV que te pasó el cliente, en **Importar**).
3. Cargar el número de WhatsApp, las modalidades abiertas, medios de pago y
   zonas de envío en **Pedido**.
4. Generar el QR apuntando a `/slug` (con `npm run` — falta el script, ver
   "Lo que falta" — por ahora, cualquier generador de QR con esa URL sirve).
5. Instalar `extension-comandas/` en la PC del mostrador (una sola vez por
   local, es la misma extensión para todos los clientes: ver su README).

Nada de esto pisa a otro cliente: cada fila de `clientes` es independiente,
con su propia clave de panel y sus propias categorías/ítems (`cliente_id`).

### Cuando la carta ya viene escrita: darla de alta por script

Cargar ochenta productos a mano en el panel es una tarde y un par de precios
mal tipeados. Cuando el cliente ya mandó la lista, conviene el camino de
Piedro Shop: los datos en un módulo de `scripts/` (revisable en el diff, con
pruebas encima) y un script que los inserta.

```bash
npm run traer:planilla                         # regenera party-market.json desde la hoja
CLAVE_PANEL=loquesea npm run seed:halloween    # crea/recarga /party-market
npm run fotos:halloween                        # baja de la store API, normaliza y sube las fotos
npm run fotos:halloween -- --faltantes         # sólo las que quedaron sin foto
```

### De dónde sale el catálogo (y el stock)

Party Market se arma de **una sola fuente**: la planilla del cliente, hoja
"Catálogo" (`catalogo-minorista-halloween-v2`). `scripts/traer-planilla.ts` la
lee por la API de Google Sheets y deja en `scripts/data/party-market.json`
**sólo lo que tiene stock**: Disponible (columna L) > 0 y precio cargado. Lo
que está en 0 o "a pedido" no entra. Nada del proveedor se publica: el JSON no
guarda código, ni precio mayorista, ni costo; el `slug` que sí guarda es la
llave para ir a buscar la foto.

Dos precios, un número guardado: la carta muestra el de **tarjeta** y el motor
calcula el de **efectivo** con `DESCUENTO_EFECTIVO` (10%). La planilla arma su
columna de tarjeta como `efectivo / 0,9` redondeado a los $100 de arriba, así
que la vuelta da EXACTA el efectivo de la planilla (lo verifica
`pruebas/catalogo-halloween.test.ts`).

**El stock se sincroniza solo**: un cron de Vercel (`vercel.json`) pega a
`/api/sync-stock`, que lee la planilla y oculta (`activo = false`) cada
producto cuyo Disponible llegó a 0, y lo vuelve a mostrar cuando hay stock. No
toca precios ni fotos. Para cambiar el SURTIDO (sumar o sacar productos) se
corre `npm run traer:planilla` + `seed`.

> Autenticación de Google: un **service account** con la planilla compartida en
> lectura. Sus credenciales van por entorno (`GOOGLE_SA_EMAIL`,
> `GOOGLE_SA_PRIVATE_KEY`), nunca en el repo — en `.env.local` para los scripts
> y en las env de Vercel para el cron (más `CRON_SECRET`).

- `scripts/catalogo-halloween.ts` — categorías, productos, tema y config de
  pedido, armados desde `party-market.json`. No entra en el bundle: es dato de
  alta, no código servido.
- `scripts/seed-halloween.ts` — inserta. Es idempotente y **destructivo para
  ese cliente**: borra sus categorías e ítems y los reescribe. Después del
  alta, los cambios chicos van por el panel; volver a correrlo pisa lo que el
  cliente haya editado ahí.
- `pruebas/catalogo-halloween.test.ts` — corre sobre los mismos datos:
  precios enteros, ids sin repetir, que el efectivo del motor sea el de la
  planilla producto por producto, y que nada del proveedor quede publicado.
- `scripts/fotos-halloween.ts` — baja la foto de cada producto de la **store
  API pública del proveedor** (por el slug de la ficha), la deja cuadrada y
  liviana (360px para la grilla, 900px para la ficha) y la **re-sube** a
  **Supabase Storage**, bucket `fotos` (público). La foto nunca queda enlazada
  al dominio del proveedor. No van a `public/` del repo a propósito: son de un
  cliente y el repo es el motor de todos.
- La clave del panel viaja por entorno (`CLAVE_PANEL`), no por el repo.

El seed **conserva las fotos** al volver a correrse (las rescata por nombre
antes de borrar), así que corregir un precio en la tabla no cuesta volver a
bajar las ~90 imágenes.

Para el cliente siguiente, copiar los archivos y cambiar los datos.

## La landing (`/`)

Puerto del artboard "Landing v3" de Claude Design (`landing/Landing v3.dc.html`,
guardado como referencia de copy y diseño). Corre sobre el design system
"organic" del artboard: papel crema, terracota y oliva, con Caprasimo para los
títulos. Los tokens viven en `globals.css` bajo `.landing`, aparte de los de
las cartas — `:root` ahí lo pinta el tema de cada cliente en tiempo de
request, y mezclarlos sería que un cliente pueda despintar la landing
cambiando sus colores.

Las maquetas del encabezado (catálogo, mensaje, ticket) están dibujadas con
CSS y no son capturas: una captura envejece con cada cambio de la app y con
cada cambio de precio del cliente que se haya usado de ejemplo. La prueba de
que el sistema existe es la sección de **Piedro Shop**, que linkea al catálogo
real y navegable. Ahí no hay números de venta a propósito: no los tenemos, y
un porcentaje inventado se cae en la primera pregunta de la reunión.

## Pushear los tres repos de una

```bash
npm run pushear           # pushea los repos que estén adelante
npm run pushear -- --ver  # sólo muestra el estado, no pushea
```

Son tres repos git independientes en el mismo árbol y el push es del
operador, pero eso no debería significar abrir cada uno en su propia ventana
del editor y acordarse de los tres. El script los descubre solos (la raíz más
toda subcarpeta con `.git`), así que el día que se sume un cliente aparece en
la lista sin tocar nada.

Claude no lo corre: `pre-push-guard.py` lo bloquea igual que a un `git push`.
Un atajo que el agente pueda usar no es un atajo, es el agujero de la regla.

### Verlos en el panel del editor

Los tres aparecen en Source Control abras la carpeta o el
`comanda-directa.code-workspace`. El workspace los lista como raíces, y
`.vscode/settings.json` declara `git.scanRepositories` con los dos anidados
para cuando se abre la carpeta pelada: la detección automática del editor se
saltea las carpetas que el repo padre tiene en su `.gitignore`, y
`presencia-carta/` y `sagrado-sushi-carta/` están ahí a propósito.

Si el panel dice "no changes ahead of origin/main", puede ser cierto: quiere
decir que ese repo ya está al día. Para ver los tres de una sin depender del
editor, `npm run pushear -- --ver`.

## El panel: lo que el cliente cambia solo

Cada cliente entra a `/<slug>/panel` con su clave (`clientes.clave_panel_hash`,
sha256). Todo lo de ahí se ve en la carta al instante: no hay build ni deploy
en el medio, la carta lee de Supabase en cada request.

| pestaña | para qué |
| --- | --- |
| **Ítems** | agregar, editar, marcar sin stock y sacar productos |
| **Categorías** | crear, renombrar y reordenar las secciones |
| **Importar** | cargar una carta entera desde un CSV |
| **Pedido** | número de WhatsApp, modalidades abiertas, medios de pago y zonas de envío |
| **Comandas** | sólo sirve con `extension-comandas/` instalada |

"Sin stock" y "Sacar" no son lo mismo, y la diferencia importa: **sin stock**
deja el producto a la vista, tachado y sin poder agregarse —el que lo estaba
buscando entiende que existe y volvió a agotarse—; **sacar** lo esconde
(borrado suave, `activo = false`) y se puede restaurar desde el desplegable
del final.

El panel es deliberadamente neutro (fondo oscuro, no usa el tema del cliente):
tiene que leerse bien sea cual sea la paleta que ese cliente eligió para su
carta.

## Poner en marcha Supabase (una sola vez para todo el motor)

1. Crear un proyecto de Supabase (plan gratuito alcanza para arrancar).
2. Correr `supabase/schema.sql` contra ese proyecto (SQL Editor del
   dashboard, o `supabase db push` si lo linkeás con la CLI).
3. Copiar `.env.example` a `.env.local` y completar `SUPABASE_URL` (la URL
   del proyecto) y `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → `service_role`,
   **no** la `anon`: el navegador nunca habla con Supabase directo, todo pasa
   por rutas de Next.js server-side con esta key).
4. En Vercel, cargar las mismas dos variables de entorno del proyecto.

## Por qué un solo proyecto de Supabase y no uno por cliente

El free tier de Firebase es por-proyecto: separar por cliente daba más cuota
gratis total, pero es justo lo que hacía pesado el mantenimiento (un proyecto
de Firebase + un deploy de Vercel por cliente). El free tier de Supabase
también es por-proyecto (y se pausa a los 7 días sin uso), así que ahí no hay
ninguna ventaja en separar: un solo proyecto multi-tenant da un solo panel de
admin reutilizable y un solo lugar para mejorar el producto para todos los
clientes a la vez.

## Arquitectura en tres líneas

- **`src/logica/`** — funciones puras (pedido, WhatsApp, precios, numeración,
  planilla), portadas casi sin cambios desde `sagrado-sushi-carta/src/logica/`:
  ya eran multi-tenant de hecho, porque no tenían estado propio.
- **`src/datos/`** — la única capa que habla con Supabase (`service_role`
  key, siempre server-side) y con `localStorage` (el pedido del comensal).
- **`src/componentes/` + `src/app/[cliente]/`** — la carta y el panel,
  parametrizados por `cliente_id`/slug. El tema (colores, logo) se pinta como
  variables CSS en tiempo de request (`[cliente]/layout.tsx`), no como
  `@theme` de Tailwind: así el mismo build sirve a todos los clientes.

## Clientes dados de alta

| slug | qué es | modalidades | notas |
| --- | --- | --- | --- |
| `demo` | carta de muestra para probar el motor | salón, retiro, delivery | `npm run seed:demo` |
| `party-market` (en la base, todavía `piedro-shop`) | Party Market (antes Piedro Shop), catálogo de temporada de cotillón y disfraces | sólo delivery | plantilla `halloween`, ~90 productos **sólo con stock** (de la planilla del cliente) a precio de tarjeta, 10% en efectivo; stock sincronizado desde la planilla (`/api/sync-stock`); sin comandas ni link de pago |

Party Market se publica en **hace-tu-pedido.site/party-market**. Nació como
`/halloween` y después fue `/piedro-shop`; los dos links circulan, así que
quedan desviados al nuevo (ver `src/logica/slugs-renombrados.ts`): renombrar
sin dejar el desvío es romperle el link a quien está por comprar. Además
`leerCliente` encuentra al cliente por el slug nuevo aunque la base siga con
el viejo, así que `clientes.slug` se puede pasar a `party-market` cuando sea,
pero SIEMPRE después del deploy (el código publicado busca el viejo). Al
hacerlo, `SLUG_HALLOWEEN` en `scripts/catalogo-halloween.ts` cambia con él.

El catálogo de Meta se alimenta de **hace-tu-pedido.site/party-market/catalogo.xml**
(sirve para cualquier cliente: `/<slug>/catalogo.xml`). Se arma en cada
request contra la base, así que en el Commerce Manager se carga como origen
de datos con bajada programada y los precios y agotados del panel llegan
solos. Detalle en `src/logica/feed-meta.ts`.

El pixel de Meta se activa cargando el ID en `PIXELES_META`
(`src/logica/pixel-meta.ts`). Manda PageView, ViewContent (abrir la ficha),
AddToCart, InitiateCheckout (abrir la hoja del pedido) y Purchase (tocar
"Enviar pedido por WhatsApp": el pedido salió, no es una venta confirmada),
con los mismos ids del feed para que Meta cruce eventos y catálogo. En el
panel no se carga.

Cada evento sale también por la Conversions API (`/api/meta/<slug>`), con el
mismo id para que Meta deduplique: así llega aunque un bloqueador frene el
pixel. El token va en la variable `META_CAPI_TOKEN_<id del pixel>` (en Vercel
como *sensitive*, nunca en el repo); sin token, el pixel anda solo. No viajan
datos personales: matchea por la cookie del pixel, el click del anuncio, la IP
y el navegador.

Ojo con el slug: es la URL, no la marca. `clientes.nombre` es lo que se ve en
la carta y en el mensaje de WhatsApp, y los dos se cambian por separado.

Piedro Shop es el primer cliente que no es un restaurante, y por eso vale
anotar qué
alcanzó con lo que ya había: apagar `salon` y dejar `cubiertoPorPersona` en 0
saca de la pantalla todo lo gastronómico, y `variantes` —pensadas para "5 pz"
/ "10 pz" de sushi— sirven igual para el talle de un disfraz, que es dato de
despacho y tiene que viajar en el mensaje de WhatsApp.

## Plantillas

`clientes.plantilla` elige la variante visual; el `switch` está en
`[cliente]/page.tsx` y un valor desconocido cae en la Clásica, para que un
typo en la base no deje a un cliente sin carta.

| plantilla | componente | para qué |
| --- | --- | --- |
| `clasica` (por defecto) | `carta/Carta.tsx` | carta de restaurante: lista de platos, precio a la derecha |
| `halloween` | `carta/CartaHalloween.tsx` | catálogo con foto: grilla de dos columnas y ficha de producto |

Las dos comparten todo el motor de abajo (`componentes/pedido/`): el pedido,
la hoja, el total y el mensaje de WhatsApp son los mismos.

La diferencia entre las dos no es de colores, es de cómo se lee. Una carta de
restaurante se recorre entera y el nombre del plato alcanza para decidir. Un
catálogo de cotillón se mira por la foto: nadie compra una "Bruja Misteriosa"
de $64.800 por el nombre, y el talle hay que poder elegirlo viendo la prenda.
Por eso `halloween` tiene grilla, ficha en modal y las fotos normalizadas de
`fotos-halloween.ts`, y la Clásica sigue siendo una lista.

Sumar una plantilla nueva es un componente hermano más una línea en ese
`switch`. Su paleta ampliada vive en `globals.css` bajo una clase propia
(`.halloween`): los cuatro colores de `clientes.tema` son los que usa el
motor compartido, no los que necesita un diseño.

## Lo que falta (a propósito, no es un olvido)

- **Historial de pedidos server-side**: `sagrado-sushi-carta` registra cada
  pedido confirmado (para el mini-CRM y para que la extensión de Chrome deje
  constancia de lo cobrado). Acá el pedido sale por WhatsApp igual, pero no
  se guarda todavía — no bloquea vender, sí hay que sumarlo antes de ofrecer
  reportes de ventas.
- **Reservas** (el otro producto, de `presencia-carta`): no es parte de
  "Comanda Directa", es un producto aparte.
- **Fotos de producto desde el panel**: `fotoUrl` acepta una URL https pegada
  a mano, y `scripts/fotos-halloween.ts` sube en lote a Supabase Storage, pero
  no hay todavía una pantalla de subida como en
  `sagrado-sushi-carta/src/datos/panel-fotos.ts`. Hoy el cliente no puede
  cambiar una foto solo.
- **Subcategorías** (agrupar dentro de una categoría): el modelo las soporta,
  el panel de categorías no tiene UI para cargarlas todavía.
- **QR**: no hay script de generación en este repo todavía (sí en los otros
  dos). Cualquier generador de QR apuntando a `/slug` sirve mientras tanto.
- **Dominio propio / subdominio por cliente**: se arranca con rutas
  (`/slug`); pasar a `slug.comandadirecta.com` es config de Vercel a futuro,
  no requiere tocar el código de acá.

## Correr en local

```bash
npm install
npm run dev            # http://localhost:3000 — sin .env.local sirve la carta de muestra en /cualquier-slug
npm test                # pruebas de la lógica pura
npx tsc --noEmit        # typecheck
npm run seed:demo       # crea/actualiza el cliente "demo" en Supabase (necesita .env.local)
```
