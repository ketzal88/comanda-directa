#!/usr/bin/env python3
"""Stop hook (close-protocol): reminds ONCE if the turn ends with uncommitted code.

Config-driven: enabled only when gates.closeProtocol = "blocking" in
stack.json. Absent key = silent no-op (framework convention).

Why: a friction audit of 100+ real sessions showed the most common
end-of-session pattern was the operator chasing the agent with "did you
commit?" — the close was never codified. The correct close for
substantial work is: run the commit-checkpoint flow, commit, and end the
final message with "committed: <short sha> - N commit(s) ready to push".

Blocks (exit 2) only ONCE per close (stop_hook_active breaks the loop).
If the dirty files are deliberate WIP or another session's debt, the
agent says so explicitly in its final message and closes on the retry.

Skip conditions (exit 0):
  - stop_hook_active=True (re-trigger of our own previous block).
  - SKIP_COMMITCHECK=1 (explicit bypass).
  - gates.closeProtocol not configured.
  - clean working tree, or only docs/config changes (.md, docs/, .claude/, .github/).

Checks the root repo AND every nested repo one level down (any subdir with
its own .git: presencia-carta/, sagrado-sushi-carta/). They are gitignored
here, so the root `git status` never sees them and work left dirty inside
them used to close silently.

Two different kinds of debt, both surfaced, neither one silent:

  - uncommitted code files -> the agent commits them (or says why not);
  - commits that never got pushed -> the agent REPORTS them. It cannot fix
    these (push is operator-only), and that is the point: the close line the
    operator reads is the only place where "committed" and "pushed" stop
    being the same word. Found in the wild: presencia-carta sat 3 commits
    ahead of origin/main for weeks because nothing ever said so out loud.
"""
import json
import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
READ_CONFIG = os.path.join(SCRIPT_DIR, "read-config.py")

DOC_SUFFIXES = (".md",)
DOC_DIR_PREFIXES = ("docs/", ".claude/", ".github/")


def cfg(key):
    try:
        r = subprocess.run(
            [sys.executable, READ_CONFIG, key],
            capture_output=True, text=True, timeout=5,
        )
        return r.stdout.strip() if r.returncode == 0 else None
    except Exception:
        return None


def repos(root):
    """The root repo plus every nested repo one level down."""
    encontrados = [root]
    try:
        for nombre in sorted(os.listdir(root)):
            d = os.path.join(root, nombre)
            if os.path.isdir(os.path.join(d, ".git")):
                encontrados.append(d)
    except Exception:
        pass
    return encontrados


def sin_pushear(repo):
    """How many commits `repo` has that its upstream does not.

    Zero when there is no upstream configured (a fresh branch nobody pushed
    yet is the operator's call, not something to nag about) and zero on any
    git error: this hook exists to surface debt, never to become one.
    """
    try:
        r = subprocess.run(
            ["git", "rev-list", "--count", "@{upstream}..HEAD"],
            capture_output=True, text=True, timeout=10, cwd=repo,
        )
        return int(r.stdout.strip()) if r.returncode == 0 else 0
    except Exception:
        return 0


def sucio(repo):
    """Uncommitted code files in `repo` (docs/config filtered out)."""
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=10, cwd=repo,
        )
        lines = [ln for ln in (r.stdout or "").splitlines() if len(ln) > 3]
    except Exception:
        return []

    archivos = []
    for line in lines:
        path = line[3:].strip().strip('"').replace("\\", "/")
        if path.endswith(DOC_SUFFIXES):
            continue
        if any(path.startswith(p) for p in DOC_DIR_PREFIXES):
            continue
        archivos.append(path)
    return archivos


def main():
    try:
        payload = json.loads(sys.stdin.read().lstrip("\ufeff"))
    except Exception:
        return 0

    if payload.get("stop_hook_active"):
        return 0
    if os.environ.get("SKIP_COMMITCHECK") == "1":
        return 0
    if cfg("gates.closeProtocol") != "blocking":
        return 0

    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    code_files = []
    pendientes = []
    for repo in repos(root):
        nombre = os.path.basename(repo)
        etiqueta = "" if repo == root else nombre + "/"
        code_files.extend(etiqueta + f for f in sucio(repo))
        cuantos = sin_pushear(repo)
        if cuantos:
            pendientes.append((nombre, cuantos))

    if not code_files and not pendientes:
        return 0

    if code_files:
        sys.stderr.write(
            "[close-protocol] " + str(len(code_files)) +
            " code file(s) left uncommitted:\n"
        )
        for p in code_files[:10]:
            sys.stderr.write("  " + p + "\n")
        if len(code_files) > 10:
            sys.stderr.write("  ... and " + str(len(code_files) - 10) + " more\n")
        sys.stderr.write(
            "\nBefore closing, pick ONE:\n"
            "  a) Finished work of yours -> run the commit-checkpoint flow, commit,\n"
            "     and end your message with 'committed: <sha> - N commit(s) ready to\n"
            "     push'. NEVER run git push yourself (the push belongs to the operator).\n"
            "  b) Deliberate WIP or another session's debt -> say so explicitly in your\n"
            "     final message (which files and why) and close.\n"
        )

    if pendientes:
        sys.stderr.write("\n[close-protocol] commit(s) never pushed:\n")
        for nombre, cuantos in pendientes:
            sys.stderr.write(
                "  " + nombre + ": " + str(cuantos) + " commit(s) ahead of upstream\n"
            )
        sys.stderr.write(
            "\nDo NOT push them yourself (push is operator-only). Name each repo and\n"
            "its count in your final git status line, and say whose work it is if it\n"
            "is not yours, so the operator can decide.\n"
        )

    sys.stderr.write(
        "\nThis reminder fires once per close. Bypass: SKIP_COMMITCHECK=1.\n"
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
