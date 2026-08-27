---
name: worker-proposals
description: >-
  Arma propuestas y presentaciones HTML para clientes de Worker aplicando el
  design system v2 (fondo blanco, accent #F5C518, Anton/Inter/JetBrains Mono) y
  las publica en brain.worker.ar via el MCP Worker Brain. Usar SIEMPRE que
  Gabriel pida una propuesta, presentacion, deck o analisis en HTML para un
  cliente (Elepants, Nakiki, Paia, Kaizen, Blunua, etc.), pida "armar una
  propuesta", "hacer una presentacion interactiva", "armar el analisis para
  mostrarle al cliente", o pida "subir/publicar/compartir esto al brain" o
  "publicalo como propuesta". Tambien cuando se trate de presentar datos de
  performance (Meta/Google Ads, proyecciones, benchmarks) en formato visual
  para enviar a un cliente.
---

# Worker Proposals

Genera propuestas HTML de scroll vertical, single-file, con la identidad de
Worker, y las publica en `brain.worker.ar/p/{slug}` via MCP. Reemplaza armar
todo a mano cada vez: el branding, la estructura y el flujo de publicacion ya
estan resueltos aca.

## Que produce

Un **unico archivo HTML auto-contenido** (CSS inline, sin assets relativos) que:
- Aplica el design system v2 de Worker.
- Se lee de arriba a abajo y **entra en pocas pantallas**: lo que hay que hacer arriba, sin vueltas.
- Es interactivo (nav sticky, fade-in on scroll, tabs, hover en cards y tablas).
- Queda listo para publicar via `upload_proposal` y compartir el link.

No es un PPTX ni slides. Es HTML web-first, igual que la propuesta de Elepants.

**Y no es un informe.** La regla de extension esta abajo (seccion "Corta") y no es negociable: es el error mas repetido de este skill.

## Flujo

1. **Entender el encargo.** Quien es el cliente, que se le propone, que datos
   hay (numeros de performance, presupuesto, calendario, proyecciones), y si la
   audiencia es el cliente o uso interno.

2. **Validar los datos ANTES de diseñar.** Esto no es opcional. Recalcular las
   metricas derivadas (ROAS = facturacion / inversion, CPA = inversion / trx,
   tasa de conversion = trx / visitantes, ticket = facturacion / trx) y marcar
   toda inconsistencia o supuesto agresivo antes de tirar el HTML. Una propuesta
   linda con numeros que no cierran es peor que no entregar nada. Si un supuesto
   (ej: tasa de conversion proyectada) es optimista respecto al benchmark,
   decirlo.

3. **Armar el HTML** partiendo de `assets/template.html`. Pegar el contenido de
   `assets/worker-design-system.css` inline en el `<head>` (es obligatorio que
   sea inline). Adaptar secciones al encargo. Mantener los principios de marca
   de abajo.

4. **Revisar localmente.** Guardar en `/home/claude`, abrir, chequear que las
   secciones, tablas y tabs funcionen, y que no haya rutas relativas.

5. **Entregar.** Copiar a `/mnt/user-data/outputs/` y usar `present_files` para
   que Gabriel lo vea y descargue.

6. **Publicar solo con OK explicito.** Ver `references/publishing.md`. Antes de
   `upload_proposal`: correr `list_proposals` para chequear el slug, mostrar
   slug + title + privacidad, esperar confirmacion. Despues, devolver el
   `publicUrl`.

## Corta. Es la regla que mas se rompe.

Gabriel lo pidio dos veces (2026-06-16 en MD, 2026-08-04 en una propuesta del Brain). Textual la segunda: *"la gente no lee tanto, es demasiado para leer y procesar, al cliente no le importa, era una bajada de guiones no la biblia, deja una mini explicacion y lo que tiene que grabar"*.

**La propuesta lleva solo lo que se ejecuta.** Que se graba, que se disena, que se pega en la plataforma, que se aprueba, cuanto sale. Mas una explicacion de 2 o 3 lineas arriba y nada mas.

**Lo que NO va, aunque lo tengas escrito y este bien:**

| Fuera de la propuesta | Donde va |
|---|---|
| Diagnostico, tablas de spend, deltas, lectura de metricas | worklog del cliente y MD del entregable |
| El porque del lote, la justificacion de cada decision | idem |
| Correcciones de medicion o de lecturas del Brain | idem, y si aplica a todos los clientes tambien al CLAUDE.md raiz |
| Metadata de framework: fase del funnel, nivel de conciencia, ratio E:F:S:U, Diversity Score, pattern interrupt | idem. Es criterio de escritura, no informacion para el que ejecuta |
| Pendientes internos y quien los debe | Slack o el worklog |

**Regla practica para decidir:** si la seccion explica **por que** hicimos algo, va al repo. Si dice **que hay que hacer**, va a la propuesta. Cuando dudes entre mas corta o mas completa: mas corta. Si le falta algo, lo pide.

**Referencia de tamanio:** una bajada creativa de 5 guiones + 8 ganchos + 5 estaticas + 15 campos de copy entra en ~36 KB de HTML. Si te vas a 60 KB o mas, estas explicando en vez de entregar.

---

## La propuesta es trabajo terminado, no un reporte de errores

**No se marcan errores donde los ve el cliente.** Ni los nuestros, ni los de una version anterior del documento, ni los de una herramienta, ni los pendientes que le debe el cliente. Una propuesta llena de avisos de "esto esta mal", "esto hay que corregirlo a mano", "esto quedo trabado desde junio" se lee como trabajo a medio hacer, y encima nos deja mal paradas a nosotras.

Eso **se lo pasas al operador** para que lo corrija: worklog, MD del entregable, o Slack. La propuesta que ve el cliente sale ya con la correccion aplicada.

Ejemplos concretos de lo que NO va en la propuesta:
- "La alerta X del Brain esta mal, cuenta el evento equivocado."
- "Los ratios de la ventana de 7 dias vienen sumados, el valor real es otro."
- "Hay 9 piezas escritas y nunca producidas porque falta el hex."
- "La primera version de este documento reportaba mal el CPA."
- Notas tipo "ojo aca, si cambias esta frase el claim queda falso": son instrucciones para quien produce, no para quien aprueba.

**Excepcion, y es una sola:** si el error cambia lo que el cliente tiene que decidir o aprobar ahora, se dice en una linea, sin autopsia. Ejemplo valido: "el plazo de la garantia figura como 10 dias en la landing y 15 en el video, hay que unificar". Ejemplo invalido: tres parrafos sobre como se detecto.

---

## Principios de marca (no negociables)

Los tokens completos estan en `assets/worker-design-system.css`. Lo esencial:

- **Fondo blanco primario.** El oscuro es modo invertido, no el default. Usarlo
  solo en el hero y opcionalmente el cierre/footer. Un solo bloque oscuro grande
  arriba, no alternar oscuro y claro por todos lados.
- **Max-width de contenido: 1440px** (token `--max-w`). Aplica a `.section`,
  hero, nav y footer. El background de hero/nav/footer sigue full-width (con
  padding-inline dinamico `max(s-7, (100vw - max-w)/2 + s-7)`), pero el
  contenido respeta el max-width. No hardcodear otros maximos en componentes.
- **Accent amarillo #F5C518 con techo de ~18% del area.** Es acento, no fondo
  general. Siempre texto negro sobre amarillo, nunca blanco. El punto del logo
  (`Worker.`) va amarillo.
- **Tipografia:** Anton (display, en MAYUSCULAS) como titulos, Inter para
  cuerpo, JetBrains Mono para labels, captions y numeros tabulares. Cargar las
  tres por Google Fonts (CDN absoluto).
- **Logo y firma:** `Worker.` con el punto en amarillo. Tagline
  "De comerciante a empresario · worker.ar" en el footer.
- **Numeros en mono y tabular** (`font-variant-numeric: tabular-nums`) para que
  las columnas de plata alineen.
- **Nada de em dashes ni dobles guiones** en el copy. Usar puntos, comas,
  parentesis o reescribir. Aplica a todo el texto visible.

## Estructura: depende de para que es

Hay dos casos y no se estructuran igual. Definilo antes de escribir una linea.

### A. Comercial (pitch, cotizacion, plan de campania para aprobar)

Aca el contexto **es** el argumento de venta: el cliente decide con eso. Va corto igual.

1. **Hero invertido** con el titular y 2 a 4 stats clave (la promesa en numeros).
2. **Donde estamos**, en pocas lineas o una tabla chica. No un capitulo.
3. **Que proponemos:** inversion, split de canales, calendario.
4. **Proyeccion:** tabs intercambiables entre escenarios, si hay escenarios de verdad.
5. **Cierre / CTA + footer.**

### B. Interna operativa (bajada creativa, guiones, pack de piezas, copies)

Aca el cliente ya compro y lo que necesita es **ejecutar**. El diagnostico no va.

1. **Hero** con el titular y 2 o 3 lineas de que es y como se produce.
2. **Lo que hay que hacer**, agrupado por quien lo hace: lo que se graba, lo que se
   disenia, lo que se carga en la plataforma.
3. **Footer.** Nada mas.

Los guardrails de claims, las notas de camara y los avisos de "no cambiar esta frase"
son instrucciones para quien produce: van en el MD del entregable, no en la pagina que
aprueba el cliente. Ver la seccion de arriba.

Ajustar al caso, pero la division A/B se respeta: meterle diagnostico a una entrega
del tipo B es exactamente el error que este skill viene a evitar.

## Checklist antes de publicar

- [ ] **Es tipo A o tipo B?** Si es B, no hay seccion de diagnostico. Ninguna.
- [ ] **Sacar todo lo que explica por que.** Que quede lo que hay que hacer.
- [ ] **Cero errores marcados**: nada de "esta alerta esta mal", "esto hay que corregirlo",
      "esto quedo trabado". Eso va al operador por worklog o Slack.
- [ ] **Cero metadata de framework** a la vista (fase, conciencia, ratio E:F:S:U, Diversity).
- [ ] Acentos y enies **escritos de entrada** en toda la prosa. Es ortografia, no registro:
      lo que el design system prohibe son los em dashes, no las tildes.
- [ ] Sin em dashes ni dobles guiones. Sin rutas relativas. Todo el CSS inline.
- [ ] `list_proposals` corrido para no pisar un slug ajeno.
- [ ] Si paso de ~40 KB, releer: probablemente sobra explicacion.

## Recursos

- `assets/worker-design-system.css` — tokens v2. Fuente de verdad. Embeber inline.
- `assets/template.html` — esqueleto auto-contenido (nav, hero, cards, tabla, tabs, footer, JS).
- `references/publishing.md` — API del MCP, reglas de slug y confirmacion.

## Gotchas

- El MCP rechaza assets externos relativos. Si algo no renderiza al publicar,
  casi siempre es una ruta relativa o un `<link>` a un CSS local. Todo inline.
- `upload_proposal` hace upsert por slug: cuidado de no pisar una propuesta
  vieja reusando su slug sin querer. Verificar con `list_proposals` primero.
- Si Gabriel pasa una tabla de datos cruda (estilo Excel pegado), parsearla con
  cuidado: suele venir con columnas desfasadas, fechas sueltas y metricas que no
  cierran. Validar antes de confiar.
- **Cada set de tabs va envuelto en `.tabgroup`** (los `.tabs` y sus `.tab-content`
  adentro del mismo wrapper). Con dos o mas sets sin envolver, clickear una tab apaga
  las de los otros grupos y esas secciones quedan **en blanco**, sin tirar ningun error.
  El handler ya contempla los dos mundos: cada `.tabgroup` es independiente, y las tabs
  sueltas forman un grupo implicito entre ellas (no barren con los grupos envueltos).
  Igual **envolvelas siempre**: la red de seguridad existe para paginas viejas, no para
  ahorrarse el wrapper.
- **Nada de `vw` para el full-bleed.** El patron correcto (el que ya trae
  `assets/template.html` en `.nav`, `.hero` y `footer`) mide el CONTENEDOR, no la pantalla:

  ```css
  padding-inline: max(var(--s-7), calc((100% - var(--max-w)) / 2 + var(--s-7)));
  ```

  Con `50vw` la cuenta solo cierra si el elemento mide exactamente lo que mide el viewport.
  Como `vw` es siempre relativo al viewport y ningun ancestro puede reescalarlo, en cuanto
  algo capea un ancestro el padding sigue creciendo con la pantalla y con
  `box-sizing:border-box` se come la caja de contenido: a 2560px de ancho el hero queda con
  224px utiles y el titulo cae de a una palabra por renglon. En un notebook de 1440px no se
  ve nada raro, por eso pasa el QA. Con `%` el resultado es identico a ancho completo y
  correcto tambien si el body esta cappeado.
