# Comanda Directa — Claude Brain

## Qué es este repo

El motor del producto **Comanda Directa** (pedidos por WhatsApp + carta QR +
impresión de comandas): un Next.js 15 en la raíz que sirve la landing (`/`) y
la carta de todos los clientes (`/[cliente]`) contra un único proyecto de
Supabase multi-tenant. Ver `README.md` para la arquitectura completa y el
runbook de alta de cliente.

Conviven en el working tree, con su propio código y su propio git:

- `presencia-carta/`, `sagrado-sushi-carta/` — otros dos productos de Worker,
  cada uno su propio repo git anidado (`.git` propio), Firebase y Vercel
  propios. `sagrado-sushi-carta` fue la referencia para portar la lógica de
  este motor (ver comentarios en `src/logica/`). El `.gitignore` de acá los
  excluye del historial de este repo a propósito. **Los dos se gestionan
  desde esta sesión**: ver "Los tres repos" más abajo.
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
`npm test` en esa carpeta) ni los otros dos productos, que se corren con `-C`
(ver "Los tres repos"). `sagrado-sushi-carta` tiene su propio `stack.json`;
`presencia-carta` no tiene ninguno.

## Los tres repos

Tres repos git independientes en un mismo working tree. Desde una sesión
abierta en la raíz se trabajan los tres, pero cada uno tiene su historial, su
remoto y su deploy:

| repo | ruta | remoto (`ketzal88/`) | config propia de Claude |
| --- | --- | --- | --- |
| motor Comanda Directa | `.` | `comanda-directa` | `.claude/` + `stack.json` |
| Sagrado Sushi | `sagrado-sushi-carta/` | `sagrado-sushi-carta` | `.claude/` + `stack.json` propios |
| Presencia | `presencia-carta/` | `presencia-carta` | ninguna |

Reglas para operarlos desde acá:

- **Git siempre con `-C`**: `git -C presencia-carta status`. Un `git add -A`
  en la raíz no los toca (están en el `.gitignore`), y un commit de la raíz
  nunca entra en su historial.
- **npm también con `-C`** (`npm --prefix`): cada repo tiene su propio
  `node_modules`. Los dos anidados comparten el mismo set de scripts:
  `dev` (`next dev --turbopack`), `build`, `lint` (eslint), `test`
  (`vitest run`), `smoke` (`playwright test`), `qr`. Sagrado suma
  `empaquetar-extension` y lo corre en `prebuild`.
- **Push: operator-only en los tres.** `pre-push-guard.py` bloquea también
  `git -C <repo> push` y `cd <repo> && git push`, no sólo el `git push` pelado.
  Cerrá con "committed: `<sha>` — N commit(s) listos para pushear".
- **El scan de secretos corre en el repo del commit**, resuelto desde el
  comando (`secret-scan-guard.py` + `git_target_dir.py`).
- **Los hooks leen el `stack.json` de la raíz**, aunque el commit sea de un
  anidado. O sea: los `gates.prePush.steps` que declara
  `sagrado-sushi-carta/stack.json` (typecheck + lint + test) **no** se
  ejecutan desde una sesión de la raíz. Si cerrás trabajo en sagrado, corré
  typecheck, lint y test a mano con `-C` antes de dar por terminado.

## Notes for Claude

- `presencia-carta/` y `sagrado-sushi-carta/` son repos git anidados (tienen su propio `.git`).
  Un commit hecho desde la raíz de `comanda-directa` no los toca — hay que operar `git -C`
  contra cada uno para su propio historial. Detalle completo en "Los tres repos".
- Los skills en `skills/` son conocimiento de referencia para trabajo de marketing (copy,
  ads, SEO, etc.), no específicos de este proyecto. Pedile a Claude que lea el `SKILL.md`
  puntual antes de un tema, no se cargan automáticamente.
- Los plugins de marketing (`claude-ads:*`, `claude-blog:*`, `seo-*`, etc.) están habilitados
  a nivel global en este equipo, no viven en este repo.
- El proyecto de Supabase (`comanda-directa`, org Worker) y el de Vercel
  (`comanda-directa`, team Worker's projects) ya existen y están conectados
  — ver README, sección "Poner en marcha Supabase". No crear proyectos
  nuevos sin confirmar primero: ya hay uno.
