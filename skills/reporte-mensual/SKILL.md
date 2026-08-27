---
name: reporte-mensual
description: >-
  Arma el reporte de gestión mensual de un cliente de Worker con los datos del
  Brain: cierra el mes calendario por canal, lo compara contra el mes anterior,
  explica qué pasó usando el worklog, y lo publica como HTML en brain.worker.ar.
  Usar cuando Gabriel pida "el reporte de gestión de", "el cierre de mes de",
  "el reporte de julio de", "armá los reportes del mes", cuando corra la tanda
  mensual del día 3, o cuando haya que presentarle resultados del mes a un
  cliente. NO es para compilar auditorías (eso es market-report) ni para armar
  una propuesta comercial (eso es worker-proposals).
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - AskUserQuestion
---

# Reporte de gestión mensual

Un reporte por cliente activo, con el mes cerrado contra el mes anterior, lo que
se hizo, lo que falló, y qué cambia el mes que viene. Se publica en el Brain y se
presenta en la reunión mensual.

**Referencia viva:** `clients/ecommerce/cordoba-notebooks/deliverables/2026-08-04-reporte-julio-2026.html`
(publicado en `brain.worker.ar/p/cordoba-notebooks-reporte-julio-2026`). Ese fue
el primero y de ahí salieron las reglas de abajo.

---

## Regla 0 — la frescura manda, y va antes que cualquier número

`get_client_brief` trae `freshness` por canal. **Leerla primero.** Si un canal dice
`stale`, `missing` o `not_integrated`, sus números no se reportan como si fueran
verdad:

| Estado | Qué significa | Qué se hace |
|---|---|---|
| `ok` | sync al día | se usa |
| `stale` | el sync viene atrasado | se usa avisando la fecha de corte |
| `missing` | está integrado y NO llega data | **bloque de aviso en el reporte**, y es un pendiente |
| `not_integrated` | no existe la integración | no se menciona el canal, o se explica que no hay medición |

Un `missing` en el canal de la métrica principal del cliente no es un detalle
técnico: es que no se puede medir el objetivo. Shallpass tiene GHL integrado y
`LEADS: missing`, o sea que los agendamientos, que son *su* métrica, no llegan.
Eso va arriba en el documento, no en una nota al pie.

### `freshness: ok` NO significa que la serie esté completa

`freshness` mira **solo la última fecha**. No dice nada de los agujeros.

Cambre, agosto 2026: META daba `status: ok`, `ageDays: 1`. Y al pedir la serie
diaria, todos los días del 1 de junio al 14 de julio venían con `spend: 0`,
`impressions: 0` y todo en cero. Los datos reales arrancaban el 15 de julio.
Sondeando mayo, también cero. O sea 44 días del mes que había que reportar sin un
solo dato, detrás de un `ok`.

**Siempre contar cobertura antes de comparar meses:**

```python
dias_con_gasto = sum(1 for d in serie if d["metrics"].get("spend", 0) > 0)
# si dias_con_gasto < dias del mes -> averiguar POR QUE antes de escribir nada
```

Y ojo con la diferencia entre las dos formas de "no hay dato", porque significan
cosas opuestas:

| Forma | Qué es | Ejemplo |
|---|---|---|
| El día **no aparece** en la respuesta | no hubo actividad | `ECOMMERCE` de Córdoba no devuelve los domingos sin pedidos |
| El día aparece **con ceros explícitos** | el job corrió y escribió cero | Meta de Cambre, jun al 14/7 |

La segunda es la peligrosa: un cero explícito puede ser una cuenta apagada o un
sync que falló y guardó cero igual. **Desde el Brain no se puede distinguir.** Se
pregunta a quien opera la cuenta o se abre Ads Manager. Nunca se reporta "la
inversión bajó" sobre ceros que no se verificaron.

En el caso de Cambre la respuesta fue que **el cliente no tenía tarjeta para
pagarle a Meta**, así que la cuenta estuvo sin pauta 44 días. O sea: el dato que
parecía un bug era el hecho más importante del mes y terminó siendo el titular
del reporte. Vale la pena preguntar.

