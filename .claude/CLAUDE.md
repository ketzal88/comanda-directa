# Comanda Directa — Claude Brain

## Qué es este repo

El motor del producto **Comanda Directa** (pedidos por WhatsApp + carta QR +
impresión de comandas): un Next.js 15 en la raíz que sirve la landing (`/`) y
la carta de todos los clientes (`/[cliente]`) contra un único proyecto de
Supabase multi-tenant. Ver `README.md` para la arquitectura completa y el
runbook de alta de cliente.

Conviven en el working tree, sin ser parte de este código:

- `presencia-carta/`, `sagrado-sushi-carta/` — otros dos productos de Worker,
  cada uno su propio repo git anidado (`.git` propio), Firebase y Vercel
  propios. `sagrado-sushi-carta` fue la referencia para portar la lógica de
  este motor (ver comentarios en `src/logica/`). El `.gitignore` de acá los
  excluye del historial de este repo a propósito.
- `landing/` — artboards de Claude Design (`.dc.html`) del brief original de
  la landing, ya codeada de verdad en `src/app/page.tsx`. Quedan de
  referencia de copy/diseño, no son código servible.
- `skills/` — biblioteca de skills de marketing de Worker (contenido de
  referencia, no auto-loaded — ver `skills/SKILLS-INDEX.md`), sin relación
  con el código de acá.
- `extension-comandas/` — SÍ es parte del producto: extensión de Chrome
  genérica (mismo build para todos los clientes) que imprime la comanda
  desde WhatsApp Web. Tiene su propio `tsconfig.json`/`package.json`, el
  `tsconfig.json` de la raíz la excluye del typecheck del motor a propósito.

## Modular Rules

@.claude/core/rules/operating-procedure.md
@.claude/core/rules/environment-canonical.md
@.claude/core/rules/close-protocol.md

## Testing

`stack.json` declara `commands.typecheck` / `.test` / `.lint` — corren sobre
el motor (`src/`, `pruebas/`), no tocan `extension-comandas/` (tests propios,
`npm test` en esa carpeta) ni los otros dos productos (`presencia-carta/`,
`sagrado-sushi-carta/`, cada uno con su propio `stack.json`).

## Notes for Claude

- `presencia-carta/` y `sagrado-sushi-carta/` son repos git anidados (tienen su propio `.git`).
  Un commit hecho desde la raíz de `comanda-directa` no los toca — hay que operar `git`
  dentro de cada uno para su propio historial.
- Los skills en `skills/` son conocimiento de referencia para trabajo de marketing (copy,
  ads, SEO, etc.), no específicos de este proyecto. Pedile a Claude que lea el `SKILL.md`
  puntual antes de un tema, no se cargan automáticamente.
- Los plugins de marketing (`claude-ads:*`, `claude-blog:*`, `seo-*`, etc.) están habilitados
  a nivel global en este equipo, no viven en este repo.
- El proyecto de Supabase (`comanda-directa`, org Worker) y el de Vercel
  (`comanda-directa`, team Worker's projects) ya existen y están conectados
  — ver README, sección "Poner en marcha Supabase". No crear proyectos
  nuevos sin confirmar primero: ya hay uno.
