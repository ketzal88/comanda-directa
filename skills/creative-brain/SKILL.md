---
name: creative-brain
version: 1.1.0
description: |
  Creative workspace methodology for Worker Brain. Use when working with the
  Creative Brain tool (/tools/creative-brain) — defines how to open sessions,
  ask questions, generate hooks/guiones/copy, apply humanizer rules, and
  manage the client playbook. Also use when creating or interpreting creative
  content for any client in the Worker Brain system.
---

# Creative Brain Methodology

## Qué es el Creative Brain

El Creative Brain (`/tools/creative-brain`) es el workspace creativo con AI de Worker Brain. Tiene 3 paneles:
1. **Chat Creativo** (panel izquierdo): Conversación para generar hooks, guiones, copy. Con historial y SSE streaming.
2. **Playbook del Cliente** (panel derecho): Base de conocimiento acumulada por cliente en Firestore (`creative_playbook/{clientId}__{entryId}`). Filtros por categoría y confianza.
3. **Humanizador** (panel inferior/modal): Input/output para eliminar AI tells del texto generado.

### Arquitectura técnica
- **API**: `POST /api/tools/creative-brain/chat` — SSE streaming, misma rate-limit (30 req/hr) que AI Analyst
- **Playbook CRUD**: `GET/PUT /api/tools/creative-brain/playbook` — whitelist de campos para PATCH
- **Context builder**: `src/lib/creative-brain/context-builder.ts` — carga config del cliente + últimas 14 snapshots + playbook activo
- **Prompts loader**: `src/lib/creative-brain/prompts-loader.ts` — 4 modos de fallback: Firestore → código → default

## Session Opening
Siempre empezar con: "¿En qué estás trabajando hoy?" antes de generar cualquier cosa.
Si falta contexto, preguntar UNA pregunta a la vez:
- ¿Para qué objetivo? (venta directa / leads / awareness)
- ¿Qué producto o servicio específico?
- ¿A qué buyer apunta? (usar buyer profiles del cliente si están en el playbook)
- ¿Ya tiene referencias o copy anterior?

## Hook Frameworks (5 tipos)

| Tipo | Trigger psicológico | Ejemplo |
|---|---|---|
| **Problema** | "Eso me pasa a mí" | "¿Seguís pagando demasiado por envíos?" |
| **Pregunta** | Curiosidad directa | "¿Cuánto perdés por mes en descuentos mal calculados?" |
| **Shock/Dato** | Sorpresa cognitiva | "El 73% de los carritos abandonados se recuperan en las primeras 2 horas" |
| **Curiosidad** | Loop abierto | "Esto fue lo que cambió nuestro ROAS de 1.2 a 4.8" |
| **Identidad** | Pertenencia/aspiración | "Para los que entienden que vender barato no es una estrategia" |

Cuando generás hooks: siempre 3 opciones, tipos distintos, máximo 2 líneas cada uno.

## Guion Structure (Reels 30s)

```
Hook (0–3s): Sin contexto previo. Debe funcionar con el audio muteado.
Tensión (3–10s): El dolor o problema del buyer. Específico, no genérico.
Solución (10–20s): Producto + beneficio + prueba (resultado concreto o social proof).
CTA (20–30s): Una sola acción. Directa. Sin "si te gustó dale like".
```

Para UGC: primera persona, conversacional, nada de "este increíble producto".

## Copy Ads (AIDA / PAS / B-A-B)

**AIDA:** Atención → Interés → Deseo → Acción
**PAS:** Problema → Agitación (consecuencias) → Solución
**B-A-B:** Before (situación actual dolorosa) → After (vida transformada) → Bridge (el producto)

Usar especificidad: números > adjetivos. "Reduce el CPA 40%" > "mejora tus resultados".

## Humanizer Integration
Cuando el usuario pide humanizar texto, aplicar en orden:
1. Eliminar AI tells en español (frases como "en conclusión", "es importante destacar", "en el dinámico mundo de", "robusto", "en última instancia", "en el ámbito de")
2. Cortar oraciones largas — máximo 15 palabras por oración en copy publicitario
3. Agregar especificidad donde hay promesas vagas
4. Verificar que suene como una persona hablando, no como un informe
5. Audit final: "¿qué hace que esto todavía suene a AI?" → revisar una vez más

## Playbook Usage
Al inicio de cada sesión, el playbook se carga automáticamente desde Firestore.
Si hay learnings relevantes para el pedido actual, mencionarlos proactivamente:
> "Según el playbook de este cliente, los hooks de pregunta directa generan 3x más CTR que los de beneficio."

Al final de sesiones largas (12+ mensajes), el sistema extrae learnings automáticamente via el hook `useCreativeBrainChat` que detecta cuando `messages.length >= 12` y dispara auto-extraction al backend.

### Estructura de un entry del playbook
```typescript
{
  clientId: string,
  category: 'hooks' | 'copy' | 'angles' | 'formats' | 'audience' | 'general',
  learning: string,           // El insight concreto
  confidence: 'high' | 'medium' | 'low',
  source: 'manual' | 'auto-extracted',
  references: number,         // Cuántas veces fue referenciado en sesiones
  active: boolean,
}
```

## Categorías del Playbook
- **hooks**: Qué tipos de hooks funcionan mejor en este cliente
- **copy**: Frases, ángulos y formatos de copy que convierten
- **angles**: Ángulos creativos (problema, beneficio, social proof, UGC)
- **formats**: Formatos que rinden (UGC, testimonial, demostración, producto solo)
- **audience**: Insights sobre el buyer persona de este cliente
- **general**: Learnings generales sobre la marca y su comunicación