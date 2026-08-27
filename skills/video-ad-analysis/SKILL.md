---
name: video-ad-analysis
description: Analizar un video (ad propio, ad de competencia en Meta Ad Library, reel, grabación de reunión) usando el comando /watch del plugin claude-video, y convertir lo que se ve/escucha en insumos para copies o diagnóstico de creative. Usar cuando pidan "mirá este video", "qué hook usa este anuncio", "analizá este reel de competencia", o antes de escribir copies inspirados en un video puntual.
---

# Video ad analysis

Este skill no analiza videos por sí mismo — documenta cómo usar el plugin `claude-video` (`/watch`) ya instalado, y qué hacer con lo que devuelve. `/watch` le da a Claude ojos y oídos sobre un video: extrae fotogramas, transcribe el audio (subtítulos nativos o Whisper) y contesta preguntas sobre momentos puntuales.

## Cuándo usarlo

- Analizar un ad de video de competencia (link de Meta Ad Library, YouTube, TikTok) antes de escribir copies propios.
- Auditar un ad de video propio que no está funcionando: ¿dónde se pierde la atención?, ¿el hook de los primeros 3 segundos corresponde al ángulo del copy?
- Revisar una grabación de reunión o un video largo sin mirarlo entero.
- Extraer el guion/estructura de un Reel o TikTok que funcionó, para el skill `reel-creator` o `viral-hooks`.

## Qué NO hace

- **No trae métricas de performance.** CTR, gasto, conversiones, frequency siguen viniendo del Worker Brain (`get_creative_performance`, `get_entity_rolling_metrics`) o de Ads Manager. `/watch` describe el contenido del video, no cómo le está yendo.
- **No reemplaza el formato de entrega de copies.** Lo que sale de acá es un insumo (ángulo, hook, estructura, objeciones que toca el video); el entregable final sigue el formato fijo de `ad-copy-deck/SKILL.md` y `.claude/rules/ad-copy-policy.md`.

## Uso básico

```
/watch https://youtu.be/VIDEO qué pasa en el segundo 30?
/watch ~/downloads/ad-competencia.mp4 resumime el video
/watch URL --start 0:00 --end 0:03    ← aislar el hook
```

Para un ad de la Meta Ad Library, copiar la URL del video directo (no la página del anuncio) si `/watch` no la resuelve sola.

## Flujo recomendado: video de competencia → copy propio

1. **Mirar el video con preguntas puntuales**, no "resumime todo". Preguntas que dan insumo accionable:
   - "¿Qué dice en los primeros 3 segundos? ¿Es un hook de dolor, curiosidad, o resultado?"
   - "¿En qué segundo aparece el precio o la oferta?"
   - "¿Qué objeción está respondiendo el guion, aunque no la diga explícita?"
   - "¿Qué tipo de prueba social usa (testimonio, número, antes/después)?"
2. **Cruzar con el research previo** de `paid-ads-meta/SKILL.md` (Parte 0: research de 5 fuentes) — el video es una fuente más, no la única.
3. **Pasar el ángulo identificado** a `schwartz-awareness-mapper` (¿a qué nivel de awareness le habla?) y de ahí al flujo Kim Barrett si corresponde (`headline-matrix`, `ad-angle-multiplier`).
4. **Escribir el copy** siguiendo `ad-copy-deck/SKILL.md` — nunca copiar frases textuales de la competencia, usar el ángulo/estructura como inspiración.

## Flujo recomendado: diagnóstico de ad propio que no funciona

1. Traer las métricas reales primero (Brain o Ads Manager) — sin eso, "no funciona" no está definido (¿mal CTR? ¿mal CPA? ¿buen CTR pero no convierte?).
2. `/watch` sobre el video propio con la pregunta específica que las métricas sugieren: si el CTR es bajo, "¿qué pasa en los primeros 3 segundos?"; si convierte poco después de buen CTR, "¿dónde aparece el CTA y qué tan claro es?".
3. El diagnóstico de creative (qué está mal) es para el operador — no entra en el entregable del cliente (ver `feedback_deliverable_format` en memoria: la entrega es qué hacer, no un reporte de errores).

## Requisitos (por máquina, una vez)

El plugin se instala con `python scripts/instalar-plugins.py` (ver `.claude/commands/instalar-plugins.md`). Primera vez que corre `/watch`, instala solo `ffmpeg` y `yt-dlp` si faltan. Whisper (Groq/OpenAI key) es opcional — solo hace falta si el video no tiene subtítulos nativos.
