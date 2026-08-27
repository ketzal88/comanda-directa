---
name: worker-brain-training
description: "Capacitación completa de Worker Brain para el equipo. Cubre qué es, cómo usarlo, tour de cada página, AI Analyst, alertas, digestos de Slack, Creative Brain, Creative Intelligence, Customer Intelligence, Competitor Intelligence, Email Health/Deliverability, Spam Checker, Instagram Interpreter, GSC/SEO/GEO Intelligence, Reportes Públicos, y el ahorro de tiempo concreto por rol. Use when creating training materials, onboarding team members to the Brain, or explaining Brain capabilities to clients or stakeholders."
---

# Worker Brain — Capacitación del Equipo

## Qué es Worker Brain y por qué cambia todo

Worker Brain es la plataforma de inteligencia de marketing de Worker Digital. Conecta **todos los canales** de cada cliente (Meta Ads, Google Ads, GA4, Ecommerce, Email, Search Console/SEO/GEO, Leads, Competidores) en un solo lugar y les pone arriba una capa de **inteligencia artificial que analiza, alerta y recomienda automáticamente**.

### El problema que resuelve

Antes del Brain, un análisis típico de un cliente requería:
1. Abrir Meta Ads Manager → exportar datos → copiar a un Sheet
2. Abrir Google Ads → exportar datos → copiar al mismo Sheet
3. Abrir Shopify/Tienda Nube → buscar ventas reales → comparar con lo que reportan los ads
4. Abrir Klaviyo/Perfit → revisar open rates, flows, revenue
5. Abrir GA4 → verificar sesiones, conversión, fuentes de tráfico
6. Cruzar todo manualmente en una planilla
7. Escribir el análisis
8. Detectar problemas... que probablemente ya llevan días activos

**Tiempo total: 2-4 horas por cliente, por semana.**

Con Worker Brain:
1. Abrir brain.worker.ar → seleccionar cliente → todo está ahí
2. Si hay problemas, ya te llegó la alerta en Slack a las 10:15
3. Si necesitás análisis profundo, le preguntás al AI Analyst en lenguaje natural
4. Si necesitás el reporte, el Monthly Report ya se generó solo

**Tiempo total: 5-15 minutos por cliente, por semana.**

### La regla de oro

**Brain PRIMERO, siempre.** Si tu tarea involucra datos de un cliente, abrí Worker Brain antes que cualquier otra cosa. Si la respuesta ya está ahí (y en el 90% de los casos lo está), no necesitás exportar nada, no necesitás armar prompts en Claude, no necesitás abrir planillas.

---

## Tour de Worker Brain: Página por página

### 1. Command Center (`/dashboard`)
**Qué es:** La vista general de todos los clientes de un vistazo.
**Para quién:** Managers, Team Leaders.
**Qué muestra:** Semáforo de salud por cliente, KPIs principales, alertas activas.
**Cuándo usarlo:** Todos los días al llegar. Es tu punto de entrada.

### 2. Ads Manager (`/ads-manager`)
**Qué es:** Gestión de creativos y campañas de Meta Ads por cliente.
**Para quién:** Paid Media Specialist, TL Paid Media.
**Qué muestra:** Campañas activas, ad sets, anuncios con métricas en tiempo real (ROAS, CPA, CTR, frecuencia, Hook Rate, Hold Rate).
**Cuándo usarlo:** Para la revisión diaria/semanal de campañas.

### 3. Decision Board (`/decision-board`)
**Qué es:** El tablero de decisiones automáticas sobre cada creativo.
**Para quién:** Paid Media, TL Paid Media, TL Diseño.
**Qué muestra:** Cada creativo clasificado en 6 categorías con la recomendación de qué hacer (escalar, pausar, rotar, aumentar budget).
**Cuándo usarlo:** Antes de tomar decisiones de optimización. El Brain ya hizo el análisis — vos decidís si seguís la recomendación.

