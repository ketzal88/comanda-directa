"""PreToolUse: run secret-scan.sh against the repo the commit actually targets.

Replaces the inline python one-liner that used to live in settings.json. That
one keyed off `cmd.startswith('git commit')` and always ran the scan with
cwd = repo root, so a commit inside presencia-carta/ or sagrado-sushi-carta/
was never scanned: wrong trigger, wrong index.
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from git_target_dir import subcomando, target_dir  # noqa: E402


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    cmd = (payload.get("tool_input", {}) or {}).get("command", "") or ""
    if subcomando(cmd) != "commit":
        return 0

    repo = target_dir(payload)
    if not os.path.isdir(repo):
        return 0

    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    script = os.path.join(root, ".claude", "core", "hooks", "scripts", "secret-scan.sh")
    if not os.path.isfile(script):
        return 0

    r = subprocess.run(["bash", script], cwd=repo)
    if r.returncode != 0:
        sys.stderr.write("[secret-scan] repo escaneado: %s\n" % repo)
    return r.returncode


if __name__ == "__main__":
    sys.exit(main())
