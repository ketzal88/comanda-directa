---
name: ad-copy-deck
description: Formato de entrega de copies para ads de Meta y Google. Define los campos, los límites de caracteres y cómo entregarlos para copiar y pegar sin fricción (bloques limpios en el chat + página con botones de copiar). Usar SIEMPRE que Gabriel pida "copies para Meta", "copies para Google", "textos para los ads", "bajada creativa", "armá los anuncios", "RSA", "primary text", "títulos y descripciones", o cualquier variante de escribir el texto de un anuncio.
allowed-tools:
  - Read
  - Write
  - Artifact
---

# Ad Copy Deck — formato de entrega

Cómo se entregan los copies. El **contenido** (ángulos, hooks, Schwartz, GEM/Andromeda) sale de [`paid-ads-meta`](../paid-ads-meta/SKILL.md) y [`google-ads-ad-copy`](../google-ads-skills/skills/google-ads-ad-copy/SKILL.md). Esta skill es el **formato**.

## Por qué existe

Gabriel copia y pega los copies en Meta Ads Manager, campo por campo. Si el texto viene enterrado en prosa markdown:

```
- **Copy (primary text):** "Tu local puede ser el mejor del rubro..."
```

…tiene que seleccionar esquivando el `- **Copy (primary text):** "` y la comilla del final. Por cada campo. Con 5 copies × 3 campos son 15 selecciones quirúrgicas, y cualquier resbalón mete un asterisco adentro del anuncio.

## Qué se entrega

### Meta (Facebook / Instagram / Threads / Click-to-WhatsApp)

**5 de cada campo. Siempre los 3 campos.**

| Campo | Límite | Regla |
|---|---|---|
| **Texto principal** | ~125 | Se corta con "Ver más" en mobile feed. El hook va en los primeros 125. Total técnico ~2.200, pero óptimo 250-500 |
| **Título** | 40 máx | FB feed muestra solo ~27 → **apuntar ≤27**, tope 40 |
| **Descripción** | ~25 | Solo renderiza en algunos placements (Marketplace, Audience Network, in-stream, columna derecha desktop). Va igual |

> **Nunca entregar solo texto principal + título.** El ad de Meta tiene 3 campos editables; entregar 2 deja el deck incompleto y obliga a pedir el tercero. Es un error repetido.

### Google (RSA — Responsive Search Ads)

**El asset completo, no 5.**

| Campo | Cantidad | Límite |
|---|---|---|
| **Títulos** | 15 | 30 c/u |
| **Descripciones** | 4 | 90 c/u |

Google rota 3 títulos de los 15 por impresión y mide **Ad Strength** según cuántos slots estén llenos. Entregar 5 deja 10 vacíos y el ad arranca penalizado.

Cada título tiene que funcionar **solo y combinado** con cualquier otro: Google los mezcla. Agruparlos por propósito (beneficio, prueba, CTA, marca, urgencia).

## Agrupado por campo, no por variación

Así pide los textos Meta Ads Manager: pilas por campo, no fichas por variación.

```
Texto principal ⓘ
  ┌────────────────────────────┐
  │ Entramos en la Guía...     │   ← los 5, uno abajo del otro
  ├────────────────────────────┤
  │ El reconocimiento es...    │
  └────────────────────────────┘
Título ⓘ
  ┌────────────────────────────┐
  │ Estamos en la Guía Michelin│   ← los 5, uno abajo del otro
  ├────────────────────────────┤
  │ Gracias por ser del barrio │
  └────────────────────────────┘
Descripción ⓘ
```

El entregable sigue **ese** orden. Agrupar por variación obliga a saltar entre bloques mientras se carga.

### Y por eso no existe el pairing

Meta trata cada campo como un **pool independiente** y los mezcla: puede servir el texto principal 5 con el título 2. Consecuencias al escribir:

- **Cada texto principal tiene que funcionar con cualquier título**, y viceversa. Mismo principio que los 15 títulos del RSA de Google.
- No escribir un título que solo cierre con *su* texto principal.
- No repetir el mismo dato en ambos: si el texto principal ya dice "Guía Michelin 2026" y el título también, esa combinación sale redundante.
- Los 5 ángulos son disciplina de escritura para que el pool tenga variedad. **No son parejas que Meta vaya a respetar.**

## Cómo se entrega

Las dos cosas, siempre:

### 1. En el chat — bloques limpios, agrupados por campo

Cada texto en su propio bloque, **sin markdown adentro, sin comillas, sin viñetas**. Lo que está adentro del bloque es exactamente lo que va pegado:

````
TEXTO PRINCIPAL (5)

1 · la noticia · 105/125 ✓
```
Entramos en la Guía Michelin 2026. Lo celebramos con quienes nos eligen desde siempre: 10% en tu reserva.
```

2 · vecinos · 100/125 ✓
```
El reconocimiento es nuestro. La mesa, tuya. 10% para los vecinos que nos hicieron parte del barrio.
```

TÍTULO (5)

