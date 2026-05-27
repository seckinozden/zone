CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL,
    name        VARCHAR(64) NOT NULL,
    color       VARCHAR(16) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

CREATE TABLE events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL,
    title       VARCHAR(256) NOT NULL,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time >= start_time)
);

CREATE INDEX idx_events_user_start ON events (user_id, start_time);

CREATE TABLE tasks (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL,
    title       VARCHAR(256) NOT NULL,
    due_date    DATE,
    status      VARCHAR(16) NOT NULL DEFAULT 'OPEN',
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (status IN ('OPEN', 'DONE', 'ARCHIVED'))
);

CREATE INDEX idx_tasks_user_due ON tasks (user_id, due_date);

INSERT INTO categories (user_id, name, color) VALUES
    ('local-user', 'Work', '#7c5cff'),
    ('local-user', 'Personal', '#ff6b6b'),
    ('local-user', 'Family', '#f59e0b');