### 4. Creative Intel (`/creative`)
**Qué es:** La biblioteca creativa inteligente con performance + DNA de cada pieza.
**Para quién:** Paid Media, Diseñador, TL Diseño, Community Manager.
**Qué muestra:**
- Métricas reales de cada creativo (Hook Rate, Hold Rate, CTR, ROAS, spend)
- **Creative DNA**: análisis AI de atributos visuales y de copy (estilo visual, tipo de hook, color dominante, si tiene texto/cara/producto, tono emocional, tipo de mensaje, tipo de CTA)
- **Clasificación automática** en 6 categorías
- **Diversity Score** del cliente (variedad de formatos y ángulos)
**Cuándo usarlo:** Antes de producir nuevas piezas (para saber qué patrones funcionan) y después de lanzarlas (para ver cómo performan).

### 5. Ecommerce (`/ecommerce`)
**Qué es:** Dashboard de ventas y métricas de la tienda online.
**Para quién:** Manager, Email Specialist.
**Qué muestra:** Revenue, órdenes, AOV, top productos, códigos de descuento, atribución por fuente (UTM), y según la plataforma:
- **Shopify**: Customer LTV por cohort (first-time, returning, VIP)
- **Tienda Nube**: Performance por canal de venta (tienda, Mercado Libre, API, POS)
- **WooCommerce**: Atribución UTM desde meta_data

**Inteligencia de Clientes:** LTV promedio, revenue por cliente, tasa de retención, días entre compras, ratio LTV:CAC.

### 6. Email Marketing (`/email`)
**Qué es:** Performance de email marketing con datos de Klaviyo o Perfit.
**Para quién:** Email & WhatsApp Specialist, Manager.
**Qué muestra:** Enviados, delivered, opens, OR, clicks, CTR, bounces, unsubscribes, revenue, conversiones. Detalle de campañas y flows.
- **Klaviyo**: Grid de 5 columnas por flow (enviados, open rate, click rate, ventas, revenue)
- **Perfit**: Thumbnails de campañas y badges de tags

### 7. Google Ads (`/google-ads`)
**Qué es:** Dashboard de Google Ads con desglose avanzado.
**Para quién:** Paid Media Specialist, Manager.
**Qué muestra:** Métricas por tipo de campaña (Search, Shopping, Display, Video, PMax), Top 50 Search Terms por gasto, Video Completion Funnel (P25→P50→P75→P100 con barras escalonadas).

### 8. Leads (`/channels/leads`)
**Qué es:** Funnel de leads con analytics y calificación.
**Para quién:** Marketing Manager Leads.
**Qué muestra:** Visualización de funnel, métricas de conversión por etapa, CPL, tasa de calificación, Reverse Funnel Calculator (de revenue objetivo a budget necesario).
**Dos modos:** `full_funnel` (con agenda + asistencia) y `whatsapp_simple` (sin agenda).

### 9. Google Search Console, SEO y GEO Intelligence (`/channels/search-console`, `/channels/seo`, `/geo`)
**Qué es:** Tres capas de inteligencia orgánica/search.
**Para quién:** Manager, SEO Specialist.
- **Search Console:** Queries orgánicas con CTR, posición, impresiones. KW Gaps (keywords que rankeás orgánico pero no estás pujando en Google Ads). Tendencias al alza/baja, cluster view.
- **SEO Intelligence:** Panel ejecutivo con señales de urgencia, oportunidades por tier (quick wins, estratégicas, largo plazo), split brand/generic.
- **GEO Intelligence:** Monitoreo de presencia de marca en LLMs (ChatGPT, Gemini, Perplexity). Cuántas veces te mencionan, en qué posición y en qué contexto. Estrategia GEO generada por AI basada en 9 métodos comprobados.

### 10. Creative Brain (`/tools/creative-brain`)
**Qué es:** El workspace creativo con AI. Reemplaza "abrir Claude en otra pestaña y explicar el cliente desde cero".
**Para quién:** Diseñadores, Copywriters, Community Managers, Paid Media.
**3 componentes:**
- **Chat Creativo**: Generá hooks (5 tipos), guiones (estructura 0-30s), copy (AIDA/PAS/B-A-B). El AI ya tiene el playbook del cliente precargado.
- **Playbook del Cliente**: Base de conocimiento acumulada — qué funciona, qué no repetir. Se actualiza automáticamente al final de sesiones largas (12+ mensajes).
- **Humanizador**: Elimina AI tells en español. Convierte copy generado en texto que suena como una persona real.
**Cuándo usarlo:** Antes de producir cualquier pieza nueva. El AI menciona patterns del playbook: "Los hooks de pregunta directa generan 3x más CTR en este cliente."

