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