---

## Regla 1 — los agregados del brief NO sirven para un reporte mensual

Dos razones distintas, las dos fatales:

1. **La ventana es rolling, no el mes.** `last30d` en un brief del 4 de agosto es
   del 5 de julio al 3 de agosto. No es julio.
2. **Los ratios vienen sumados día a día.** El brief de Córdoba a 30 días daba
   `ctr: 143,79`, `roas: 2478` y `cpa: $786.843`. Son la suma de los valores
   diarios, no el promedio ni el ratio del período.

**Siempre:** `get_channel_metrics` con el rango exacto del mes, sumar solo los
campos aditivos y recalcular todo ratio a mano.

```
Aditivos (se suman):    spend, impressions, clicks, purchases, revenue, leads,
                        formLeads, whatsappConvos, addToCart, orders, conversions
NO aditivos (se recalculan): ctr, cpc, cpm, cpa, roas, frequency, avgOrderValue,
                        itemsPerOrder, engagementRate, bounceRate, conversionRate,
                        fulfillmentRate, ecommerceConversionRate
```

`reach` no se suma ni se promedia: es personas únicas y no hay forma de
deduplicarlo entre días. Si hace falta alcance mensual, sacarlo de Ads Manager.

Traer los dos meses en una sola llamada por canal (`startDate` del mes anterior,
`endDate` del mes que se reporta) y partir después. Menos llamadas, mismo dato.

---

## Regla 2 — la fuente de verdad de la métrica principal

Esto es lo que cambia de cliente a cliente y lo que hace que un reporte
automático mienta si se asume. Sale del bloque de config del cliente (ver abajo),
nunca de la intuición.

| Tipo de cliente | Métrica | De dónde sale |
|---|---|---|
| Ecommerce con tienda integrada | ventas, facturación | canal `ECOMMERCE` (Woo, Tiendanube, Shopify) |
| Ecommerce que cierra por WhatsApp | ventas | `ECOMMERCE` si el vendedor carga la orden; si no, planilla del cliente |
| Lead gen con CRM | leads calificados | canal `LEADS` |
| Lead gen sin CRM | leads | `formLeads` / `pixelLeads` de Meta, avisando que es el pixel |
| Agendamiento | reservas | canal `LEADS` (GHL, Calendly) |

**Validar la fuente contra algo independiente antes de usarla.** Para Córdoba
comparé los pedidos de Woo contra la planilla del cliente semana por semana
(57 vs 54, 42 vs 43) antes de decidir que Woo era la base. Sin ese control, un
número que no coincide con la planilla del cliente se descubre en la reunión.

---

## Regla 3 — las conversiones de las plataformas no son ventas

En cualquier cuenta donde el cierre pasa por una persona (WhatsApp, teléfono,
showroom), lo que Meta y Google llaman conversión es otra cosa:

- **Google Ads:** en Córdoba está medido que el ranking de campañas por costo por
  conversión tiene correlación de Spearman **−0,10** contra la ganancia real que
  informó el cliente. O sea: cero, y si acaso al revés. Las dos "mejores"
  provincias por costo por conversión generaron $0 de ventas.
- **Meta:** atribuye por vista, y si la campaña optimiza a mensajería, la
  "conversión" es una conversación abierta, no una venta.
- **`allConversions` de Google** incluye micro conversiones. Cambre muestra 383
  conversiones y 4.386 `allConversions` en 30 días. Antes de poner un CPL, hay
  que saber qué evento cuenta esa cuenta.

Consecuencia práctica: **el ROAS y el CPA de las plataformas no van en el reporte
como resultado.** Van, si van, como costo de insumo y en gris.

Y las alertas del Brain heredan el problema: `BUDGET_BLEED` y las de CPA se
calculan contra el target CPA de compra. En una cuenta que corre a mensajería
marcan como fuga campañas que funcionan. No citarlas sin traducirlas a la métrica
real de esa campaña.