### 11. Spam Checker (`/tools/spam-check`)
**Qué es:** Herramienta para testear si un email va a spam antes de enviarlo masivamente.
**Para quién:** Email & WhatsApp Specialist.
**Flujo:** Enviás email de prueba a spam-test@worker.ar → Brain lo detecta en Gmail → pasa por SpamAssassin (Postmark) → Claude genera recomendaciones en español → resultado en UI + notificación en Slack.

### 12. Intérprete de Instagram (`/tools/instagram`)
**Qué es:** Análisis automático de posts y reels de Instagram con AI.
**Para quién:** Diseñadores, Paid Media (análisis de competidores), Community Manager.
**Flujo:** Pegás URL de Instagram → scrapea el post (Apify) → si es reel, transcribe el audio (AssemblyAI) → analiza imágenes y copy con Claude vision → registra todo en Notion con transcript e insights.

### 13. Creative Studio (`/creative/briefs`)
**Qué es:** Studio de inteligencia creativa avanzada.
**Para quién:** Diseñadores, TL Diseño, Paid Media.
**Qué incluye:** Matriz de Diversificación Creativa (qué formatos y ángulos faltan), biblioteca de ideas por nivel de awareness (TOFU/MOFU/BOFU), brief generator con identidad visual del cliente, refinamiento iterativo con AI.

### 14. Reportes Públicos (`/reportes`)
**Qué es:** Links públicos por cliente para compartir performance mensual.
**Para quién:** Manager, Account Manager.
**Qué incluye:** Notas del operador por canal con sugerencia de AI, selector de mes, MER/nCAC como KPIs principales, barra de atribución, tabla de tendencias 6 meses.

### 15. Cerebro de Worker (`/admin/cerebro`)
**Qué es:** El centro de configuración de toda la inteligencia artificial.
**Para quién:** Manager (configuración avanzada).
**5 tabs:**
1. **Generadores IA**: Prompts de reportes, auditorías, variaciones, recomendaciones, briefs
2. **Motor de Decisiones**: Umbrales de fatiga, estructura, alertas por cliente
3. **Clasificador Creativo**: Vista de las 6 categorías y su lógica
4. **Consola de Pruebas**: Testear cualquier prompt con cualquier cliente
5. **AI Analyst**: Prompts personalizables por canal

---

## AI Analyst: Tu analista senior 24/7

### Qué es
Un panel de chat conversacional que se abre al costado derecho de cualquier sección del Brain. Está alimentado por Claude con **todos los datos del cliente ya precargados**. No necesitás copiar ni pegar nada — ya los tiene.

### Cómo abrirlo
Clic en el botón **"Analizar con IA"** que aparece en el header de cada sección de canal (Meta Ads, Google Ads, Ecommerce, Email, etc.).

### 8 canales disponibles
| Canal | Qué datos tiene precargados | Ejemplos de preguntas |
|-------|---------------------------|----------------------|
| **Meta Ads** | Campañas, ad sets, creativos, métricas rolling, Creative DNA | "¿Por qué cayó el ROAS esta semana?", "¿Qué creativos debería escalar?" |
| **Google Ads** | Campañas por tipo, search terms, video funnel | "¿Qué search terms están gastando sin convertir?", "¿Cómo está el funnel de video?" |
| **Ecommerce** | Ventas, productos, atribución, clientes, LTV | "¿Cuál es el ROAS real cruzando spend con ventas de Shopify?", "¿Cuáles son los top productos?" |
| **Email** | Campañas, flows, métricas, automaciones, health score | "¿Qué flow tiene el gap más grande entre OR y CTR?", "¿El spam rate está en zona de riesgo?" |
| **GSC / SEO** | Queries, posiciones, CTR, KW gaps, oportunidades SEO | "¿Cuáles son los KW gaps más valiosos?", "¿Qué contenido debería priorizar?" |
| **Cross-Channel** | Todos los canales combinados + atribución | "¿Hay discrepancia de atribución?", "¿Dónde está el cuello de botella del negocio?" |
| **Competidores** | Precios, stock, políticas de competidores monitoreados | "¿Algún competidor bajó precios esta semana?", "¿Cómo estamos vs la competencia?" |
| **Leads** | Funnel, calificación, tasas de conversión | "¿Cuál es la tasa de calificación este mes?", "¿El CPL subió?" |

