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
(ver "Los tres repos"). Los tres tienen su propio `stack.json` y los guards
leen el del repo al que apunta el comando.

## Los tres repos

Tres repos git independientes en un mismo working tree. Desde una sesión
abierta en la raíz se trabajan los tres, pero cada uno tiene su historial, su
remoto y su deploy:

| repo | ruta | remoto (`ketzal88/`) | config propia de Claude |
| --- | --- | --- | --- |
| motor Comanda Directa | `.` | `comanda-directa` | `.claude/` + `stack.json` |
| Sagrado Sushi | `sagrado-sushi-carta/` | `sagrado-sushi-carta` | `.claude/` + `stack.json` propios |
| Presencia | `presencia-carta/` | `presencia-carta` | `.claude/CLAUDE.md` + `stack.json` |

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
- **Cada gate corre contra el `stack.json` del repo destino.** Un
  `git -C presencia-carta push` resuelve los `gates.prePush.steps` de
  `presencia-carta/stack.json` (typecheck + lint + test) y los ejecuta con
  cwd en presencia, no en la raíz. Si el repo destino no tiene manifest, la
  búsqueda sube y cae en el de la raíz.
- **El close-guard mira los tres, y las dos deudas.** Al cerrar el turno
  recorre la raíz y todo subdirectorio con `.git` propio, y reporta dos cosas
  distintas: archivos sin commitear (prefijados con el repo,
  `presencia-carta/src/...`) y **commits sin pushear** (`N commit(s) ahead of
  upstream`). Lo segundo no se arregla commiteando — el push es del operador —:
  se nombra en la línea de cierre, con el repo y el número, y se aclara de
  quién es el trabajo si no es tuyo. Sin eso, "commiteado" y "pusheado"
  parecen la misma palabra y no lo son.
- **Abrí `comanda-directa.code-workspace`, no la carpeta.** El workspace tiene
  los tres repos como raíces, así que el panel de Source Control del editor
  muestra los tres por separado, cada uno con sus cambios y su push. Abriendo
  la carpeta pelada se ve solo el motor, porque los otros dos están en el
  `.gitignore` de acá.
- **Los `forbiddenCommands` sí salen del `stack.json` de la raíz**: son del
  entorno (PowerShell vs Bash), no del repo.

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
