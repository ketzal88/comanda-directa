# Protocolo de spec — antes de crear la campaña

Cómo se decide qué crear y cómo se verifica que salió bien. El **cómo se crea** (endpoints, parámetros, errores) está en [`../SKILL.md`](../SKILL.md).

Aplica igual si la creación va por Marketing API directa o por el MCP oficial de Meta (`mcp.facebook.com/ads`). Cambia el ejecutor, no el protocolo.

---

## Por qué existe

Dos fallas reales, agosto 2026, primera campaña creada por MCP:

1. **Píxel y evento equivocados.** Los IDs sensibles no están versionados (decisión de [`clients/_status-report-2026-06-10.md`](../../../clients/_status-report-2026-06-10.md)), así que el modelo los resuelve en runtime sin ninguna regla. No se equivocó: le pedimos que adivine.

   El **píxel** casi nunca es ambiguo — el 99% de los clientes tiene una sola cuenta y un solo píxel activo. El que sí es ambiguo siempre es el **evento**, porque es una elección libre aunque el píxel sea el correcto:

   | Cliente | Trampa del evento |
   |---|---|
   | Vinitus | `actionType: app_install` pero el evento del píxel es `Purchase` |
   | Lati-Travel | `conversions` viene al doble de `formLeads` — usar `formLeads`/`pixelLeads` |

   Un píxel correcto optimizando al evento equivocado gasta igual y no se ve en el setup: se ve en los resultados, dos semanas después.

2. **Copies malos.** Se pidió crear campaña *y* escribir copy en el mismo turno. Ese camino saltea [`ad-copy-deck`](../../ad-copy-deck/SKILL.md), el `brand-voice.md` del cliente, el conteo real de caracteres y el humanizer. Un turno con seis decisiones las resuelve todas a medias.

La conclusión de las dos: **el ejecutor no decide nada**. Todo lo que requiere criterio se resuelve antes, se escribe en una spec, se confirma, y recién ahí se ejecuta.

---

## Paso 1 — Resolver IDs

Antes de tocar nada, resolver y **fijar** cada ID que la campaña vaya a usar.

| Qué | De dónde | Se escribe en la spec como |
|---|---|---|
| Ad account | `get_client_profile` (Brain), según el cliente del cwd | Nombre + últimos 4 |
| Píxel / dataset | Brain, o `/{ad_account}/adspixels?fields=id,name,last_fired_time` | Nombre + últimos 4 + `last_fired_time` |
| Evento de conversión | `brand-voice.md` / `CLAUDE.md` del cliente + tabla de eventos del SKILL | Nombre del evento (`Purchase`, `Schedule`, `Lead`) |
| Page ID | `/me/businesses` → `/owned_pages` | Nombre de la página |
| Custom audiences | `/{ad_account}/customaudiences?fields=id,name,approximate_count,time_updated` | Nombre + tamaño + última actualización |
| Creativos (video/imagen) | `/{ad_account}/advideos`, `/adimages` | Nombre de archivo |

### El ad account no se elige de la lista

El acceso a las cuentas de clientes va por el Business Manager de Worker: una sola autorización que ve **todas** las cuentas. `/me/adaccounts` y el connector devuelven las 31, no la del cliente en el que estás trabajando.

Entonces el ad account **se lee del cliente del cwd** (`clients/{tipo}/{slug}/CLAUDE.md` → `get_client_profile`) y se verifica contra el nombre. Nunca se elige de la lista que ofrece el connector, ni por orden ni por parecido de nombre.

Errarle al píxel ensucia datos. Errarle a la cuenta le crea la campaña de un cliente adentro de otro.

### Los IDs completos no van a git

El deliverable queda versionado, así que guarda **nombre + últimos 4 dígitos**, nunca el ID entero. El ID completo se resuelve en runtime y se valida contra esos 4 antes de usarlo. Si no coinciden, se frena.

```
pixel: "Elepants Web" ...4821 | Purchase | last_fired: 2026-08-06 09:14
```

El humano verifica por nombre. El sistema verifica por ID. Git no ve el número.

### Regla de desambiguación del píxel

Cadena de resolución, en orden. Se corta en el primer nivel que responda:

1. **Un solo píxel activo en la cuenta** → ese es. Cubre el 99% de los clientes.
2. **Varios activos** → el que se llame como el cliente.
3. **Ninguno se llama como el cliente** → el que esté vinculado a la cuenta publicitaria.
4. **Sigue ambiguo** → el `pixelId` del perfil del cliente en el Brain (`get_client_profile`).
5. **El Brain no lo tiene** → frenar y preguntar. No elegir por orden de la lista.

El nivel 4 está cuarto y no primero a propósito: el `pixelId` del onboarding queda vacío en clientes que no completaron el perfil (Elepants es uno) y puede quedar viejo cuando se cambia el píxel sin refrescar. Sirve como desempate, no como fuente primaria.

