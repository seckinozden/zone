# Zone — project conventions for Claude

Personal day-scheduling app. Solo dev. Three stacks share one repo.

## Repo layout

```
backend/    Spring Boot 3.5 + Java 21 + Postgres + Flyway
web/        React 19 + Vite 6 + Tailwind 4 + React Query
ios/        SwiftUI app — not started
design/     Google Stitch exports + Chronos Deep design system
docker-compose.yml   Local Postgres on host port 5433
```

## Hard rules

**Dependency management (JS):**
- Use **pnpm**, never npm. A repo hook blocks `npm install/i/add/ci`.
- Pin **exact** versions in `package.json` (no `^`, no `~`).
- Default to versions released **≥6 months ago**; avoid bleeding-edge.
- After `pnpm install` or adding a dep, run `pnpm audit`. Bump anything with a CVE.
- Commit `pnpm-lock.yaml`. Use `pnpm install --frozen-lockfile` in CI.

**Postinstall scripts** are opt-in via `pnpm.onlyBuiltDependencies` in `web/package.json`. Currently the only approved one is `esbuild` (needed for Vite).

## Stack details

**Backend** (`backend/`)
- Java 21, Gradle wrapper (`./gradlew bootRun`).
- Connects to Postgres at `localhost:5433` (mapped from container 5432 to avoid clashing with a Docker Postgres the user runs).
- Flyway is the **source of truth** for schema. JPA is `ddl-auto: validate`. New tables/columns go via a new `V<n>__name.sql` migration — never via JPA auto-DDL.
- Auth is deferred. All controllers scope reads/writes to `com.zone.common.CurrentUser.ID` (currently the literal `"local-user"`). When auth lands, swap this for a request-scoped bean; controller signatures don't change.
- Data model v1: `categories`, `events`, `tasks`. Each row carries `user_id`.

**Web** (`web/`)
- React 19.1.0, Vite 6.4.2, Tailwind 4.0.17, React Router 7.12.0, TanStack Query 5.62.11, date-fns 4.1.0, lucide-react 0.469.0. TypeScript 5.7.3.
- Vite dev server on `:5173`, proxies `/api` → `http://localhost:8080`.
- In **UI** language a "task" = a scheduled time block = backend `Event`. The backend has a separate `tasks` table (due_date, status) that the UI doesn't currently use.
- Auth is stubbed: `admin` / `admin` accepted client-side, session in `localStorage` key `zone.session.v1`. No API check yet.
- Calendar grid runs **00:00–23:59** with `SCROLL_ANCHOR_HOUR = 6` so the user lands on 6 AM but can scroll up to midnight.
- Routes: `/login`, `/register`, `/app/{calendar,tasks,settings}`. `/` and unmatched routes redirect to `/app/calendar`.

**iOS** (`ios/`)
- Not started. Folder reserved.

## Recurring procedures

**Adding a new domain entity end-to-end:**
1. New Flyway migration `backend/src/main/resources/db/migration/V<n>__<name>.sql` — schema + `user_id` column.
2. JPA entity, Spring Data repository under `backend/src/main/java/com/zone/<feature>/`.
3. Controller with DTO records, scoping every query by `CurrentUser.ID`.
4. Web: extend `web/src/api/client.ts` with the type + endpoints.
5. Web: add hooks in `web/src/api/hooks.ts` (React Query).
6. Web: page or component consuming the hooks.

**Adding a new web dependency:**
1. Check `pnpm view <pkg>@<version> time scripts` — pick a version ≥6 months old with no install scripts (or known-safe ones).
2. Edit `web/package.json` manually to add the exact pinned version (don't `pnpm add <pkg>`, which writes a caret).
3. `pnpm install --frozen-lockfile=false` to update the lockfile.
4. `pnpm audit`. If clean, commit `package.json` + `pnpm-lock.yaml` together.

## Local run

Use the root `justfile`:

```bash
just up         # db + backend + web, all backgrounded; logs in .run/
just status     # ports + container state
just back-logs  # tail backend log
just web-logs   # tail web log
just down       # stop everything cleanly
just test       # back-test + web-test
```

Each stack also has individual recipes: `back-start/stop/test`, `web-start/stop/test`, `db-up/down`. Run `just --list` for the full set.

Health: <http://localhost:8080/actuator/health>. Login with `admin` / `admin`.

## What's deferred (don't volunteer to build these unless asked)

- Real auth (Firebase/Supabase/self-hosted — not decided).
- Deployment.
- iOS app.
- Timeline, Insights, Manage Labels pages (shown as disabled in the sidebar).
- Search.
- Settings page contents.
- The backend `tasks` table — schema exists, no UI yet.
