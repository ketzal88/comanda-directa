# Procedencia

Skill portada desde un repo externo. El `.git` original se borró al vendorizarla
(ver `docs/skill-authoring/skill-format.md` — las skills portadas se copian, no se submodulean).

| | |
|---|---|
| **Origin** | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git |
| **Commit** | `6623f12b4058d09618c89cffb2de59a47c45f999` (branch `main`) |
| **Fecha del commit** | 2026-02-12 |
| **Vendorizada el** | 2026-07-15 |
| **Cambios locales** | ninguno — copia limpia de upstream |

Para traer cambios de upstream: clonar aparte, diffear contra este folder y portar a mano
lo que valga la pena. No re-clonar acá adentro.

## Estructura (normalizada el 2026-07-15)

Al vendorizar el repo quedaron dos problemas que juntos hacían la skill invocable
por nadie:

- El `SKILL.md` estaba en `.claude/skills/ui-ux-pro-max/SKILL.md`, no en la raíz.
- El folder se llamaba `ui-ux-pro-max-skill` (el nombre del **repo**) contra un
  `name: ui-ux-pro-max` (el nombre de la **skill**). `docs/skill-authoring/skill-format.md`
  exige que coincidan exacto.

Se subió el contenido (`SKILL.md`, `data/`, `scripts/`) a la raíz y se renombró el
folder a `ui-ux-pro-max`, que es el `name:` que declara la skill. Los docs del repo
(`README.md`, `CLAUDE.md`, `cli/`, `screenshots/`) quedaron al lado.

Si traés una versión nueva de upstream, ojo: el layout de origen vuelve a enterrar el
`SKILL.md` bajo `.claude/skills/`. `python scripts/check_skills.py` lo caza.