### Cómo sacarle el máximo
- **Preguntá en lenguaje natural** — no necesitás jerga técnica
- **Sé específico** — "¿Por qué cayó el ROAS?" es mejor que "¿Cómo van las campañas?"
- **Preguntá follow-ups** — es conversacional, recuerda el contexto de la conversación
- **Usá Cross-Channel** para diagnósticos que cruzan canales (ej: "¿la caída de conversión es por el sitio o por los ads?")

### Lo que reemplaza
| Antes (sin Brain) | Ahora (con AI Analyst) |
|---|---|
| Exportar CSV de Meta → subir a Claude → armar prompt → esperar respuesta | Abrir AI Analyst → preguntar → respuesta instantánea con datos reales |
| Cruzar datos de Meta + Shopify en una planilla para calcular ROAS real | Preguntar "¿Cuál es mi ROAS real?" → el Analyst ya cruzó todo |
| Armar un prompt largo explicando el contexto del cliente | El Analyst ya tiene todo el contexto precargado |

---

## Alertas Automáticas: Problemas detectados antes de que escalen

### Cómo funcionan
Worker Brain analiza los datos de todos los canales todos los días y genera alertas automáticas cuando detecta algo fuera de rango. **No necesitás buscar problemas — el Brain te los trae.**

### 39 alertas en 6 canales

| Canal | Cantidad | Alertas principales |
|-------|---------|-------------------|
| **Meta Ads** | 16 | CPA Spike, Budget Bleed, Scaling Opportunity, Rotate Concept, Hook Kill, Body Weak, CTA Weak, Image Invisible, Creative Mix Imbalance |
| **Google Ads** | 6 | CPA Spike, Budget Bleed, ROAS Drop, Impression Share Drop, CTR Drop, Quality Score Low |
| **Ecommerce** | 6 | Revenue Drop, CVR Drop, AOV Drop, Cart Abandonment Spike, Refund Spike, New Customers Drop |
| **Email** | 4 | Spam Rate High, OR Drop, Bounce Spike, Unsubscribe Spike |
| **Leads** | 4 | CPL Spike, Qualification Rate Drop, Response Time Slow, Volume Drop |
| **Cross-Channel** | 3 | Attribution Gap, Spend Imbalance, Channel Cannibalization |

### Niveles de severidad
| Nivel | Qué significa | Dónde llega | Acción |
|-------|-------------|------------|--------|
| **CRITICAL** | Problema urgente que está costando dinero ahora | Morning Briefing diario en Slack | Actuar hoy |
| **WARNING** | Problema que puede escalar si no se atiende | Weekly Review semanal en Slack | Revisar esta semana |
| **INFO** | Oportunidad o dato relevante sin urgencia | Solo en el panel del Brain | Consultar cuando convenga |

### Lo que reemplaza
| Antes | Ahora |
|-------|-------|
| Revisar cada cuenta manualmente buscando problemas | Las alertas llegan solas a Slack |
| Detectar fatiga creativa cuando el ROAS ya cayó mucho | ROTATE_CONCEPT detecta fatiga antes de que el CPA explote |
| No saber que el budget se está quemando sin conversiones | BUDGET_BLEED te avisa apenas pasa el umbral |
| Perder oportunidades de escala por no revisar a tiempo | SCALING_OPPORTUNITY te dice cuándo y cuánto subir |

---

## Digestos Automáticos en Slack: Información que te llega sin pedirla