En cuentas con ARS y USD el píxel se comparte, así que tener dos cuentas no implica dos píxeles.

### Píxel sin disparar

`last_fired_time` de hace más de **7 días** = muerto, o el sitio dejó de mandar eventos. En los dos casos se avisa antes de usarlo — no frena la creación, pero va dicho en la spec.

---

## Paso 2 — Los copies vienen de un deliverable aprobado

**El ejecutor nunca escribe copy.** Solo pega strings ya aprobados.

Si no existe el deliverable de copies, se frena y se corre [`ad-copy-deck`](../../ad-copy-deck/SKILL.md) primero. Sale de ahí con los 3 campos de Meta (texto principal, título, descripción), 5 de cada uno, con caracteres contados de verdad.

En la spec, cada ad referencia el archivo y la variación, no el texto:

```
Ad 1: copies <- deliverables/2026-08-05-copies-meta.md (texto 2 / título 4 / desc 1)
```

Así el read-back del paso 5 puede comparar el string que quedó en Meta contra el string del deliverable, carácter por carácter.

---

## Paso 3 — Escribir la spec

Va en `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-campaign-{nombre}.md`.

```markdown
# Campaña: {nombre} — {cliente}
Spec generada: {fecha} · Estado: PENDIENTE DE CONFIRMACIÓN

## IDs resueltos
ad_account : "Elepants AR"      ...7734
pixel      : "Elepants Web"     ...4821 | Purchase | last_fired 2026-08-06 09:14
page       : "Elepants"
audiencia  : "LAL 1% ATC 180d"  ...2351 | 1.840.000 pers. | act. 2026-08-04

## Estructura
Campaña   : Día del Niño — Conversiones
  objetivo: OUTCOME_SALES · buying_type AUCTION · status PAUSED

  Ad set 1: LAL 1% ATC
    budget      : $50.000/día
    bid_strategy: LOWEST_COST_WITHOUT_CAP
    optimización: OFFSITE_CONVERSIONS · custom_event_type PURCHASE
    placements  : FB feed/story/facebook_reels · IG stream/story/reels
    geo         : AR · 25-45
    status      : PAUSED

    Ad 1: creativo "dia-nino-01.mp4"
          copies <- deliverables/2026-08-05-copies-meta.md (texto 1 / título 3 / desc 1)
          CTA SHOP_NOW -> {url con UTMs}

## Confirmación
- [ ] Píxel y evento
- [ ] Copies
- [ ] Presupuesto y puja
- [ ] Audiencia y placements

## Read-back
PENDIENTE
```

---

## Paso 4 — Confirmación

Los cuatro bloques son **bloqueantes**. No se crea nada hasta que estén los cuatro tildados.

No es una confirmación por campo suelto: se muestra la spec completa, el operador la lee entera y confirma. Leerla lleva menos de un minuto; corregir una campaña mal creada llevó una tarde.

Si algo cambia durante la confirmación, se edita la spec y se vuelve a mostrar. La spec es siempre la fuente de verdad, nunca lo que se dijo en el chat.

---

## Paso 5 — Ejecutar y releer

Crear siguiendo [`../SKILL.md`](../SKILL.md). Todo en `PAUSED`.

Después de crear, **volver a leer de Meta lo que quedó** y compararlo contra la spec:

| Campo | Se relee de | Falla si |
|---|---|---|
| `account_id` | `/{campaign_id}?fields=account_id` | No termina en los 4 dígitos de la spec — **la campaña quedó en otro cliente** |
| `promoted_object.pixel_id` | `/{adset_id}?fields=promoted_object` | No termina en los 4 dígitos de la spec |
| `custom_event_type` | idem | ≠ el evento de la spec |
| `daily_budget` | `/{adset_id}?fields=daily_budget` | ≠ el monto (ojo: Meta devuelve centavos) |
| `bid_strategy` | idem | ≠ `LOWEST_COST_WITHOUT_CAP` |
| `targeting.custom_audiences` | `/{adset_id}?fields=targeting` | El ID no es el de la spec |
| `targeting` placements | idem | Falta alguna posición o aparece una de más |
| `message` / `title` / `link_description` | `/{creative_id}?fields=object_story_spec` | ≠ string exacto del deliverable de copies |
| `status` | todos los niveles | ≠ `PAUSED` |

Lo que no coincide se reporta como tabla: campo, esperado, obtenido. Sin esto, un píxel mal puesto se descubre abriendo Ads Manager a mano — que es exactamente lo que pasó la primera vez.

El resultado del diff reemplaza el `PENDIENTE` de la sección Read-back del deliverable.

---

## Paso 6 — Worklog

Entrada datada en `worklog.md` del cliente: qué se creó, link a la spec, y si el read-back dio limpio o qué campos hubo que corregir.

Los campos que fallan repetido son la señal de qué agregar a este protocolo.
