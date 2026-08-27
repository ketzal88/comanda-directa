---
name: viral-hooks
description: |
  Biblioteca de fórmulas de hooks para contenido social orgánico (Reels, TikTok,
  carruseles, founder stories). 7 categorías con templates rellenables + guía para
  elegir según objetivo y brand-safety por cliente. Usar cuando pidan "hooks",
  "ganchos", "primeros 3 segundos", "ideas de Reels", "guion para video",
  "founder story", "hooks virales", o haya que abrir un contenido orgánico.
  Para hooks de PAID (Meta/TikTok ads) ver `performance-creative-strategy`.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - WebFetch
---

# Viral Hooks

## Cuándo usar este skill

Cuando hay que **abrir** una pieza de contenido orgánico y el primer segundo define si se ve o se scrollea: Reels, TikToks, carruseles, founder stories, videos de marca, apertura de newsletter.

Trigger words: *hooks, ganchos, primeros 3 segundos, ideas de Reels, guion para video, founder story, hooks virales, cómo arranco este video*.

**Cuándo NO usarlo (rutear a otro lado):**

| Si el pedido es… | Ir a |
|---|---|
| Hooks para **ads pagos** + matriz de testeo + fatiga creativa | [`performance-creative-strategy`](../performance-creative-strategy/SKILL.md) |
| **Headlines / subject lines** escritos (no video) | [`headline-matrix`](../headline-matrix/SKILL.md) |
| Copy completo del ad (los 3 campos Meta / RSA) | [`ad-copy-deck`](../ad-copy-deck/SKILL.md) + `.claude/rules/ad-copy-policy.md` |
| Sesión creativa completa con contexto de cliente | [`creative-brain`](../creative-brain/SKILL.md) |

---

## Fuente de verdad

Biblioteca viva **"1000 Viral Hooks"** en el Brain:
👉 https://brain.worker.ar/public/pagina/n8V0P2-u6Fu9WA97PZE6k6IqkZqGrRZQ

Ese doc tiene 150+ fórmulas con links de referencia a IG/TikTok de cada hook en vivo. **Este skill es el destilado accionable** — si necesitás más variantes o el ejemplo en video, abrí el link.

---

## Las 7 categorías

### 🎓 1. Educational — enseñar / prometer resultado
- "This is your **X** before, during and after **X**"
- "Here's exactly how much/many **(acción)** you need for **(resultado)**"
- "I spent 10 years learning this, but I'll teach it in under 1 minute"
- "If I woke up tomorrow with **(pain point)**, here's what I'd do"
- "Stop doing **(acción)** if you really want **(resultado)**" ← *contrarian*
- "If I were consulting your **(empresa)**, the first thing I'd change is…"

**Sirve para:** posicionar expertise, lead magnets, B2B, servicios.

### ⚖️ 2. Comparison — contraste visual
- "This is a **(cosa)** and this is a **(cosa)**"
- "Cheap vs expensive **(producto)**"
- "Your **(cosa)** looks like this without **(acción)**. Like this with **(acción)**"
- "These two **(items)** have the same amount of **(métrica)**"

**Sirve para:** ecommerce, producto físico, antes/después, demostrar valor.

### 💣 3. Myth-busting — contrarian / romper creencia
- "Here's why doing **(acción)** causes **(pain point)**"
- "That trend everyone quotes? It's false"
- "Just because you **(acción)** doesn't make you a good **(label)**"
- "You're not lazy — nobody taught you **(acción)**"
- "Get **(resultado)** without giving up **(guilty pleasure)**"

**Sirve para:** diferenciarse sin nombrar competidores, categorías saturadas.

### 📖 4. Storytelling — conexión humana
**Anclas temporales:** "X years ago my **(persona)** told me **(quote)**" · "Started my **(negocio)** at age **(edad)** with **(monto)**" · "I left **(cosa)** X years ago"
**Declaración de identidad:** "I'm **(nombre)**, **(edad)**, starting **(negocio)** from zero" · "I have no plan B, so this needs to work"
**Arco de transformación:** "Took X years to go from **(mal)** to **(bien)**" · "I messed up"
**Origen:** "It all started when **(persona)** **(acción)**"
**Verdad incómoda:** "This was probably the scariest thing I've done" · "Just quit my 9-5 to start my **(negocio)**"

**Sirve para:** ⭐ **founder stories**, marca personal, humanizar B2B, desactivar la objeción "son nuevos / no los conozco".

### 👑 5. Authority — prueba por resultados
- "**(Antes)** used to look like this, now looks like this"
- "With just **(#)** **(acción)**, my client went from **(antes)** to **(después)**"
- "If I had to build **(cosa)** today, here's exactly how I'd do it"
- "As a **(título)** for several years, people always ask me **(pregunta)**"
- "My business did **(monto)** in revenue in **(año)**"

