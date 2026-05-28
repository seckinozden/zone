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
