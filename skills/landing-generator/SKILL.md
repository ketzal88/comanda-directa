---
name: landing-generator
description: |
  Genera una página de producto completa (ficha estilo PDP arriba + landing de venta
  narrativa abajo) en un solo HTML autocontenido, lista para maquetar en la tienda
  del cliente. Usar cuando pidan "una landing de producto", "página de producto",
  "ficha de producto", "página de venta", "PDP", "armá la landing de este producto",
  "necesito una LP para el ad". Para el ángulo de venta previo, leer
  `ad-angle-multiplier` y `avatar-extraction`; para la corrección final, `humanizer`.
allowed-tools:
  - Read
  - Write
  - Artifact
---

# Landing Generator — página de producto lista para maquetar

Entrega una página de producto completa: arriba la ficha estilo PDP (galería, columna sticky, variantes, acordeones), abajo la narrativa de venta (dolor, solución, beneficios, objeciones, prueba social). Un solo archivo HTML autocontenido.

**Qué es y qué no es.** Esto es un **mockup de la página del cliente**, no un entregable de Worker. Sigue la marca del cliente, no el design system de Worker. Para propuestas, reportes y decks que salen con nuestra firma, el canónico sigue siendo [`worker-proposals`](../worker-proposals/SKILL.md) y el scaffold es `scripts/new-deliverable.py`. No mezclar los dos.

---

## LO QUE NO SE INVENTA NUNCA

Esta es la parte que hace que la página sea publicable o no. Una landing con prueba social inventada no es un borrador perfectible: es un riesgo legal (Ley 24.240 de Defensa del Consumidor) y motivo de rechazo de anuncios en Meta y Google.

**Van como placeholder visible, con el mismo tratamiento que las fotos:**

| Elemento | Regla |
|---|---|
| **Testimonios** | Nunca redactar un testimonio firmado por una persona que no existe. Van 3 cajas placeholder con la anatomía pedida adentro: `[TESTIMONIO 1 — reemplazar: nombre, ciudad, contexto (edad / uso), y la cita con un detalle incómodo real]`. Si el cliente tiene reseñas reales, se usan esas, textuales. |
| **Estrellas y cantidad de reseñas** | Solo el número real de la tienda. Si no lo tenés, se saca por API (`tiendanube-api`, `shopify-api`, `woocommerce-api`) o se omite el bloque entero. Nunca un "4,8 con 320 reseñas" verosímil. |
| **Las 3 métricas de la sección solución** | Solo especificaciones verificables del producto (medidas, materiales, duración, capacidad, plazo de envío). Nunca métricas de resultado inventadas ("98% de satisfacción", "3x más rápido"). Si no hay especificaciones, placeholder. |
| **Urgencia / stock limitado** | Solo si hay una restricción real: stock que se termina, promo con fecha de cierre, tanda limitada. Si no la hay, **se elimina la cajita**. Una urgencia falsa se detecta en dos visitas. |
| **Fotos y video** | Marcos placeholder con "Agregá acá tu foto del producto" / "Agregá acá tu video del producto". Jamás imágenes inventadas. |
| **Contacto, redes, certificaciones, sellos, precios de la competencia** | No se inventan. Si no están, no van. |

**Aviso obligatorio al entregar:** listá explícitamente qué quedó como placeholder y qué hay que reemplazar antes de publicar. Eso va en el mensaje al operador, no adentro de la página.

---

## CÓMO ARRANCAR

- **Modo A, datos completos:** producto, avatar, precio, dolor y ángulo → generá directo.
- **Modo B, solo una idea:** antes de generar, 4 preguntas en el chat, una por una, esperando respuesta:
  1. ¿Qué hace el producto y a quién se lo vende?
  2. ¿Qué dolor concreto resuelve? Decilo en las palabras que usaría el cliente final.
  3. ¿A qué precio se vende?
  4. ¿Hay un ángulo de venta definido o lo propongo yo?

Si no hay ángulo, proponé 2 opciones cortas y que elija antes de construir. Para armarlas bien, `avatar-extraction` + `ad-angle-multiplier`. Si además hay que decidir descuento o mecánica de promo, eso sale de `tienda-oferta-builder`, no de acá.

Si es para un cliente de Worker, leé antes `clients/{tipo}/{slug}/brand-voice.md` (tono y claims permitidos) y su `icp.md`.

---

## ESTRUCTURA DE LA PÁGINA

### Zona 1 — Ficha de producto (estilo PDP)

1. **Header** minimalista con barra superior de aviso (el beneficio real de la tienda, ej. "Envío gratis a partir de $X", con el umbral real o placeholder), nav simple: categoría a la izquierda, "TU LOGO" en gris suave al centro si no hay marca, iconos genéricos de búsqueda, cuenta y carrito a la derecha.

2. **Sección a 2 columnas:**
   - **Izquierda:** galería 2x2 con marcos placeholder.
   - **Derecha** (sticky en desktop, static en móvil): nombre del producto, línea descriptiva corta, precio grande, valoración **solo si es real**, swatches de color clickeables que actualizan el nombre del color activo, selector de variantes clickeable, botón principal grande y rectangular "AGREGAR AL CARRITO" con `id="compra"`, y lista de perks (envío, devolución, garantía) con las políticas reales de la tienda.

3. **Acordeón `<details>` "DESCRIPCIÓN"** con descripción, características, materiales y calce o medidas.

4. **Acordeón `<details>` "ENVÍOS Y DEVOLUCIONES"** con las políticas reales, en tono humano.

