# Zone — task runner.
# Run `just` (no args) or `just --list` to see all recipes.
# All recipes assume cwd = repo root. Logs and PIDs go to .run/ (gitignored).

set shell := ["bash", "-uc"]
set dotenv-load := false

run_dir := ".run"
backend_log := run_dir / "backend.log"
web_log := run_dir / "web.log"
backend_port := "8080"
web_port := "5173"

# Prepended to bash -c invocations so pnpm is on PATH (nvm, Corepack, etc.).
node_bootstrap := 'export PATH="$HOME/.local/share/pnpm:$PATH"; [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh";'

# ── default: list recipes ─────────────────────────────────────────────

default:
    @just --list --unsorted

# ── Postgres ──────────────────────────────────────────────────────────

# Start the local Postgres container (host port 5433).
[group('db')]
db-up:
    docker compose up -d

# Stop the local Postgres container.
[group('db')]
db-down:
    docker compose down

# ── Backend ───────────────────────────────────────────────────────────

# Download dependencies and compile (skips tests — use back-test for those).
[group('backend')]
back-build:
    cd backend && ./gradlew build -x test

# Start the backend in the background. Logs → .run/backend.log
[group('backend')]
back-start: db-up
    @mkdir -p {{run_dir}}
    @if lsof -ti tcp:{{backend_port}} >/dev/null 2>&1; then \
       echo "backend already listening on :{{backend_port}}"; \
     else \
       cd backend && nohup ./gradlew bootRun </dev/null >../{{backend_log}} 2>&1 & \
       echo "backend starting → http://localhost:{{backend_port}} (tail {{backend_log}})"; \
     fi

# Stop the backend by killing whatever is bound to :8080.
[group('backend')]
back-stop:
    @-lsof -ti tcp:{{backend_port}} | xargs -r kill 2>/dev/null || true
    @echo "backend stopped"

# Run backend tests.
[group('backend')]
back-test:
    cd backend && ./gradlew test

# Tail the backend log.
[group('backend')]
back-logs:
    @test -f {{backend_log}} && tail -f {{backend_log}} || echo "no backend log yet"

# ── Web ───────────────────────────────────────────────────────────────

# Install web dependencies from pnpm-lock.yaml.
[group('web')]
web-install:
    bash -c '{{node_bootstrap}} set -euo pipefail; command -v pnpm >/dev/null || { echo "pnpm not found — install: https://pnpm.io/installation" >&2; exit 1; }; cd web && pnpm install --frozen-lockfile'

# Typecheck and production-build the web app (validates before dev server).
[group('web')]
web-build: web-install
    bash -c '{{node_bootstrap}} set -euo pipefail; cd web && pnpm build'

# Start the web dev server in the background. Logs → .run/web.log
[group('web')]
web-start:
    @mkdir -p {{run_dir}}
    @if lsof -ti tcp:{{web_port}} >/dev/null 2>&1; then \
       echo "web already listening on :{{web_port}}"; \
     else \
       cd web && nohup bash -c '{{node_bootstrap}} exec pnpm dev' </dev/null >../{{web_log}} 2>&1 & \
       echo "web starting → http://localhost:{{web_port}} (tail {{web_log}})"; \
     fi

# Stop the web dev server.
[group('web')]
web-stop:
    @-lsof -ti tcp:{{web_port}} | xargs -r kill 2>/dev/null || true
    @echo "web stopped"

# Run web tests (vitest, headless).
[group('web')]
web-test:
    bash -c '{{node_bootstrap}} set -euo pipefail; cd web && pnpm test'

# Tail the web log.
[group('web')]
web-logs:
    @test -f {{web_log}} && tail -f {{web_log}} || echo "no web log yet"

# ── Security ──────────────────────────────────────────────────────────

# Run pnpm's vulnerability audit for web dependencies.
[group('security')]
web-audit:
    bash -c '{{node_bootstrap}} set -euo pipefail; cd web && pnpm audit'

# Scan the installed web dependency graph with OSV-Scanner.
[group('security')]
osv-scan: web-install
    @command -v osv-scanner >/dev/null || { \
      echo "osv-scanner not found — install from https://google.github.io/osv-scanner/installation/" >&2; \
      exit 1; \
    }
    osv-scanner scan source --lockfile web/pnpm-lock.yaml web

# Restore locked deps and run local dependency security checks.
[group('security')]
deps-check: web-install web-audit osv-scan

# ── Combined ──────────────────────────────────────────────────────────

# Install deps, build, then start db + backend + web in the background.
up: db-up web-build back-build back-start web-start
    @echo "all services started"
    @echo "  web:     http://localhost:{{web_port}}"
    @echo "  backend: http://localhost:{{backend_port}}/actuator/health"

# Stop web + backend + db.
down: web-stop back-stop db-down
    @echo "all services stopped"

# Run all tests.
test: back-test web-test

# Show which ports are bound.
status:
    @echo "backend (:{{backend_port}}): $(lsof -ti tcp:{{backend_port}} 2>/dev/null || echo down)"
    @echo "web     (:{{web_port}}): $(lsof -ti tcp:{{web_port}} 2>/dev/null || echo down)"
    @if docker compose ps --status running -q postgres 2>/dev/null | grep -q .; then \
       echo "postgres: up"; \
     else \
       echo "postgres: down"; \
     fi
