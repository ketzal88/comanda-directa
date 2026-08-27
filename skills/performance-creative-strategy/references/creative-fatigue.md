# Creative Fatigue — Reference

## Árbol de Diagnóstico de Performance Caída

Antes de producir creativos nuevos, identificar la causa real. Cada causa tiene una solución diferente.

```
Performance cayendo
        │
        ├─ ¿Frecuencia > 3 en los últimos 7d?
        │         │
        │         ├─ SÍ → ¿Thumbstop también está cayendo?
        │         │           │
        │         │           ├─ SÍ  → HOOK FATIGUE
        │         │           │         Solución: rotar hooks, mantener oferta/CTA
        │         │           │
        │         │           └─ NO (CTR estable, solo CPM sube)
        │         │                 → AUDIENCE SATURATION
        │         │                   Solución: ampliar targeting, excluir convertidos, nuevo lookalike
        │         │
        │         └─ NO → ¿CPM subió >30% sin cambios en cuenta?
        │                     │
        │                     ├─ SÍ  → AUCTION VOLATILITY (competencia estacional)
        │                     │         Solución: esperar 3-5 días, no tocar nada
        │                     │
        │                     └─ NO → ¿CTR está bien (>1%) pero CR cayó?
        │                                 │
        │                                 ├─ SÍ  → OFFER/LP MISMATCH
        │                                 │         Solución: testear variantes de oferta, auditar landing
        │                                 │
        │                                 └─ NO (Thumbstop <20%, CTR <0.5%)
        │                                       → CREATIVE DOESN'T COMPETE
        │                                         Solución: nuevo concepto desde cero
```

---

## Tabla de Diagnóstico Rápido

| Señales combinadas | Causa | Acción inmediata | Acción creativa |
|---|---|---|---|
| Frecuencia >3 + Thumbstop cae + CTR estable | Hook fatigue | Duplicar adset con hook nuevo | Mismo concepto, nuevos hooks (3-5 variantes) |
| Frecuencia >3 + CTR cae + CPM sube | Audience saturation | Ampliar audiencia, excluir convertidos | Nuevo lookalike + hook fresco |
| CPM sube + CTR estable + CVR baja | Auction volatility | No cambiar nada 3-5 días | Preparar creativos para cuando baje CPM |
| CTR >1.5% + CVR <1% | Offer o LP mismatch | A/B test landing page | Probar oferta diferente en el ad |
| Thumbstop <20% + CTR <0.5% | Creative no compite | Pausar gradualmente | Nuevo concepto con pattern interrupt fuerte |

---

## Ciclo de Vida Típico de un Creative

```
Días 1-7     │ Learning phase — métricas variables, NO pausar
             │ El algoritmo está aprendiendo. CPA errático es normal.
             │
Días 7-14    │ PERFORMANCE PEAK
             │ Hook rate y CTR en máximos. Momento de escalar (+20-30% budget).
             │ Si no performa aquí, el concepto no va a escalar.
             │
Días 14-30   │ Decay gradual
             │ Thumbstop empieza a caer (~5-10% por semana).
             │ Frecuencia sube. CPA comienza a crecer levemente.
             │ Monitorear, no actuar todavía.
             │
Días 30+     │ FATIGUE ZONE
             │ CPA sube >20% vs peak. Thumbstop <80% del peak.
             │ Frecuencia >3.0 en 7d. → Rotar concepto.
```

**Regla de los 14 días:** nunca pausar un creative con menos de 14 días activos salvo que el CPA sea >3x target. El learning phase necesita tiempo.

---

## Cuándo Hacer Qué

### Rotar el hook (no el concepto)
- El concepto probó escalar (días 7-14 con buen CPA)
- Thumbstop cayendo pero CTR todavía aceptable
- Frecuencia entre 2.5-3.5
- Acción: duplicar adset con 3-5 variantes de hook, mismo concept/offer

### Rotar el concepto
- El concepto nunca llegó al peak de performance
- O días 30+ con todas las métricas en decay
- O creative DNA muestra mismo `patternInterrupt` + mismo `reissDesire` en todos los activos
- Acción: nuevo `patternInterrupt` + nuevo `reissDesire` + nuevo awareness level

### No hacer nada
- CPM subió pero CTR no cambió → auction volatility
- Creative tiene <14 días → learning phase
- Cambios de presupuesto recientes → learning reset, esperar 7 días

---

## Scaling Protocol

**Escalar un creative ganador (días 7-14, CPA en target):**
1. Aumentar budget +20-30% del adset ganador
2. Esperar 3-5 días entre cada aumento (no disrumpir el learning)
3. NUNCA >30% de un solo golpe
4. Si CPA sube >20% post-aumento → volver al budget anterior, esperar 5 días

**Señales de STOP al scaling:**
- CPA sube >20% vs baseline en 3 días post-aumento
- Frecuencia sube >0.5 en 3 días
- ROAS cae >15% en 3 días
- Thumbstop cae >25% en 1 semana

**Horizontal scaling (cuando vertical llega al techo):**
- Duplicar el adset ganador con la misma audiencia
- Andromeda puede encontrar subsegmentos distintos dentro de la misma audiencia
- Ejecutar en paralelo, no reemplazar el original

---

## Pattern Interrupts para Resetear Audiencia Saturada

Cuando la audiencia ya vio demasiado del mismo creative, un cambio de pattern interrupt puede resetear la atención:

| Pattern interrupt anterior | Cambio recomendado | Por qué funciona |
|---|---|---|
| social-proof | visual-shock | Rompe la expectativa de "otro testimonio" |
| curiosity-gap | contrarian | Más disruptivo para audiencia más caliente |
| authority | social-proof | Después de autoridad, prueba masiva cierra la venta |
| visual-shock | curiosity-gap | Audiencia ya no se shockea → necesita un loop mental |
| contrarian | authority | Después de contradecir, respaldar con dato |

---

## DNA Fields Relevantes para Fatigue Analysis

Los campos del `creative_dna` de Worker Brain que más predicen fatiga:

| Campo | Qué indica |
|---|---|
| `vision.scrollStoppingScore` | Creative con score 1-2 va a fatigar más rápido (no tiene poder de scroll-stop propio) |
| `vision.patternInterrupt` | Si todos los activos tienen el mismo tipo → saturación de pattern |
| `vision.hookType` | Si `offer` domina el portfolio → saturación de ángulo directo |
| `copy.awarenessLevel` | Si todos apuntan al mismo nivel → se pierde coverage de funnel |
| `copy.funnelStage` | Imbalance cold/warm/retargeting → problemas de atribución o saturación por etapa |