### Morning Briefing (todos los días, 10:15 UTC)
**Qué es:** Un mensaje corto (~10 líneas) en Slack con el resumen de cada cliente + alertas del día + action items concretos (máximo 3).
**Cómo usarlo:**
1. Leerlo al llegar a trabajar
2. Si hay alertas CRITICAL → abrir el Brain para ese cliente
3. Los action items son las 3 cosas más importantes para hacer hoy
4. El detalle (performance, alertas, semáforo) se envía en thread replies debajo del mensaje principal

### Weekly Review (lunes, 10:30 UTC)
**Qué es:** Comparación semana a semana de cada cliente con detalle por canal y recomendaciones de foco (máximo 3).
**Cómo usarlo:** En la reunión de equipo del lunes. Muestra qué mejoró, qué empeoró y dónde enfocarse.

### Monthly Report (día 2 del mes, 10:00 UTC)
**Qué es:** Comparación mes a mes con resultado vs objetivo, top performers y health scores.
**Cómo usarlo:** Como base para el reporte al cliente. El Manager lo toma, lo complementa con contexto en Claude si necesita, y lo presenta.

### Lo que reemplaza
| Antes | Tiempo | Ahora | Tiempo |
|-------|--------|-------|--------|
| Armar el resumen diario de cada cliente | 30-60 min/día | Morning Briefing llega solo | 5 min leerlo |
| Comparar semana a semana a mano en planilla | 1-2h/semana | Weekly Review llega solo | 10 min revisarlo |
| Armar el reporte mensual cruzando 4 fuentes | 4-6h/mes | Monthly Report como base + Claude para ajustar | 1h total |

---

## Creative Intelligence: Producir mejor con datos, no con intuición

### Creative DNA (Análisis AI de cada creativo)
Gemini Vision analiza cada pieza creativa y extrae:
- **Estilo visual**: ugc, professional, graphic, lifestyle, product_shot
- **Tipo de hook**: curiosity, pain_point, result, demonstration, question
- **Color dominante**: el color principal de la pieza
- **Presencia de elementos**: texto, cara humana, producto, escenario
- **Tono emocional**: urgency, aspiration, trust, humor, empathy
- **Tipo de copy**: offer, testimonial, educational, storytelling
- **Tipo de CTA**: shop_now, learn_more, get_offer, sign_up

### 6 Categorías Automáticas
| Categoría | Qué significa | Acción |
|-----------|-------------|--------|
| **Dominante Escalable** | Alto gasto + CPA eficiente | Escalar presupuesto agresivamente |
| **Winner Saturando** | Era eficiente pero muestra fatiga | Rotar concepto antes de que muera |
| **Hidden BOFU** | Bajo gasto pero excelentes conversiones | Aumentar budget — está subutilizado |
| **TOFU Ineficiente** | Alto gasto + pobre eficiencia | Cortar o reestructurar |
| **Zombie** | Gasto mínimo, resultados mínimos | Pausar o refrescar |
| **Nuevo / Sin Datos** | Menos de 4 días o 2000 impresiones | Esperar antes de juzgar |

### Diversity Score
Puntaje de diversidad creativa por cliente = entity groups únicos / total de ads activos. Si es bajo, el cliente necesita más variedad de formatos y ángulos.

### Lo que reemplaza
| Antes | Ahora |
|-------|-------|
| "Este creativo me parece que no funciona" (opinión) | Hook Rate 12%, clasificación: Zombie (dato) |
| No saber qué patrón visual funciona mejor | Creative DNA muestra: UGC + curiosity hook + face = top performer |
| Producir piezas sin referencia de qué funcionó | Abrir Creative Intel, ver los Dominant Scalable, producir más así |

---

## Customer Intelligence: Saber quién te compra y cuánto vale

### Solo para clientes con ecommerce conectado (Shopify, TN, WooCommerce)

