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
