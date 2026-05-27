#!/usr/bin/env bash
# PreToolUse hook for Bash: block npm install variants — repo uses pnpm.
# Pure read-only npm commands (view, ls, etc.) still pass through.

set -e

cmd="$(python3 -c 'import sys, json; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))')"

# Match: npm install | npm i | npm i <pkg> | npm add | npm ci
# Also match at start of compound commands (`cd web && npm install`).
if echo "$cmd" | grep -qE '(^|[[:space:];&|(]+)npm[[:space:]]+(install|i|add|ci)([[:space:]]|$)'; then
  cat >&2 <<EOF
Blocked: this repo uses pnpm, not npm (supply-chain policy in CLAUDE.md).

Equivalents:
  pnpm install                        # restore from lockfile
  pnpm install --frozen-lockfile      # CI-safe restore
  pnpm install <pkg>                  # NOT recommended — pin exact version in package.json instead

For new deps: edit web/package.json with an exact version, then \`pnpm install\`.
After any install, run \`pnpm audit\` and treat findings as blocking.
EOF
  exit 2
fi

exit 0
