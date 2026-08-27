---
name: performance-diagnosis
description: |
  Encontrar el cuello de botella de una cuenta de paid media antes de tocar nada:
  de dónde salen los números, cuáles son los dos umbrales del negocio, qué
  combinación de métricas apunta a qué problema, y cuándo se apaga, se mantiene o
  se escala. Usar cuando pidan "por qué no funciona", "el ROAS bajó", "el CPL se
  fue arriba", "qué apago", "revisá la cuenta", "diagnóstico de cuenta",
  "auditoría de Meta / Google", o cuando haya que decidir sobre presupuesto.
license: MIT
metadata:
  category: operator
---

# Performance Diagnosis — encontrar el cuello de botella

Diagnosticar antes de cambiar. El orden importa: primero de dónde salen los números, después cuál es el KPI, después los umbrales del negocio, y solo al final la decisión sobre cada anuncio.

Para el contenido creativo (ángulos, hooks, GEM/Andromeda) el canónico es [`paid-ads-meta`](../paid-ads-meta/SKILL.md). Esta skill es la parte de decisión.

---

## 0 — De dónde salen los números

Arrancá con `Worker_Brain__get_client_brief({ clientId })`. Trae perfil, objetivo, targets, performance 7d/30d con delta, alertas y **frescura por canal**. Si un canal viene `stale` o `missing`, sus números no son de fiar y eso se dice antes de reportar.

Tres trampas que ya costaron reportes mal escritos:

1. **Los ratios del brief son sumas diarias, no promedios.** `frequency`, `ctr`, `cpm`, `cpc`, `cpa`, `cpp` vienen sumados día a día. Derivalos a mano siempre: frecuencia = `impressions/reach`, CTR = `clicks/impressions`, CPM = `spend/impressions×1000`, CPC = `spend/clicks`. Leer el `frequency` crudo (8,47 cuando el real era 1,21) manda a comprar audiencias nuevas cuando el problema era fatiga de gancho. Los campos aditivos (`spend`, `impressions`, `reach`, `clicks`, `conversions`, `leads`, `whatsapp`, `videoP*`) sí son sumas correctas.
2. **El CPA de cuenta no existe si conviven dos objetivos.** `performance.META` es de la cuenta entera. Si una campaña optimiza a conversaciones y otra a agendas, dividir spend total por conversiones de una sola campaña da cualquier cosa. El CPA se lee **por campaña o por anuncio**.
3. **Una alerta del Brain es una hipótesis, nunca un ítem de lista de tareas.** `BUDGET_BLEED` y `KILL_RETRY` reportaron cero conversiones sobre anuncios que tenían ventas en el Ads Manager, y `HOOK_KILL` marcó los anuncios con el costo por resultado más bajo de la cuenta (un video que retiene poco no es un video que no funciona). Antes de nombrar un anuncio para apagar, cruzalo contra **el costo por resultado del objetivo real** y **las órdenes de ese anuncio**. Si `get_entity_rolling_metrics` y `get_creative_performance` vienen vacíos, no hay con qué cruzar: pedí el export del Ads Manager y no recomiendes cortes.

Lo que el Brain **no** tiene y sí hay que preguntar: PVP, **margen bruto real**, costos variables por orden, LTV, y en lead-gen la **tasa de cierre** lead → cliente. Sin margen no hay umbral, y sin umbral el diagnóstico es opinión.

---

## 1 — El KPI lo define el objetivo, no el ROAS

Leé `clientObjective`, `primaryMetric` y `targetCpa` del brief **antes** de escribir una sola conclusión. `targetRoas: 0` es la señal explícita de que el ROAS no es la meta.

- Poner ROAS de titular en una cuenta de mensajería mide el canal contra un objetivo que nunca tuvo. El mismo mes puede pasar de "el ROAS cayó 72%" a "contactos +36% con el costo por contacto 3% abajo" solo por usar la métrica correcta.
- **Vocabulario:** *orden* = pedido cargado. *Venta cobrada* = otra instancia, no la mide ninguna plataforma. En cuentas de mensajería nunca escribas "ventas" a secas.
- En venta consultiva (cierre por chat), las "Conversiones" de la plataforma son clics al chat. El costo por conversión **no predice ganancia**: medido contra la ganancia real del cliente por provincia dio Spearman −0,10, y 4 de 5 candidatas a corte eran falsos positivos. Antes de recomendar un corte por eficiencia, conseguí el eje 2 (ganancia o ventas reales del lado del cliente). Si no está, entregá la lista como hipótesis y decilo.
- **Coherencia:** si cambiás la métrica que manda, todas las recomendaciones se recalculan con esa métrica. No se reencuadra el KPI arriba del reporte y después se arma la lista de apagados con el KPI viejo.

---

## 2 — Los dos umbrales del negocio

Son aritmética, no benchmarks. Se calculan con los datos del cliente y rigen todo lo demás.

**Ecommerce:**

```
Margen de contribución por orden = AOV × margen bruto % − costos variables
                                   (fulfillment + transacción + devoluciones)

ROAS de equilibrio = 1 / margen de contribución %
   (con margen bruto pelado da un piso optimista: usá contribución si la tenés)

CAC de equilibrio primera compra = margen de contribución de la primera orden
CAC techo con LTV               = margen de contribución de toda la vida del cliente
```

**Lead-gen (B2B):**

```
CPL de equilibrio = margen de contribución por cliente cerrado × tasa de cierre lead→cliente
```

Dos advertencias sobre el techo con LTV:

- Es un techo a **ganancia cero**, no un objetivo. El objetivo vive bien abajo.
- Sin **ventana de payback** definida (60, 90 días) el techo con LTV es una forma elegante de quedarse sin caja mientras el Excel dice que ganás. Definí en cuántos días tiene que volver el CAC y usá ese número para operar.

