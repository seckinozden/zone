CREATE TABLE settings (
    user_id                 VARCHAR(64) PRIMARY KEY,
    weekly_calorie_budget   INT NOT NULL DEFAULT 14000,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (weekly_calorie_budget > 0)
);
