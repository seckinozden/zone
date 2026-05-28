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
