# Zone

Personal day-scheduling app. See today's plan on the web, sync to iOS later.

## Repo layout

```
zone/
  backend/             Spring Boot 3 + Java 21 + Postgres REST API
  web/                 React 19 + Vite 6 + Tailwind 4 + TypeScript
  ios/                 SwiftUI app — not started
  design/              Google Stitch exports + Chronos Deep design system
  docker-compose.yml   Local Postgres (host port 5433)
  CLAUDE.md            Project conventions for Claude
```

## Quick start

Requires [just](https://github.com/casey/just), Docker, Java 21, pnpm.

```bash
just up                # start db + backend + web in background
just status            # show what's running
just down              # stop everything
just --list            # see all recipes
```

Manual (without just):

```bash
docker compose up -d                   # Postgres on host :5433
cd backend && ./gradlew bootRun        # API on :8080
cd web && pnpm install && pnpm dev     # UI on :5173 (proxies /api → 8080)
```

Open <http://localhost:5173>, sign in with `admin` / `admin` (stub auth until real auth lands).

Health: <http://localhost:8080/actuator/health>

See [backend/README.md](backend/README.md) for API endpoints and [CLAUDE.md](CLAUDE.md) for project rules.

## Status

v1 scope: Events + Categories on web + backend. iOS, real auth, and deployment deferred.
