---
name: reel-creator
description: |
  Escribe guiones de reels (IG / TikTok) listos para grabar con la estructura
  Hook → Retain → Reward y un catálogo de 8 formatos validados. Usar cuando pidan
  "un reel", "guion de reel", "script para IG", "idea de reel", "reel para captar
  leads", "reel con palabra clave", "pasá esto a formato reel", "tengo una
  referencia, hacé uno parecido", "adaptá este reel", o cuando peguen un link de
  Instagram/TikTok como inspiración. Para el gancho en sí, leer primero
  `viral-hooks`; para la corrección final, `humanizer`.
allowed-tools:
  - Read
  - Write
---

# Reel Creator

Guiones completos de reel, listos para leer a cámara. Estructura **Hook → Retain → Reward** y uno de los 8 formatos del catálogo.

**Qué aporta esta skill:** la estructura del guion y los formatos. **El banco de ganchos no vive acá:** para elegir el hook leé [`viral-hooks`](../viral-hooks/SKILL.md), que tiene las 7 categorías de fórmulas y el filtro de brand-safety por cliente. Esta skill define dónde va el hook y qué tiene que hacer, no lo reemplaza.

---

## REGLAS DURAS

1. **No inventes datos.** Cifras, casos, marcas, resultados o precios solo si el cliente los aporta o si salieron del Brain en esta conversación. Si el formato necesita un número y no lo tenés, pedilo antes de escribir. Un guion con una cifra inventada es un guion que no se puede publicar.
2. **No asumas nicho ni marca.** El tema y la audiencia los define el cliente. No metas sectores, productos ni personas que no estén en el brief o en el folder del cliente.
3. **Contexto del cliente antes de escribir.** Si el reel es para un cliente de Worker, leé `clients/{tipo}/{slug}/brand-voice.md` y su `icp.md`. Si la marca tiene claims prohibidos, no los hagas.
4. **Registro.** Marca argentina hablándole a audiencia argentina → rioplatense informal, voseo natural. Audiencia cross-LatAm o marca que vende afuera → español neutro. Ante duda, una pregunta corta antes de escribir.

---

## EL FRAMEWORK: HOOK → RETAIN → REWARD

### HOOK (primeros 3 segundos)

Que no haga scroll. Los tipos de gancho y sus fórmulas están en `viral-hooks`. Lo que esta skill exige del hook, cualquiera sea la fórmula:

- **Máximo 12 palabras.**
- Sin "hola", sin "qué tal", sin "en este video", sin "hoy les traigo".
- Dato, promesa o conflicto en la primera frase. Nada antes.

### RETAIN (el cuerpo)

Que se queden hasta el final:

- **Pattern interrupts cada 5 a 8 segundos:** "guardate esto", "ojo con la última", "te aviso algo", o un cambio visual en pantalla.
- **Loops abiertos:** "la tercera es la mejor", "esperá al final".
- **Ritmo telegráfico:** frases cortas, una idea por frase, punto y aparte agresivo.
- **Mostrar, no contar:** si se puede demostrar en pantalla, se demuestra.
- **Enemigo común** cuando encaje (un mito, una mala práctica). Da identidad y energía al cuerpo.
- Cifras concretas antes que vagas, pero solo las que aportó el cliente.

### REWARD (el cierre)

- **Una sola acción principal.** Comentar palabra clave, seguir, guardar, o link en bio. Nunca dos.
- Si es palabra clave por DM: decí la palabra exacta, qué recibe, y recordá el "seguime así te lo puedo mandar".
- Si es seguir o guardar: explicá qué se lleva.
- **El cierre paga la promesa del hook.** Si prometés enseñar algo y no lo enseñás, quemás la cuenta.

---

## FLUJO DE TRABAJO

### Paso 1 — Briefing (un solo mensaje, numerado)

Preguntá solo lo que falte. Lo que ya está en el folder del cliente o en el mensaje, no se pregunta.

1. **Tema / ángulo:** ¿de qué va?
2. **Audiencia:** perfil, dolor, nivel de conocimiento.
3. **Objetivo / CTA:** palabra clave (y qué entrega), seguir, link, guardar.
4. **Tono:** ¿hay alguna creencia, enemigo común o frase recurrente de la marca?
5. **Referencia (opcional):** algún reel que quieran seguir como inspiración.
6. **Duración:** 30s, 60s, 90s o "lo que pida el tema".

### Paso 2 — Proponé formato

Elegí 1 (o 2 para que elija) del catálogo. Justificá en una línea por qué ese. Esperá luz verde, salvo que digan "tirá directo".

### Paso 3 — Escribí el guion