---

## Estructura del documento: DOS secciones

**Canónica desde el 11 de agosto de 2026.** Reemplaza la estructura de 5 secciones
que estuvo vigente una semana. Gabriel la recortó a mano, pegando las cuatro
secciones de más y escribiendo *"saca todo esto y pone un cierre mas simple y corto
del mes. Ya te dije q no hables tanto"*.

```
Hero          titular honesto + 3 o 4 stats con su delta
01 Resultados las tablas del mes, mes vs mes anterior. Cards solo si aportan
02 Cierre     lead de dos frases + 3 renglones: qué hacemos, qué necesitamos
```

Y nada más. El cierre son **tres ítems de una línea cada uno**, no una sección de
prioridades ni una de pendientes. Referencia de tamaño: el reporte de julio de
Shall Pass entra en 18,6 KB y 859 palabras visibles.

### Qué NO va, aunque esté bien escrito y sea verdad

| Fuera del reporte | Dónde va |
|---|---|
| La sección "Qué pasó": causas, diagnóstico del creativo, días al aire, hook rate | worklog del cliente |
| La sección "Lo que se encontró": correcciones de medición, bugs del Brain, ratios mal leídos | worklog, y si aplica a todos los clientes también al CLAUDE.md raíz |
| El listado de prioridades del mes que viene con su justificación | worklog. Al cierre va el titular de cada una, sin el porqué |
| La sección de pendientes desglosada | al cierre, en **un** renglón con las dos cosas que de verdad bloquean |

**El reporte mensual es tipo B, no tipo A.** Es el error de criterio que lo infló:
parece comercial porque lo lee el cliente, pero el cliente ya compró. Lo que
necesita es cómo le fue y qué sigue. El análisis de *por qué* le fue así justifica
nuestro trabajo ante nosotros, no ante él. Ver la sección "Corta" de
[`worker-proposals`](../worker-proposals/SKILL.md), que dice lo mismo y es de la
semana anterior.

Los canales van **dentro** de Resultados, nunca como sección propia.

### De dónde sale el cierre

Del `worklog.md` del cliente, filtrado fuerte.

```bash
# entradas del mes que se reporta
grep -n "^## 2026-07" clients/{tipo}/{slug}/worklog.md
```

De todo lo que aparezca, al cierre suben **dos acciones nuestras y un pedido**. El
criterio de corte es el tamaño de la palanca, no el orden cronológico ni cuánto
trabajo nos costó. Todo lo demás se queda en el worklog, que es donde sirve para
la sesión siguiente.

Si el worklog del mes está vacío, el reporte va a ser una tabla sin historia. Eso
no es un problema del reporte, es un problema del worklog.

### Titular

Describe el mes, no lo vende. "Más contactos, menos ventas" cuando la conversión
cayó. Si el mes fue bueno, se dice que fue bueno. Ver
[`humanizer-policy.md`](../../.claude/rules/humanizer-policy.md) y el criterio de
tono balanceado: nada de encuadre promocional sobre resultados mixtos.

### El color es un veredicto

Verde y rojo solo en **resultados** (ventas, facturación, leads, costo por
resultado). Los costos de insumo (costo por clic, costo por conversación, costo
por mil) van en **gris**, `delta-flat`, incluso cuando bajaron.

Pintar de verde un costo por conversación que bajó 58% mientras el costo por
venta subió 25% le dice al cliente lo contrario de lo que dice el reporte. En
Córdoba eso se corrigió sobre el render y se agregó una nota explicando el gris.

### Decisiones propias

Cuando el mes se explica por una decisión de Worker, va nombrada como propia
("duplicamos el presupuesto"), no en voz pasiva. Es distinto del criterio para
errores de una persona del equipo, donde se usa pasiva para no exponer a nadie.
La agencia se hace cargo; la persona no se nombra.

---

## Flujo

1. **Config del cliente.** Leer el bloque `## Reporte mensual` del `CLAUDE.md` del
   cliente. Si no existe, crearlo (schema abajo) antes de seguir.
