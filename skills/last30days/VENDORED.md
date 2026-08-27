# Procedencia

Skill portada desde un repo externo. El `.git` original se borró al vendorizarla
(ver `docs/skill-authoring/skill-format.md` — las skills portadas se copian, no se submodulean).

| | |
|---|---|
| **Origin** | https://github.com/mvanhorn/last30days-skill.git |
| **Commit** | `122158415ae421da83e739f2668032f6bc78d39c` (branch `main`) |
| **Fecha del commit** | 2026-06-06 |
| **Vendorizada el** | 2026-07-15 |
| **Cambios locales** | ninguno — copia limpia de upstream |

Para traer cambios de upstream: clonar aparte, diffear contra este folder y portar a mano
lo que valga la pena. No re-clonar acá adentro.

## Estructura (normalizada el 2026-07-15)

El repo original trae el layout de marketplace (`skills/<nombre>/SKILL.md`), así que
al vendorizarlo el `SKILL.md` real quedó enterrado en
`skills/last30days/skills/last30days/SKILL.md`. Claude busca `skills/<nombre>/SKILL.md`,
así que la skill existía pero **no se podía invocar**.

Se subió el contenido de la skill (`SKILL.md`, `agents/`, `assets/`, `references/`,
`scripts/`) a la raíz de este folder y se borró el anidamiento. Los docs del repo
(`README.md`, `CLAUDE.md`, `docs/`, `CONCEPTS.md`, etc.) quedaron al lado: agregan
contexto sin pisar el `SKILL.md`, como indica `docs/skill-authoring/skill-format.md`.

Si traés una versión nueva de upstream, ojo con esto: el layout de origen vuelve a
enterrar el `SKILL.md`. Hay que volver a subirlo. `python scripts/check_skills.py`
lo caza.

> Nota: una versión previa de este archivo decía que la skill no tenía `SKILL.md`.
> Era falso — estaba enterrado, no ausente. Enterrado y ausente se arreglan distinto.
