# Comanda Directa

El motor del producto: pedidos por WhatsApp con carta QR e impresión de
comandas, para restaurantes. Un solo Next.js sirve la landing (`/`) y la
carta de **todos** los clientes (`/[cliente]`), contra un único proyecto de
Supabase multi-tenant. Es la productización del sistema que se construyó
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

## Plantillas

Hoy hay una sola, "Clásica" (`src/componentes/carta/Carta.tsx`), puerto
directo de `CartaSushi.tsx`. El campo `clientes.plantilla` ya existe para
elegir entre variantes visuales: sumar una nueva es agregar un componente
hermano y un `switch` en `[cliente]/page.tsx` que elija según ese campo. Las
4-5 plantillas prometidas quedan para una próxima sesión — no bloquea dar de
alta un cliente hoy, todos arrancan con la Clásica.

## Lo que falta (a propósito, no es un olvido)

- **Historial de pedidos server-side**: `sagrado-sushi-carta` registra cada
  pedido confirmado (para el mini-CRM y para que la extensión de Chrome deje
  constancia de lo cobrado). Acá el pedido sale por WhatsApp igual, pero no
  se guarda todavía — no bloquea vender, sí hay que sumarlo antes de ofrecer
  reportes de ventas.
- **Reservas** (el otro producto, de `presencia-carta`): no es parte de
  "Comanda Directa", es un producto aparte.
- **Fotos de producto**: `fotoUrl` acepta una URL https pegada a mano; no hay
  todavía una pantalla de subida de imágenes (Storage) como en
  `sagrado-sushi-carta/src/datos/panel-fotos.ts`.
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
