"""Resolve which repo a `git ...` bash command actually operates on.

The hooks in settings.json always run with cwd = CLAUDE_PROJECT_DIR (the
comanda-directa root), but this working tree holds two nested repos of their
own (presencia-carta/, sagrado-sushi-carta/). A guard that assumes the root
silently passes on those: the root index is empty when you stage inside a
nested repo.

Shared by secret-scan-guard.py and pre-push-guard.py so both agree on the
target. Handles the two shapes that show up in practice:

    git -C sagrado-sushi-carta commit -m "..."
    cd presencia-carta && git commit -m "..."
"""
import os
import re
import shlex

# git global options that take a value, so the parser knows to skip the value
OPTS_CON_VALOR = {"-C", "-c", "--exec-path", "--namespace", "--git-dir", "--work-tree"}


def normalizar(ruta):
    """msys path (/c/Users/...) -> Windows path (C:/Users/...); otherwise as-is.

    Git bash hands out /c/... paths that os.path.isdir() rejects on Windows.
    Without this a `git -C /c/.../presencia-carta push` resolved to nothing and
    the guard fell through as if there were no gate at all.
    """
    if not ruta:
        return ruta
    m = re.match(r"^/([A-Za-z])/(.*)$", ruta)
    if m and os.name == "nt":
        return m.group(1).upper() + ":/" + m.group(2)
    return ruta


def _base_dir(payload):
    """Where the command runs from, before any `cd` inside it."""
    for cand in ((payload or {}).get("cwd"), os.environ.get("CLAUDE_PROJECT_DIR")):
        cand = normalizar(cand or "")
        if cand and os.path.isdir(cand):
            return cand
    return os.getcwd()


def _cd_prefix(cmd):
    """Leading `cd <dir> &&` / `cd <dir>;`, the dir it moves to (or None)."""
    m = re.match(r"^\s*cd\s+(\"[^\"]+\"|'[^']+'|\S+)\s*(?:&&|;)\s*", cmd)
    if not m:
        return None, cmd
    destino = m.group(1).strip("\"'")
    return destino, cmd[m.end():]


def subcomando(cmd):
    """The git subcommand (commit, push, ...), or None if not a git command."""
    _, resto = _cd_prefix(cmd)
    if not re.match(r"^\s*git(\s|$)", resto):
        return None
    try:
        tokens = shlex.split(resto)
    except ValueError:
        tokens = resto.split()
    i = 1  # skip "git"
    while i < len(tokens):
        t = tokens[i]
        if not t.startswith("-"):
            return t
        if t in OPTS_CON_VALOR:
            i += 2
            continue
        i += 1
    return None


def target_dir(payload):
    """Absolute dir the git command targets: cwd + `cd ...` + `git -C ...`."""
    cmd = ((payload or {}).get("tool_input", {}) or {}).get("command", "") or ""
    base = _base_dir(payload)

    destino_cd, resto = _cd_prefix(cmd)
    if destino_cd:
        destino_cd = normalizar(destino_cd)
        base = destino_cd if os.path.isabs(destino_cd) else os.path.join(base, destino_cd)

    try:
        tokens = shlex.split(resto)
    except ValueError:
        tokens = resto.split()
    i = 1
    while i < len(tokens):
        t = tokens[i]
        if not t.startswith("-"):
            break
        if t == "-C" and i + 1 < len(tokens):
            destino = normalizar(tokens[i + 1])
            base = destino if os.path.isabs(destino) else os.path.join(base, destino)
            i += 2
            continue
        if t in OPTS_CON_VALOR:
            i += 2
            continue
        i += 1

    return os.path.normpath(base)
