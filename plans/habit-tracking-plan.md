# Wellness tracking — Habits, Nutrition, Sleep, Exercise

> Adds four new domains to Zone: habits, sleep, exercise, nutrition. Each follows the conventions already established by `events` and `categories`. Implementation is sequential — one PR per domain — so we lock in the pattern early and review between.

---

## Context

Zone today is a calendar app. The user wants to extend it into a daily-wellness companion to help build consistency and momentum, with four new tracking domains:

- **Habits** — daily checks (supplements, eye drops) plus weekly-target habits (German practice, Finance learning). Need daily and 3-month progress views to actually feel the streak. (Week and Month views land later — same component, different range.)
- **Nutrition** — per-meal calorie logging against a **configurable weekly calorie budget** (default 14000). Weekly budgeting gives flexibility to eat heavier on weekends or recover from over-eating.
- **Sleep** — daily score from a Garmin watch plus an optional note. The note is the point: scanning notes against scores should reveal patterns (caffeine after 4pm, late screens, etc.).
- **Exercise** — log workouts by type (running, biking, weights) with calories burned, to pair with nutrition for net-calorie sense.

Decisions captured from the clarification round:

| Question | Choice |
|---|---|
| Nutrition granularity | Per-meal entries with calories |
| Habit cadence | Daily + weekly target |
| Exercise fields | Type + calories burned (duration optional, notes optional) |
| Rollout | **Sequential** — one feature per PR, review between |

---

## Architecture

### Backend — same pattern as `events`/`categories`

For each domain: Flyway migration → JPA entity → Spring Data repo → controller with DTO records. All scoped via `CurrentUser.ID` (still the literal `"local-user"` until real auth lands). Date-range queries follow the `?from=&to=` shape established in `EventController`, but the *types* differ — see the contract below.

JPA stays `ddl-auto: validate`; the migration is the source of truth.

### Frontend — same pattern as `CalendarPage`/`ManageLabelsPage`