2. **`get_client_brief`.** Frescura, targets, alertas, contexto. No para números.
3. **`get_channel_metrics`** por canal, mes reportado + mes anterior.
4. **Sumar y recalcular** con un script en el scratchpad. Nunca a ojo, nunca
   estimado. Guardar el script: el mes que viene se reusa.
5. **Leer el worklog del mes.** Secciones 3, 4 y 5.
6. **Escribir el JSON** en `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-reporte-{mes}-{año}.json`.
7. **Generar:** `python scripts/build-report.py <ruta al json>`. Valida y escribe
   el `.html` al lado.
8. **Verificar en el navegador.** Que las tabs cambien de panel, que no haya
   scroll horizontal, que ninguna sección quede en blanco.
9. **Entrada en el worklog** con los números del cierre y las decisiones tomadas.
10. **Publicar** con `upload_proposal` (`category: "interna"`, `isPrivate: true`),
    después de chequear el slug con `list_proposals`. Slug:
    `{slug}-reporte-{mes}-{año}`.

El paso 7 existe para no reescribir el design system en cada reporte y para que
los tres fixes de producción se apliquen siempre. Ver los comentarios de
`scripts/build-report.py`.

---

## Qué preguntar y qué no

La mayor parte no se pregunta: está en el Brain o en el worklog. Preguntar solo
lo que ningún archivo sabe:

**Sí preguntar**
- Encuadre, cuando el mes salió mal por una decisión nuestra.
- Fuente de ventas, cuando el cliente lleva planilla propia y puede no coincidir.
- Alcance contratado, si el bloque de config no está o quedó viejo.
- Un número del cliente que no está en ningún sistema (margen, cierres reales).

**No preguntar**
- Qué pasó en el mes: está en el worklog.
- Qué se corrigió: está en el worklog.
- Los números: están en el Brain.
- Si publicar: publicar solo con OK explícito, pero preguntarlo una vez al final,
  no de entrada.

---

## Bloque de config en el CLAUDE.md del cliente

Va en el `CLAUDE.md` de cada cliente porque se auto carga al abrir el cliente,
queda versionado en git, y lo edita cualquiera del equipo sin tocar código.

```markdown
## Reporte mensual

- **Alcance contratado:** Meta Ads, Google Ads, producción creativa
- **Métrica principal:** ventas
- **Fuente de verdad:** canal `ECOMMERCE` (WooCommerce)
- **Control cruzado:** planilla de ventas de Federico (jue a mié)
- **Canales a reportar:** META, GOOGLE
- **Margen bruto:** 15% (de la tabla de ganancia por provincia, jul 2026)
- **Comparación:** mes anterior
- **Destinatario:** Federico (decision maker)
- **No reportar:** ROAS ni CPA de plataforma como resultado (cierra por WhatsApp)
```

`No reportar` es el campo más importante y el que evita el error más caro. Es
específico de cada cuenta y no se deduce de ningún dato.

---

## Gotchas

- **El generador valida y aborta.** Si frena por acentos o em dashes, se corrige
  el JSON, no se corre con `--sin-validar`.
- **Los JSON se leen con `utf-8-sig`**: cualquier editor de Windows deja BOM.
- **`get_channel_metrics` no desglosa por campaña.** Para cortar por campaña en
  Meta, `get_entity_rolling_metrics`. Para Google devuelve vacío: ahí hace falta
  export manual.
- **`get_creative_intelligence` puede venir con meses de atraso.** Chequear
  `range` antes de citarlo.
- **Días sin datos son días sin actividad**, no huecos. El canal `ECOMMERCE`
  simplemente no devuelve el día si no hubo pedidos: no interpolar.
- **El Brain cachea las propuestas.** Después de un upsert, verificar con `?v=N`.
- **Un flag de estado en un export (`Excluida`, `Pausada`) es el estado de HOY**
  anotado sobre métricas históricas. No inferir de ahí cuándo se hizo el cambio.