**Sirve para:** agencia, servicios, casos de cliente, consultoría.
⚠️ Solo si el dato es **real y verificable** — ver "Brand safety" abajo.

### 🎬 6. Day in the Life — diario visual
- "We all have 24 hours; here's how I use mine"
- "Day **#** of **(acción)** until **(resultado)**"
- "Come work with me as **(título)**"
- "Day in the life of a **(título)**: **(variante)** edition"

**Sirve para:** behind the scenes, cultura, retención de audiencia recurrente. **Prioridad baja** salvo que la marca tenga cara visible.

### 🎲 7. Random / Pattern breakers
- "This is **(número grande)** of **(item)**"
- "What **(título)** says vs what they mean"
- "I don't believe in **(creencia común)**, I believe in **(tu creencia)**"
- "**(Marca grande)** didn't want to sponsor this video; here's what they're missing"

**Sirve para:** romper la monotonía del feed. Usar **1 cada 5-6 posts**, no más.

---

## Cómo elegir (decision guide)

| Objetivo | Categoría primaria | Backup |
|---|---|---|
| Que me conozcan / humanizar la marca | Storytelling | Day in the Life |
| Probar que sé del tema | Educational | Authority |
| Diferenciarme en categoría saturada | Myth-busting | Educational contrarian |
| Vender producto físico | Comparison | Educational |
| Vender servicio / agencia | Authority | Educational |
| Founder story | Storytelling (identidad u origen) | Myth-busting |
| Romper la racha de contenido igual | Random | Comparison |

**Regla:** en una tanda de contenido, **variá la categoría**. Cinco Reels con el mismo arquetipo de hook cansan aunque el tema cambie.

---

## Cómo aplicar

1. **Leé el contexto del cliente** — `clients/{tipo}/{slug}/brand-voice.md` e `icp.md`. El hook tiene que sonar a la marca, no a TikTok genérico.
2. **Elegí 2-3 categorías distintas** según la tabla de arriba. Nunca una sola.
3. **Rellená la fórmula** con lenguaje real del cliente (el "customer voice" del brand-voice.md), no con el placeholder traducido literal.
4. **Pasá el brand-safety check** (abajo).
5. **Humanizer pass obligatorio** — ver [`.claude/rules/humanizer-policy.md`](../../.claude/rules/humanizer-policy.md). Un hook que suena a AI muere en el segundo 1.
6. **Entregá el hook con su beat siguiente.** Un hook suelto no sirve: mostrá cómo continúa los 5 segundos que le siguen, o el cliente no sabe qué grabar.

---

## Brand safety — chequear SIEMPRE antes de entregar

- **Claims de Authority:** solo si el número es real y el cliente lo puede sostener. Nada de "2k+ clientes" si no está confirmado. Ver `brand-voice.md` del cliente.
- **Competidores:** varios clientes tienen prohibido nombrarlos. *Ej: Lati Travel no puede comparar contra Despegar/TripAdvisor.* Los hooks contrarian se pueden hacer igual — atacá **el método**, no la marca ("Stop planning your trip from a browser tab" en vez de "TripAdvisor te miente").
- **Categorías reguladas** (salud, finanzas, inmuebles): los hooks de resultado ("went from X to Y") pueden ser claim prohibido. Chequear.
- **Registro:** hooks para audiencia argentina → rioplatense. Cross-LatAm o mercados extranjeros → neutro o inglés según el cliente.

---

## Ejemplo aplicado (Lati Travel, 2026-07-23)

Founder story, 4 versiones, una categoría distinta cada una:

| Versión | Categoría | Hook |
|---|---|---|
| 1 | Storytelling — identidad | "I grew up here. And for years, I watched people fly halfway around the world…" |
| 2 | Myth-busting | "Stop planning the trip of a lifetime from a browser tab at midnight…" |
| 3 | Authority — reverse engineering | "If I were planning your first trip to Patagonia, here's exactly what I'd do…" |
| 4 | Storytelling — origen | "It started with one thought that wouldn't leave me alone…" |

Entregable: https://brain.worker.ar/p/lati-travel-founder-story

---

## Referencias

- **Biblioteca completa (fuente viva):** https://brain.worker.ar/public/pagina/n8V0P2-u6Fu9WA97PZE6k6IqkZqGrRZQ
- [`performance-creative-strategy`](../performance-creative-strategy/SKILL.md) — hooks para paid, matrices de testeo, fatiga creativa
- [`creative-brain`](../creative-brain/SKILL.md) — sesión creativa con contexto de cliente
- [`humanizer`](../humanizer/SKILL.md) — pass obligatorio antes de entregar
- [`.claude/rules/humanizer-policy.md`](../../.claude/rules/humanizer-policy.md) — registro por canal