```
TÍTULO/PORTADA: [si aplica]
DURACIÓN ESTIMADA: [Xs]
FORMATO: [nombre del formato]

HOOK:
[1-2 líneas máximo]

RETAIN:
[cuerpo, párrafos cortos, listo para leer a cámara]

REWARD:
[CTA exacto]

NOTAS DE GRABACIÓN: [3-5 bullets: qué mostrar en pantalla, cortes, b-roll, ritmo, texto en pantalla]
```

### Paso 4 — Humanizer y guardado

Pasada de [`humanizer`](../humanizer/SKILL.md) antes de entregar: el guion se lee en voz alta, cualquier tell de AI se escucha. Después guardalo en `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-reels-{tema}.md` y dejá la entrada en el worklog.

---

## CATÁLOGO DE FORMATOS

### F1 — Tier list por caso de uso

Bloques cortos. Cada bloque = un caso de uso + 3 opciones (Mala / Buena / Genial). Patrón rápido y repetitivo. El último caso pivotea al CTA. Ritmo telegráfico. 30-45s.

### F2 — Long-form persuasivo ("lo que yo haría desde cero")

1. Hook con secreto o promesa fuerte.
2. Aviso de que la mayoría no llega al final, invitá a guardar.
3. Credibilidad o transformación (con datos del cliente, no inventados).
4. Negación de la categoría obvia.
5. Revelación de la idea principal.
6. Por qué ahora.
7. Prueba social.
8. CTA.

60-90s.

### F3 — "Reprogramá tu herramienta"

1. Acusación contra una herramienta popular (qué hace mal por defecto).
2. Demostración del problema.
3. Cómo reconfigurarla, paso a paso.
4. Ejemplo concreto (el prompt, el ajuste).
5. Pivote opcional a una alternativa.
6. CTA.

45-60s.

### F4 — "Acaba de salir X" / novedad

1. Hook con la novedad y por qué cambia el juego.
2. Qué es, en una frase.
3. Caso de uso obvio.
4. Caso de uso menos obvio (el que conecta con la audiencia).
5. Visión de aplicarlo.
6. CTA.

45-75s.

### F5 — Lista numerada (3 estrategias / 3 errores)

1. Hook con promesa concreta.
2. Spoiler ("la última es la mejor").
3. Punto 1: error típico y qué hacer en su lugar.
4. Punto 2.
5. Punto 3, el que conecta con el CTA.
6. CTA.

60-90s.

### F6 — Caso real + paso a paso

1. Hook con resultado concreto (cifra + plazo, **aportados por el cliente**).
2. Promesa del paso a paso.
3. Los pasos (3, opcional 4).
4. Cierre con visión + CTA.

75-120s. Los recursos largos (prompts, plantillas) se entregan por DM o lead magnet, no se leen enteros a cámara.

### F7 — Tier list con letras (S/A/B/C)

Cada elemento: 1 frase de qué hace + 1 frase de pega o virtud + la letra. La "S" se la lleva la pieza clave del ángulo. Cierre con CTA. 45-60s.

### F8 — Mapa rápido "Para X → Y"

Pares caso → opción. Sin adjetivos. Velocidad alta. La última línea pivotea a la oferta. 25-40s.

---

## REGLAS DE VOZ Y ESTILO

- **Frases cortas.** Una idea por frase.
- **Cero relleno.** Se abre con sustancia.
- **Cero lenguaje corporativo:** "sinergia", "potenciar", "revolucionario", "solución integral", "llevar al siguiente nivel".
- **Cero AI-isms:** "en el dinámico ecosistema actual", "sin lugar a dudas", "cabe destacar", gerundio de cierre ("potenciando así...").
- **Sin emojis dentro del guion a cámara.** En el copy del post pueden entrar puntuales.
- **Una sola acción en el cierre.**

---

## ANTI-PATRONES

- Abrir con "hola / qué tal / hoy les traigo / en este video".
- Prometer en el hook algo que el cuerpo no entrega.
- Copiar frases textuales de la referencia que pasó el cliente. Se saca el ángulo y la estructura, no la letra.
- Leer prompts o plantillas largas enteros a cámara.
- Más de un CTA fuerte.
- Inventar datos, casos o cifras.

---

## ADAPTAR UNA REFERENCIA

Si pegan un reel o transcript ajeno como inspiración:

1. Identificá qué formato del catálogo encaja (F1-F8) o si es mezcla.
2. Sacá la **estructura y el ángulo**, no la letra.
3. Reescribilo desde cero con la voz, el tema y el CTA del cliente.

---

## SI FALTAN DATOS

Si falta tema, audiencia, CTA o tono, **preguntá antes de escribir**. Un guion genérico es peor que 30 segundos de briefing.
