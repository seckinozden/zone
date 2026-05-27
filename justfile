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

# Start the web dev server in the background. Logs → .run/web.log
[group('web')]
web-start:
    @mkdir -p {{run_dir}}
    @if lsof -ti tcp:{{web_port}} >/dev/null 2>&1; then \
       echo "web already listening on :{{web_port}}"; \
     else \
       cd web && nohup pnpm dev </dev/null >../{{web_log}} 2>&1 & \
       echo "web starting → http://localhost:{{web_port}} (tail {{web_log}})"; \
     fi

# Stop the web dev server.
[group('web')]
web-stop:
    @-lsof -ti tcp:{{web_port}} | xargs -r kill 2>/dev/null || true
    @echo "web stopped"

# Run web tests (no test runner wired yet).
[group('web')]
web-test:
    @echo "no web tests configured yet — extend this recipe when added"

# Tail the web log.
[group('web')]
web-logs:
    @test -f {{web_log}} && tail -f {{web_log}} || echo "no web log yet"

# ── Combined ──────────────────────────────────────────────────────────

# Start db + backend + web in the background.
up: db-up back-start web-start
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
