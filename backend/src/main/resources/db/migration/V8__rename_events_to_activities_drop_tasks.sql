-- Unify the entity name across UI, API, and DB: the calendar time-block entity
-- Event becomes Activity. The separate, never-adopted `tasks` to-do table
-- (due_date + status) is dropped — it had no UI and is superseded by activities.

ALTER TABLE events RENAME TO activities;
ALTER INDEX idx_events_user_start RENAME TO idx_activities_user_start;

DROP TABLE tasks;