1 · la noticia · 27/40 ✓
```
Estamos en la Guía Michelin
```
````

El nombre del ángulo va al lado del conteo, para saber qué es cada uno sin que estorbe el copy-paste.

> Los conteos son reales (`len()` del string exacto), nunca estimados.

### 2. Una página con botones de copiar

Publicar con la tool `Artifact`, usando [`references/template.html`](references/template.html). Un click por campo y queda en el portapapeles, limpio. El contador se pone rojo solo si se pasa del límite.

Es el mismo dato en dos vehículos: el chat sirve para revisar, la página para cargar en la plataforma sin salir del browser.

**La página es un checklist, no una lista.** Cada campo copiado queda pintado en verde con un ✓ y suma a la barra de progreso del header ("8/22 copiados"). Cargar un ad de Meta son 15 pegadas alternando entre dos pestañas: lo que se pierde no es el texto, es el lugar donde ibas. El verde sobrevive al scroll y hay un "destildar todo" para la segunda tanda.

Un campo solo se pinta si el texto **entró de verdad** al portapapeles. Pintar en verde algo que falló es peor que no pintar nada: te hace saltear el campo.

## Nombre del anuncio y tracking

El template genera dos secciones más si el `DECK` trae `anuncio` y `utm`. No son decoración: sin ellas los copies entran bien a Meta y salen inservibles del otro lado.

### Nomenclatura

La convención de Gabriel. Es la que usa en Ads Manager, no una propuesta:

```
Guion - Estructura - Hook   →   Script1 - Problema/Solución - Negative Hook
```

| Segmento | Qué es | Cambia dentro del deck |
|---|---|---|
| **Guion** | qué video es | No — es el mismo video |
| **Estructura** | la estructura narrativa del guion (`Problema/Solución`, `Antes/Después`, `Listicle`) | No |
| **Hook** | cómo abre ese copy (`Negative`, `Question`, `Callout`, `Relatable`, `Contrarian`) | **Sí** — es lo único que distingue un anuncio del otro |

Por eso el template lo parte en `fijo` (los dos primeros) y `variantes` (uno por ángulo): dentro de un deck el video y la estructura son constantes, y el hook es justamente lo que cambia entre los copies. Se escribe legible, con espacios y acentos.

Las tres dimensiones son las que después se comparan **entre** videos: qué guion rindió, qué estructura narrativa funciona, qué tipo de apertura engancha. `AD5` en un reporte de GA4 no dice nada; `Negative Hook` sí.

> El nombre viaja al `utm_content` vía `{{ad.name}}`, y Meta lo pega sin encodear: los espacios llegan como espacios (el browser los pasa a `%20`). Es legible y sirve, pero si algún día un redirect intermedio corta la URL en el primer espacio, el sospechoso es este.

### Parámetros de URL

Van en Ads Manager → nivel anuncio → Seguimiento → **Parámetros de URL** (no pegados al destino, aunque el template también arma la URL completa por si hace falta).

```
utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Los `{{macros}}` los resuelve Meta al servir. `utm_id` lleva el ID de campaña: es estable, no cambia al renombrar y sirve para joinear contra la API. Los `.name` son los que se leen en el reporte, y por eso la nomenclatura de arriba no es opcional.

Los clientes lead-gen cuyo formulario captura campos ocultos suman `&fb_adid={{ad.id}}` para tener la llave del anuncio en el registro del lead. Excepciones por cliente, reglas de nombres y por qué `facebook` y no `meta`: [`docs/utm-standard.md`](../../docs/utm-standard.md).

## Reglas duras

1. **Contar los caracteres de verdad**, campo por campo. No estimar. Si un campo se pasa, reescribirlo — no entregarlo en rojo esperando que Gabriel lo arregle. El rojo del template es una red de seguridad, no el entregable.
2. **Los 3 campos × N.** Meta 5×3. Google 15 títulos + 4 descripciones.
3. **Humanizer pass antes de entregar** — ver [`.claude/rules/humanizer-policy.md`](../../.claude/rules/humanizer-policy.md). Ad copy va en **español neutro** salvo que el cliente sea argentino y el canal informal.
4. **Registro y claims según el cliente.** Leer su `brand-voice.md` y respetar los guardrails de claims. Si el cliente no puede afirmar algo, no lo afirmes.
5. **Guardar el deck** en `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-copies-{canal}.md` y appendear al worklog.

## Contar caracteres

Contar el string exacto que se pega, con espacios y signos. Los emojis cuentan como 1 en la UI de Meta pero pueden contar más en la API — si hay emojis, dejar margen.

```python
# Un contador que no miente: sin markdown, sin comillas, sin espacios de sobra.
texto = "Tu local puede ser el mejor del rubro, pero si no se ve, no entra nadie."
print(len(texto))  # 71
```

## Cuando los límites cambian

Meta y Google mueven los límites sin avisar. Si algo huele desactualizado, verificar en la doc oficial antes de entregar y actualizar esta tabla. Los de acá están confirmados a **2026-07**.