**El gatillo de escalado es el objetivo, no el equilibrio.** Escalar apenas se cruza el break-even es escalar a ganancia cero.

---

## 3 — Tabla de cuello de botella

La combinación apunta al problema. Ninguna métrica sola diagnostica.

| Señal | Cuello de botella |
|---|---|
| CPM alto + CTR bajo + hook rate bajo | **Creatividad.** El gancho no para el scroll |
| CPM normal + CTR alto + CVR bajo | **Landing u oferta.** Atraés y no convertís |
| Costo por resultado en alza + frecuencia real alta | **Audiencia saturada.** Rotar creativos o expandir |
| Frecuencia real normal + performance cayendo | **Fatiga de gancho.** Es creativo, no audiencia |
| CTR sano + add-to-cart bajo | **Ficha de producto.** Precio percibido, prueba social, dudas sin responder |
| Add-to-cart alto + checkout bajo | **Carrito.** Envío, costos sorpresa, fricción de pago |
| AOV bajo + CAC alto | **Oferta y ticket.** Sin bundle ni upsell no escala |
| ROAS de plataforma aceptable + margen comido | **Estructura de costos.** El problema no está en la plataforma |
| Volumen de leads OK + cero ventas | **Atención o calidad de cierre.** Mirá quién contesta y en qué horario, no el anuncio |

Ese último renglón salió de una cuenta con 2 vendedores, 4 domingos con 0 ventas sobre 152 chats y 4 lunes con más de 100 chats cerrando 10 cada uno. La eficiencia de un canal no se puede escalar más allá de la capacidad de respuesta del cliente: preguntá eso **antes** de proponer una reasignación de presupuesto.

---

## 4 — Umbrales de comparación: no los hardcodees

Los rangos "óptimos" de CPM, CPC y CTR que circulan vienen de cuentas en euros o dólares y **no transfieren a ARS**. Un CPM bajo no es evidencia de audiencia mala: depende de geo, placement, objetivo y estación.

Comparar contra, en este orden:

1. **La propia serie histórica de la cuenta.** Es la única base con el mismo mercado, la misma moneda y el mismo producto.
2. **`Worker_Brain__get_benchmarks`** para el vertical, si hay cobertura.
3. Rangos externos, solo marcados como referencia y con la moneda declarada.

Y andá a la **serie diaria, no al promedio**. Un promedio largo contra una ventana corta siempre ubica el quiebre al final de la serie, que es justo donde estás mirando. En una cuenta eso hizo datar en junio un cambio del 29 de abril que costó 78 días de gasto.

**Nunca inferir la fecha de un cambio desde las métricas.** Un flag de estado en un export (`Pausada`, `Excluida`) es el estado de hoy anotado sobre métricas históricas. La fecha real vive en el Historial de cambios de Google Ads: pedilo temprano y guardalo en el repo.

---

## 5 — Reglas de decisión

- **No apagar prematuramente.** Un anuncio no se apaga antes de haber gastado el equivalente a un CAC de equilibrio. Apagar antes destruye aprendizaje y es la recomendación más irreversible que existe.
- **Umbral de gasto significativo en ARS.** "Gastó mucho sin resultados" con 150 impresiones no es señal de nada. Verificá el volumen antes de leer la eficiencia.
- **Doble ventana, siempre.** "Máximo" para el gasto acumulado y la regla del CAC, "últimos 7 días" para el rendimiento reciente. Una sola ventana no alcanza.
- **No apagar por un día malo aislado.**
- **Escalado: +20% cada 24 h** sobre adsets consistentemente arriba del **objetivo** (no del equilibrio). Más rápido rompe el aprendizaje.
- **5 o 6 creativos ganadores estables** antes de pasar a estructuras de escalado tipo Advantage+.
- **ROAS de plataforma ≠ ganancia.** Sobreestima por atribución. Lo que decide es el margen de contribución después de producto, fulfillment, devoluciones y fijos. Si hay datos completos, MER blended.
- **Nunca estrategias de puja por valor** (Maximizar valor, tROAS) si el valor no vuelve a la plataforma. Si cierra por WhatsApp, no vuelve: el algoritmo abandona el volumen barato y persigue la minoría que reporta valor. Una cuenta perdió 60% de clics con el CPC al doble durante 78 días por ese cambio. El fix de fondo es importar conversiones offline con el valor real.
- Si la cuenta no se arregla con palancas internas, se dice: replantear margen o ticket antes de seguir invirtiendo.

---

## 6 — Salida

Causa raíz + qué hacer, en ese orden. Las tres palancas priorizadas, con la acción concreta (no "mejorar el copy": qué línea, de qué anuncio, cambiando qué por qué), el impacto estimado marcado **como estimación** y el plazo.

Dos cosas que no van en el entregable:

- Un score compuesto de "salud" sin fórmula. Si no podés reproducir el número, no lo pongas.
- Un número de dinero en la mesa presentado como cálculo cuando es un rango estimado. Si es estimación, se marca en el mismo tamaño de letra que el número.

Formato: `scripts/new-deliverable.py`, guardado en `clients/{tipo}/{slug}/deliverables/` y entrada en el worklog. El script que genera el reporte va al repo, no al scratchpad.

---

## Evitar

- Adivinar. Si falta el margen, se pide.
- Diagnosticar desde el promedio agregado.
- Convertir alertas en listas de apagado sin cruzar.
- Recomendar cortes por eficiencia en venta consultiva sin la ganancia real del cliente.
- Citar un ratio crudo del brief.