For each domain: API types in `client.ts` → TanStack Query hooks in `hooks.ts` → page in `pages/` → modal (where there's a create/edit flow) → route added to `main.tsx` → sidebar link.

Each domain page has a date-range header (the same shape as `CalendarPage.computeWindow`). Existing patterns to reuse:

- **Modal**: `LabelModal.tsx` is the cleanest reference (ESC + backdrop close, form, save/delete).
- **Date-range hook**: `useEvents(range)` shows the React Query key shape, but the params have to be different (see below).
- **Page layout**: `flex flex-col h-full min-h-0` with a sticky header + scrollable body.

### Sidebar

A new **WELLNESS** group appears above the existing LABELS section the moment Phase 1 lands. Each subsequent phase adds its own `NavLink` to the group:

```
WELLNESS
  Sleep       /app/sleep        (Phase 1)
  Exercise    /app/exercise     (Phase 2)
  Nutrition   /app/nutrition    (Phase 3)
  Habits      /app/habits       (Phase 4)
```

No placeholder pages — links land with their real pages.

### Settings → Wellness

A third nav item under `/app/settings/wellness` lands with **Phase 3 (Nutrition)** — it has nothing to configure until the weekly calorie budget exists.

---

## Frontend ↔ backend date contract

> This is a deliberate split from how `events` works, because the new tables index by *calendar day* rather than *instant in time*.

| Backend type | Backend param/body shape | Frontend shape | Used by |
|---|---|---|---|
| `OffsetDateTime` (UTC instant) | ISO-8601 with offset, e.g. `2026-05-28T14:00:00Z` | `date.toISOString()` | `events`, `exercise_entries.performed_at` |
| `LocalDate` (calendar day) | ISO-8601 date, e.g. `2026-05-28` | `format(date, 'yyyy-MM-dd')` from `date-fns` | `sleep_entries.date`, `meals.date`, `habit_completions.date`, range params on `/api/sleep`, `/api/meals`, `/api/habits/completions` |

**Inclusive ranges on date endpoints.** `GET /api/sleep?from=2026-05-25&to=2026-05-31` returns entries with `date >= from AND date <= to` — both bounds included. The frontend computes Mon–Sun habit/nutrition windows with `startOfWeek(d, { weekStartsOn: 1 })` / `endOfWeek(d, { weekStartsOn: 1 })` and formats both as `yyyy-MM-dd`.

The Spring controller methods explicitly type their params as `LocalDate` to use Spring's built-in `DateTimeFormatter.ISO_LOCAL_DATE` binder — no custom config needed.

---

## Migration order

**Numbered by delivery order, not topic.** Phase 1 ships first, so it gets the lowest free number after the existing V1/V2:

| File | Adds | Phase |
|---|---|---|
| `V3__sleep_entries.sql` | `sleep_entries` | Phase 1 (Sleep) |
| `V4__exercise_entries.sql` | `exercise_entries` | Phase 2 (Exercise) |
| `V5__settings.sql` | `settings` | Phase 3 (Nutrition + Settings/Wellness) |
| `V6__meals.sql` | `meals` | Phase 3 |
| `V7__habits.sql` | `habits` + `habit_completions` | Phase 4 (Habits) |

Renumbering protects against Flyway's out-of-order checksum errors if a phase is paused mid-rollout on any dev machine.

---

## Data model

### `V3__sleep_entries.sql` (Phase 1)

```sql
CREATE TABLE sleep_entries (
    id            BIGSERIAL PRIMARY KEY,
    user_id       VARCHAR(64) NOT NULL,
    date          DATE NOT NULL,
    score         INT NOT NULL,
    duration_min  INT,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, date),
    CHECK (score >= 0 AND score <= 100),
    CHECK (duration_min IS NULL OR duration_min > 0)
);
CREATE INDEX idx_sleep_user_date ON sleep_entries (user_id, date);
```

### `V4__exercise_entries.sql` (Phase 2)

```sql
CREATE TABLE exercise_entries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(64) NOT NULL,
    performed_at    TIMESTAMPTZ NOT NULL,
    type            VARCHAR(32) NOT NULL,
    duration_min    INT,
    calories_burned INT NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (calories_burned >= 0),
    CHECK (duration_min IS NULL OR duration_min > 0)
);
CREATE INDEX idx_exercise_user_at ON exercise_entries (user_id, performed_at);
```

`type` is a free string with a recommended enum in the UI (`'running' | 'biking' | 'weights' | 'other'`). Adding "swimming" later is a UI-only change.

### `V5__settings.sql` (Phase 3) — singleton per user

```sql
CREATE TABLE settings (
    user_id                 VARCHAR(64) PRIMARY KEY,
    weekly_calorie_budget   INT NOT NULL DEFAULT 14000,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (weekly_calorie_budget > 0)
);
```

One row per user. `PATCH /api/settings` does insert-on-first-call / update-after.

### `V6__meals.sql` (Phase 3)

```sql
CREATE TABLE meals (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL,
    date        DATE NOT NULL,
    meal_type   VARCHAR(16) NOT NULL,
    description VARCHAR(256) NOT NULL,
    calories    INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    CHECK (calories >= 0)
);
CREATE INDEX idx_meals_user_date ON meals (user_id, date);
```

### `V7__habits.sql` (Phase 4)

```sql
CREATE TABLE habits (
    id            BIGSERIAL PRIMARY KEY,
    user_id       VARCHAR(64) NOT NULL,
    name          VARCHAR(64) NOT NULL,
    color         VARCHAR(16) NOT NULL,
    target_kind   VARCHAR(16) NOT NULL,
    target_count  INT NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (target_kind IN ('daily', 'weekly')),
    CHECK (target_count >= 1),
    -- Daily habits must have target_count = 1; weekly habits may be 1..7.
    CHECK (
      (target_kind = 'daily'  AND target_count = 1) OR
      (target_kind = 'weekly' AND target_count BETWEEN 1 AND 7)
    )
);

CREATE TABLE habit_completions (
    id           BIGSERIAL PRIMARY KEY,
    habit_id     BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (habit_id, date)
);
CREATE INDEX idx_completions_habit_date ON habit_completions (habit_id, date);
```

**Why no `user_id` on `habit_completions`** — every completion is reachable through its parent habit, which carries the `user_id`. Storing it on both sides creates a denormalization the schema can't enforce (rows where `habit_completions.user_id ≠ habits.user_id` would be silently wrong). Controllers always resolve completions by `habit_id` *and* `habits.user_id = CurrentUser.ID`. For per-user range queries the controller joins through `habits` — fine at our scale.

- A daily habit (`target_kind='daily'`, `target_count=1`) is "done today" if a completion row exists for today.
- A weekly habit (e.g. `'weekly'`, `count=3`) is "done this week" when there are ≥ count completion rows in the Mon–Sun window.
- Hard-delete only — `ON DELETE CASCADE` removes completions. No `archived_at`, no `sort_order` until reorder is needed. Initial order: `ORDER BY created_at`.

**No auto-seeding.** First-time visitor sees an empty-state with four suggestion chips ("Supplements", "Eye drops", "German practice", "Finance learning") that pre-fill the habit modal when clicked.

### Note on `updated_at`

Dropped from the new tables. The existing `events`/`categories` tables have `updated_at` columns that `@Column(insertable=false, updatable=false)` keeps frozen at insert time — they're not actually maintained, which is misleading. Rather than carry the misleading column forward, the new tables expose only `created_at`. If we later want true change tracking, we'll add either `@PreUpdate` hooks consistently across all entities or DB triggers — that's a separate slice.

---

## API contracts

| Method | Path | Notes |
|---|---|---|
| GET | `/api/settings` | Returns the settings row; creates with defaults on first read. |
| PATCH | `/api/settings` | Body: `{ weeklyCalorieBudget }`. |
| GET | `/api/sleep?from=YYYY-MM-DD&to=YYYY-MM-DD` | Inclusive range, `date desc`. |
| POST | `/api/sleep` | `{ date: 'YYYY-MM-DD', score, durationMin?, notes? }`. UNIQUE constraint enforced; controller catches `DataIntegrityViolationException` from a duplicate-date insert and returns **409 Conflict** instead of 500. |
| PATCH | `/api/sleep/{id}` | Same body shape as POST. |
| DELETE | `/api/sleep/{id}` | |
| GET | `/api/exercise?from=&to=` | Range params are full ISO instants (`OffsetDateTime`) since `performed_at` is `TIMESTAMPTZ`. |
| POST | `/api/exercise` | `{ performedAt: '...Z', type, durationMin?, caloriesBurned, notes? }` |
| PATCH | `/api/exercise/{id}` | |
| DELETE | `/api/exercise/{id}` | |
| GET | `/api/meals?from=YYYY-MM-DD&to=YYYY-MM-DD` | Inclusive range, `LocalDate`. Flat list; UI groups by date + meal type. |
| POST | `/api/meals` | `{ date: 'YYYY-MM-DD', mealType, description, calories }` |
| PATCH | `/api/meals/{id}` | |
| DELETE | `/api/meals/{id}` | |
| GET | `/api/habits` | All habits for the current user. |
| POST | `/api/habits` | `{ name, color, targetKind, targetCount }` |
| PATCH | `/api/habits/{id}` | |
| DELETE | `/api/habits/{id}` | Cascades to completions. |
| GET | `/api/habits/completions?from=YYYY-MM-DD&to=YYYY-MM-DD` | Inclusive range. Joins through `habits` to scope by `user_id = CurrentUser.ID`. |
| PUT | `/api/habits/{id}/completions/{date}` | Idempotent — mark habit done on that day. 404 if the habit isn't owned by the current user. |
| DELETE | `/api/habits/{id}/completions/{date}` | Mark undone. Idempotent. |

DTO records inside controllers, same convention as `EventController`. Range params bind via Spring's default formatters: `OffsetDateTime` for ISO instants, `LocalDate` for ISO dates.

---

## UX sketches

### Sleep (`/app/sleep`)

- **Header**: "Sleep" + month nav.
- **Sparkline**: 30 vertical bars, one per day, height = score, color band (≥80 green / 60–79 amber / <60 red).
- **Body**: vertical list, newest first. Each entry: date + day-of-week, score badge, optional duration, notes paragraph, edit pencil.
- **Add Entry** button → `SleepModal` (score, duration, notes; date defaults to today).

### Exercise (`/app/exercise`)

- **Header**: "Exercise" + month nav.
- **Stat row**: total workouts this week, total calories burned this week.
- **Body**: list grouped by date. Each row: type icon + label + duration + calories.
- **Add Workout** → `ExerciseModal` (type radio: running / biking / weights / other; duration; calories; notes).

### Nutrition (`/app/nutrition`)

- **Header**: "Nutrition" + **day** nav (prev / today / next).
- **Weekly budget bar** above the day detail: horizontal bar with `consumedThisWeek / weeklyBudget`. Subtitle: `"X kcal used · Y left · Z avg/day"`. Color band by burn rate.
- **Day detail**: four sections (Breakfast, Lunch, Dinner, Snack), each with its meal rows + an "Add" button. Empty sections render the add button only.
- **Settings → Wellness** has the editable weekly budget input.

(Single-day-detail only for v1 — no separate "week strip" view. The weekly bar already conveys the week.)

### Habits (`/app/habits`)

Ships with two views; Week and Month are trivial follow-ups using the same grid.

- **Header**: "Habits" + view tabs **Day | 3 Months**.
- **Day view** (default):
  - Today's date as a big heading.
  - List of habits, each with a circular checkbox + name + color dot.
  - Weekly habits also show "this week: 2/3" beside the day check.
  - "Manage habits" pencil opens `HabitModal` for create/edit.
- **3-month view**:
  - One row per habit: GitHub-style 12-weeks × 7-days grid. Filled squares = completed.
  - Percentage summary per row (e.g. "84%").

All views read from `/api/habits/completions?from=&to=` with the right window. Computation is purely frontend.

---

## Implementation phases

Each phase = one feature branch + PR. Review and merge before starting the next.

### Phase 1 — Sleep
- `V3__sleep_entries.sql`.
- Backend: `SleepEntry` entity, repo, `SleepController` (GET range / POST / PATCH / DELETE). Catch duplicate-date on POST → return 409.
- Frontend: `api/client.ts` types + `useSleep`, `useCreateSleepEntry`, etc. Range params as `yyyy-MM-dd` strings.
- `SleepPage` with sparkline + list + month nav.
- `SleepModal` (score, duration, notes).
- Sidebar: new **WELLNESS** group with the Sleep link.
- Unit tests: vitest for `SleepModal` (ESC, backdrop, save, edit-mode prefill); pure tests for the sparkline color-band logic.

### Phase 2 — Exercise
- `V4__exercise_entries.sql`.
- `ExercisePage`, `ExerciseModal`.
- Weekly stat row at top of the page.
- Sidebar: add Exercise to WELLNESS.
- Unit tests: `ExerciseModal`; pure tests for the weekly-aggregation math.

### Phase 3 — Nutrition + Settings/Wellness
- `V5__settings.sql`, `V6__meals.sql`.
- Backend: `SettingsController` (GET/PATCH), `Meal` entity + controller.
- Frontend: `useSettings()` hook; `MealModal`; `NutritionPage` with weekly bar + single-day detail.
- Settings layout gets a third nav item: **Wellness** → weekly budget editor.
- Sidebar: add Nutrition to WELLNESS.
- Unit tests: `MealModal`; pure tests for the weekly-budget computation (sum kcal across Mon–Sun and compare to budget).

### Phase 4 — Habits
- `V7__habits.sql`.
- Backend: `HabitController` (CRUD) + completion endpoints (`PUT`/`DELETE` keyed by `(habitId, date)`). Completion queries join through `habits` so the user scope is enforced server-side.
- Frontend: `HabitsPage` with view tabs (Day, 3 Months); `HabitModal` (name, color, target_kind, target_count); reusable `<HabitGrid period>` component for the 3-month view.
- Empty-state with four suggestion chips on first visit.
- Sidebar: add Habits to WELLNESS.
- Unit tests: `HabitModal`; pure tests for "is this habit done in this period?" (daily and weekly variants).

---

## Verification recipe (run after each phase)

```bash
just up                                           # db + backend + web
curl -sS http://localhost:8080/actuator/health    # expect {"status":"UP"}
cd web && pnpm test                               # expect green
```

Then in the preview / browser:
1. Hard-reload `localhost:5173`, sign in `admin`/`admin`.
2. Click the new sidebar entry under WELLNESS.
3. Walk through CRUD: create an entry, see it appear, edit it, delete it. Confirm the API responses look right (devtools Network tab — dates should be plain `yyyy-MM-dd`, not full timestamps, for sleep/meals/habit-completions).
4. Per-phase smoke checks:
   - **Sleep**: add an entry for today, score 78, note "good morning"; reload; entry persists; sparkline shows the bar. Then POST the same date again via curl — expect `409 Conflict`.
   - **Exercise**: add running, 30 min, 320 kcal; weekly stat row updates.
   - **Nutrition**: set weekly budget to 16000 in Settings → Wellness; add breakfast 600 kcal, lunch 900 kcal; the weekly bar shows 1500 / 16000. Verify it sums Mon–Sun by adding a meal on Sunday and one on Monday from different weeks.
   - **Habits**: tick "Supplements" (a daily habit); switch to 3-month view; today's cell is filled. Toggle off; it clears. Create a weekly habit with `count=3`, complete 2 days, verify the day-view shows "this week: 2/3".

---

## Reused conventions / files

- `backend/src/main/java/com/zone/common/CurrentUser.java` — every controller scopes via `CurrentUser.ID`.
- `backend/src/main/resources/db/migration/V1__init.sql` — migration style reference.
- `backend/src/main/java/com/zone/event/EventController.java` — controller + DTO style reference for `OffsetDateTime` range filtering.
- `web/src/api/client.ts` + `web/src/api/hooks.ts` — extend with new types and hooks.
- `web/src/components/LabelModal.tsx` — cleanest modal reference.
- `web/src/pages/CalendarPage.tsx` — `computeWindow(anchor, view)` is the model for the date-range header.
- `web/src/components/Sidebar.tsx` — add WELLNESS group above LABELS.
- `web/src/pages/settings/SettingsLayout.tsx` — add a third nav item (in Phase 3).
- `web/src/main.tsx` — add new routes.

---

## Explicit non-goals

- **Auth still hardcoded.** Same `CurrentUser.ID = "local-user"` constant applies to all new tables.
- **No charts library.** Sparkline and habit grids are pure CSS. Revisit if complexity grows (Recharts, Visx).
- **No backend tests yet.** Consistent with current repo state; backend test infra is a separate slice.
- **No mobile responsive pass** — desktop layouts only for now.
- **Habit reordering** — out of scope. Add `sort_order` when drag-reorder lands.
- **Week and Month habit views** — out of scope for Phase 4; same `<HabitGrid>` component, different window, ship later.
- **No nutrition–events linkage** — meals don't appear on the calendar, even though they could.
- **`updated_at` retrofitting** — not fixing the existing `events`/`categories` tables in this slice. New tables expose only `created_at`.

---

## Rollout

Once approved, execute Phase 1 to completion, ask for browser verification, then proceed to Phase 2 after sign-off. Sequential — no parallel work.
