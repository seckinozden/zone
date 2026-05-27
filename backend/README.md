# Zone backend

Spring Boot 3.5 / Java 21 / Postgres / Flyway / Spring Data JPA.

## Run locally

```bash
# from repo root
docker compose up -d

# from backend/
./gradlew bootRun
```

The app expects Postgres at `localhost:5433` (host port `5433`, container `5432`) with database `zone`, user `zone`, password `zone` (set in `docker-compose.yml`).

## Endpoints (v1)

All endpoints scope data to a hardcoded `user_id = "local-user"` until auth is added.

| Method | Path                | Notes                                                        |
|--------|---------------------|--------------------------------------------------------------|
| GET    | `/api/categories`   | List categories                                              |
| POST   | `/api/categories`   | `{name, color}`                                              |
| DELETE | `/api/categories/{id}` |                                                           |
| GET    | `/api/events`       | Optional `?from=<iso>&to=<iso>` to filter by start_time      |
| POST   | `/api/events`       | `{title, startTime, endTime, categoryId?, notes?}`           |
| PATCH  | `/api/events/{id}`  | Same body as POST                                            |
| DELETE | `/api/events/{id}`  |                                                              |
| GET    | `/api/tasks`        | List tasks                                                   |
| POST   | `/api/tasks`        | `{title, dueDate?, status?, categoryId?, notes?}`            |
| PATCH  | `/api/tasks/{id}`   | Same body as POST                                            |
| DELETE | `/api/tasks/{id}`   |                                                              |

`status` is one of `OPEN`, `DONE`, `ARCHIVED`. Times are ISO-8601 with offset.

## Schema

See `src/main/resources/db/migration/V1__init.sql`. Flyway runs migrations automatically on startup. JPA is set to `ddl-auto: validate` so the migration is the source of truth.

## Adding auth later

Controllers read the current user from `com.zone.common.CurrentUser.ID`. When auth lands, replace this with a request-scoped bean populated by a token-verification filter — controller signatures don't change.