### Zona 2 — Landing de venta

5. **Identificación con el dolor:** título grande + 2 o 3 frases que el cliente final reconozca al instante, en sus palabras.

6. **Solución visual:** titular + lead corto + bloque a 2 columnas. Izquierda, placeholder de video 16:10 con ícono ▶. Derecha, 3 tarjetas apiladas con especificaciones verificables (número grande en color de acento, label corta, frase de contexto). Nunca un bloque denso de párrafos.

7. **4 a 6 beneficios** en grid de 2 o 3 columnas, cada uno con ícono discreto, mini titular y 1 o 2 frases. Beneficios como transformación, no como features sueltas.

8. **"Por qué funciona"** en 3 pasos numerados grandes, con la razón racional que sostiene la promesa emocional.

9. **3 o 4 objeciones** en `<details>/<summary>`. Las difíciles incluidas: "¿no es caro?", "¿y si no me sirve?", "¿cuánto tarda?". Respuestas honestas, sin esquivar.

10. **Prueba social:** 3 tarjetas. Reseñas reales del cliente si existen, placeholders marcados si no. Ver la tabla de arriba.

11. **Garantía** (y urgencia solo si es real): cajitas chicas en paralelo, grid de 2 columnas, max-width ~900px, tipografía chica, sin titulares grandes ni botones. Si no hay urgencia real, la garantía va sola centrada.

12. **Footer** minimalista de una línea.

**No incluir** un bloque final tipo hero CTA con titular grande y botón gigante después de la prueba social. El único CTA fuerte de la página es el "AGREGAR AL CARRITO" de la ficha.

---

## REGLAS DE COPY

- Español **neutro** (es una página que ve el cliente final, y varias tiendas venden a toda LatAm). Rioplatense solo si la marca es argentina, le habla solo a Argentina y su `brand-voice.md` lo respalda.
- Con tildes y eñes, escritas de entrada. Ver `.claude/rules/humanizer-policy.md`.
- **Sin em dashes.** Coma, punto o paréntesis.
- Tono humano, conversacional, segunda persona.
- Frases cortas, párrafos de 1 a 3 frases.
- Cero clichés: "calidad premium", "el mejor del mercado", "innovador", "revoluciona", "único en el mercado", "solución integral".
- Beneficios como transformación tangible (antes y después), nunca features sueltas.
- La palabra exacta que usaría el cliente final, no jerga de marketing.
- Cada bloque tiene que poder leerse aislado y seguir teniendo sentido.
- **Pasada de [`humanizer`](../humanizer/SKILL.md) antes de entregar.**

---

## REGLAS TÉCNICAS PARA QUE NO SE ROMPA

- El grid de la ficha lleva `align-items: start`, si no los acordeones de la columna sticky mueven la galería.
- En móvil (`max-width: 980px`) la columna derecha pasa a `position: static !important`.
- `<details>/<summary>` con `cursor: pointer`, `list-style: none` y `::-webkit-details-marker { display: none; }`.
- `scroll-behavior: smooth` en `html` para el ancla `#compra`.
- **Interactividad obligatoria:** bloque de JavaScript vanilla al final del body, sin librerías, que permita clickear cualquier swatch de color (marca `.active` y actualiza un `<span id="colorName">`) y cualquier botón de variante (marca `.active`). Swatches con atributo `data-color="NombreDelColor"`.
- Verificá que abrir un acordeón y clickear swatches no produzca saltos de layout.
- Si el HTML lleva anclas internas, no toques los `id` al corregir texto: un reemplazo global de acentos sobre `id="descripcion"` rompe el menú sin que se note.

---

## FORMATO DE SALIDA

Un único archivo HTML autocontenido: CSS embebido, JavaScript vanilla mínimo (solo selectores de variante y el comportamiento nativo de `<details>`). Sin librerías, sin URLs externas, sin comentarios que expliquen el diseño.

**Tokens por defecto** (scaffold neutro, para cuando el cliente no tiene identidad definida):

```
:root { --bg:#f5f6fa; --surface:#ffffff; --text:#0a0a0a; --text-soft:#6b7280; --accent:#1e3aff; --accent-soft:#e8eaff; --highlight:#f5c46b; --highlight-soft:#fff8e8; --border:#e5e7eb; }
font-family: system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif;
```

**Si el cliente tiene colores y tipografía de marca, se usan los suyos.** Los tokens de arriba son el fallback, no la identidad: esta página va a vivir dentro de su tienda.

**Reglas visuales:**

- Titulares peso 800 con letter-spacing levemente negativo. Mucho espacio en blanco. Estética limpia, no oscura, no neón.
- Tarjetas con borde 1px, esquinas 8-16px, sombras casi inexistentes.
- Botón "AGREGAR AL CARRITO" grande y rectangular, oscuro o en el color de marca.
- Swatches circulares de 38px con borde 2px (oscuro al estar activo).
- Botones de variante cuadrados 52x44px, borde 1px (2px y oscuro al estar activo).
- Objeciones con acordeón "+" / "−" en el color de acento.
- Caja de garantía con fondo `var(--accent-soft)`. Urgencia, si existe, `var(--highlight-soft)` con borde `var(--highlight)`.
- Placeholders siempre como marco gris con texto centrado. Nunca un rectángulo que diga "Imagen".

---

## GUARDADO

El HTML va a `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-landing-{producto}.html` + entrada en el worklog con el ángulo elegido y qué quedó pendiente de reemplazar. Si hay que mostrarla, se publica con `Artifact`.