| Métrica | Qué te dice |
|---------|------------|
| **LTV Promedio** | Cuánto gasta un cliente en toda su vida con la marca |
| **Revenue por Cliente** | Ingreso promedio por cliente |
| **Tasa de Retención** | Qué % de clientes vuelve a comprar |
| **Días entre Compras** | Cada cuánto vuelve un cliente en promedio |
| **Ratio LTV:CAC** | Cuánto vale un cliente vs cuánto costó adquirirlo |
| **Cohorts** | Grupos de clientes por comportamiento (first-time, returning, VIP) |

### Lo que reemplaza
| Antes | Ahora |
|-------|-------|
| Exportar todos los pedidos de Shopify, hacer pivot table para calcular LTV | El Brain lo calcula automáticamente por cohort |
| No saber si los clientes que traen los ads vuelven a comprar | Tasa de retención y LTV:CAC visible en el dashboard |
| Cruzar gasto en ads con ventas para calcular CAC | El Brain lee spend de Meta + Google y lo divide por clientes nuevos |

---

## Competitor Intelligence: Saber qué hace la competencia sin buscarlo

### Qué se monitorea
- **Precios** de productos tracked vs competidores
- **Disponibilidad de stock** (en stock / sin stock)
- **Políticas** de envío, cuotas, devoluciones
- Snapshots semanales (cada domingo 20:00 UTC)

### Cómo se usa
- Revisión semanal para detectar cambios de precios de competidores
- AI Analyst del canal Competidores para preguntar: "¿Algún competidor cambió precios esta semana?"
- Informar decisiones de pricing y promociones del cliente

---

## Creative Brain: El Workspace Creativo con AI

### Qué es y por qué importa
El Creative Brain reemplaza la dinámica de "abrir Claude en otra pestaña, copiar el brief, explicar quién es el cliente, y esperar que la AI entienda el contexto desde cero". En el Brain, el contexto ya está. El playbook del cliente ya está. Los learnings de sesiones anteriores ya están.

### Los 3 componentes
1. **Chat Creativo** (`/tools/creative-brain`): Generá hooks, guiones para Reels (30s estructura 0-30s), copy con frameworks AIDA/PAS/B-A-B. El AI lee el playbook del cliente al inicio de cada sesión y menciona los patterns relevantes.
2. **Playbook del Cliente**: Base de conocimiento acumulada por cliente. Se actualiza automáticamente al final de sesiones de 12+ mensajes. Almacena qué hooks funcionan, qué ángulos rinden, qué no repetir, benchmarks por formato.
3. **Humanizador**: Detecta y elimina AI tells en español. El resultado suena como una persona real hablando, no como un informe corporativo.

### Los 5 tipos de hooks que genera el Brain
| Tipo | Principio psicológico | Ejemplo |
|------|----------------------|---------|
| **Problema** | Identificación | "¿Seguís pagando demasiado por envíos?" |
| **Pregunta** | Curiosidad directa | "¿Cuánto perdés por mes en descuentos mal calculados?" |
| **Shock/Dato** | Sorpresa cognitiva | "El 73% de los carritos abandonados se recuperan en 2 horas" |
| **Curiosidad** | Loop abierto | "Esto fue lo que cambió nuestro ROAS de 1.2 a 4.8" |
| **Identidad** | Pertenencia/aspiración | "Para los que entienden que vender barato no es una estrategia" |

### Lo que reemplaza
| Antes | Ahora |
|-------|-------|
| Abrir Claude en otra pestaña, explicar el cliente desde cero | Creative Brain tiene el contexto precargado |
| Hooks genéricos sin contexto de marca | Hooks alineados con el playbook del cliente |
| Copy que claramente suena a AI | Humanizador lo convierte en texto natural |
| Perder learnings al cerrar el chat | Playbook persiste y se acumula sesión a sesión |

---

## Email Health & Deliverability

### 3 niveles de monitoreo
1. **Email List Health Score** (visible en dashboard Email): Gauge 0-100 con zona de peligro/alerta/saludable. Métricas: spam rate, bounce rate, unsubscribe rate, open rate. Estimación de contactos no comprometidos. Recomendaciones accionables.
2. **Deliverability Check Mensual** (cron día 1): Verificación SPF, DKIM, DMARC. Chequeo de blacklists (Spamhaus, Barracuda, SURBL). Score de reputación DNS 0-100. Reporte automático en Slack.
3. **Spam Checker On-Demand** (`/tools/spam-check`): Enviás email de prueba → SpamAssassin lo analiza → Claude genera recomendaciones → resultado en UI y Slack.

### Benchmarks críticos
| Métrica | Verde | Amarillo | Rojo |
|---------|-------|----------|------|
| Spam Rate | < 0.05% | 0.05–0.10% | > 0.10% |
| Hard Bounce | < 1% | 1–3% | > 3% |
| Unsubscribe | < 0.3% | 0.5–1% | > 1% |
| Open Rate | > 20% | 10–20% | < 10% |

---

## Google Search Console, SEO y GEO Intelligence

### Search Console (`/channels/search-console`)
- Queries orgánicas con CTR, posición, impresiones. Detección de tendencias al alza/baja.
- **KW Gaps**: Keywords que rankeás en posición 1-10 orgánicamente pero no estás pujando en Google Ads — oportunidades de captura adicional.
- Cluster view para ver grupos de queries relacionadas.

### SEO Intelligence (`/channels/seo`)
- Panel ejecutivo con señales de urgencia y oportunidades por tier.
- Quick wins (bajo esfuerzo, alto impacto) vs estratégicas vs largo plazo.
- Split brand/generic para entender la composición del tráfico orgánico.

### GEO Intelligence (`/geo`) — Nuevo
- Monitoreo de presencia de marca en LLMs: cuántas veces ChatGPT, Gemini y Perplexity mencionan tu marca al responder preguntas del sector.
- Registra: si fue mencionada (sí/no), posición en la lista, fragmento de contexto, qué LLM respondió.
- Estrategia GEO generada por AI con 9 métodos basados en investigación de Princeton para aumentar probabilidad de ser citado.
- Corre automáticamente los domingos a las 20:30 UTC.

---

## Ahorro de tiempo concreto por rol

### E-Commerce Marketing Manager
| Tarea | Antes (sin Brain) | Ahora (con Brain) | Ahorro |
|-------|-------------------|-------------------|--------|
| Análisis semanal de performance cross-channel | 2-3h | 15 min (Morning Briefing + AI Analyst) | ~85% |
| Reporte mensual para el cliente | 4-6h | 1h (Monthly Report + Claude para ajustar) | ~80% |
| Diagnóstico de caída de revenue | 1-2h buscando en cada plataforma | 10 min (AI Analyst Cross-Channel) | ~90% |
| Brief mensual al equipo | 1-2h | 20 min (datos del Brain + Claude para redactar) | ~80% |
| Detectar problemas de atribución entre canales | 1h cruzando planillas | 5 min (AI Analyst + alerta ATTRIBUTION_GAP) | ~90% |
| Preparar reunión mensual con el cliente | 1h | 20 min (Monthly Report como base) | ~70% |

### Paid Media Specialist
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Análisis semanal de Meta Ads | 45-60 min exportando y analizando | 5 min en el Brain | ~90% |
| Revisión de creativos (cuáles escalar/pausar) | 30-45 min en Ads Manager | 3 min en Decision Board | ~90% |
| Detectar fatiga creativa | Revisión manual de frecuencia y CTR | Alerta ROTATE_CONCEPT llega sola | 100% automático |
| Análisis de Search Terms de Google | 30 min exportando y clasificando | 2 min (Top 50 ya integrados en el Brain) | ~90% |
| Reporte semanal al manager | 20-30 min | 5 min (datos del Brain + prompt en Claude) | ~80% |
| Detectar oportunidades de escala | Revisión manual diaria | Alerta SCALING_OPPORTUNITY llega sola | 100% automático |

### Email & WhatsApp Specialist
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Análisis mensual de email | 45-60 min exportando de Klaviyo/Perfit | 5 min (AI Analyst Email) | ~90% |
| Detectar problemas de deliverability | Revisar manualmente spam rate y bounces | Alerta EMAIL_SPAM_RATE_HIGH llega sola | 100% automático |
| Revisar performance de flows | Abrir cada flow en Klaviyo y anotar métricas | Todo en el dashboard de Email del Brain | ~80% |
| Comparar MoM de email | Exportar 2 meses y cruzar | Monthly Report ya lo tiene | ~90% |

### Diseñador
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Saber si mi pieza funcionó (Hook Rate, CTR) | Pedirle al trafficker que me pase los datos | Abro Creative Intel y lo veo yo mismo | 100% autonomía |
| Entender qué patrones creativos funcionan | Intuición + feedback subjetivo del equipo | Creative DNA me muestra los patrones ganadores con datos | Feedback basado en datos |
| Saber qué producir el mes que viene | Esperar el brief sin contexto | Reviso Creative Intel antes del brief para proponer | Producción proactiva |

### TL de Paid Media
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Revisión semanal de toda la cartera | 2-3h revisando cuenta por cuenta | 15 min (Command Center + Morning Briefing) | ~90% |
| Detectar problemas antes que el cliente | Revisar cada cuenta diariamente | 39 alertas llegan solas a Slack | 100% automático |
| Auditoría mensual de cuentas | 1h por cuenta | 20 min por cuenta (Brain tiene todo) | ~70% |
| Dar feedback con datos al equipo | Pedir exports, cruzar, interpretar | Abrir Creative Intel y mostrar las métricas | ~80% |

### TL de Diseño
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Feedback basado en datos al diseñador | Subjetivo: "esto no me gusta" | "Tu Hook Rate es 12%, benchmark >30%. El hook no para el scroll." | 100% objetivo |
| Identificar tendencias creativas del mes | No se hacía o se hacía a ojo | Creative DNA muestra patrones cruzados entre clientes | Insight nuevo |
| Planificar kit mensual | Sin data de qué funcionó | Brain muestra qué formatos/ángulos rinden mejor | Planificación informada |

### Community Manager
| Tarea | Antes | Ahora | Ahorro |
|-------|-------|-------|--------|
| Saber qué ángulos creativos funcionan en ads | Preguntar al trafficker (si se acuerda) | Abrir Creative Intel y ver los top performers | Autonomía |
| Saber qué productos priorizar en contenido | Preguntar al manager | Abrir Ecommerce y ver top productos por revenue | Autonomía |

---

## Resumen: Qué eliminó Worker Brain

### Tareas que ya no existen
- Exportar CSVs de Meta/Google/Klaviyo/Shopify para analizar
- Cruzar datos entre plataformas en planillas
- Buscar problemas manualmente en cada cuenta todos los días
- Armar el resumen diario de performance a mano
- Calcular ROAS real cruzando ads con ventas a mano
- Pedir datos de performance de creativos al trafficker (diseñadores lo ven directo)
- Hacer el reporte mensual desde cero (el Monthly Report es la base)
- Clasificar creativos manualmente en categorías
- Revisar search terms de Google exportando y clasificando

### Tareas que se redujeron drásticamente
| Tarea | Antes | Ahora |
|-------|-------|-------|
| Análisis semanal por cliente | 2-3h | 15 min |
| Reporte mensual | 4-6h | 1h |
| Diagnóstico de problemas | 1-2h investigando | 10 min con AI Analyst |
| Auditoría de cuenta | 1h por cuenta | 20 min |
| Feedback creativo | 30 min buscando datos | 5 min en Creative Intel |

### Ahorro estimado semanal por equipo
| Rol | Ahorro semanal estimado |
|-----|------------------------|
| Manager (por cliente) | 3-5 horas |
| Paid Media (por cuenta) | 2-3 horas |
| Email Specialist | 1-2 horas |
| TL Paid Media (cartera) | 3-4 horas |
| TL Diseño | 1-2 horas |
| Diseñador | 30-60 min (+ autonomía) |
| **Total equipo (10 clientes)** | **~30-50 horas/semana** |

Ese tiempo liberado se reinvierte en lo que importa: **estrategia, producción creativa, experimentación y relación con el cliente** — las cosas que ninguna AI puede reemplazar pero que antes no había tiempo de hacer bien.
