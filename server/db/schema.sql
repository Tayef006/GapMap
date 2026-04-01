PRAGMA foreign_keys = ON;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TASKS
-- =========================
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    estimated_duration INTEGER NOT NULL
        CHECK (estimated_duration > 0 AND estimated_duration <= 480), -- minutes
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    energy_level TEXT NOT NULL DEFAULT 'medium'
        CHECK (energy_level IN ('low', 'medium', 'high')),
    deadline TEXT, -- ISO date/time string, e.g. 2026-03-30 or 2026-03-30T14:00
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- TIMETABLE ENTRIES
-- =========================
CREATE TABLE IF NOT EXISTS timetable_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    day_of_week TEXT NOT NULL
        CHECK (day_of_week IN (
            'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday', 'Sunday'
        )),
    start_time TEXT NOT NULL, -- HH:MM
    end_time TEXT NOT NULL,   -- HH:MM
    location TEXT,
    entry_type TEXT NOT NULL DEFAULT 'class'
        CHECK (entry_type IN ('class', 'lab', 'lecture', 'seminar', 'study', 'work', 'other')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (start_time < end_time),

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- RECOMMENDATION FEEDBACK
-- Stores whether a suggested task was useful
-- =========================
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    day_of_week TEXT NOT NULL
        CHECK (day_of_week IN (
            'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday', 'Sunday'
        )),
    gap_start_time TEXT NOT NULL, -- HH:MM
    gap_end_time TEXT NOT NULL,   -- HH:MM
    suggested_duration INTEGER NOT NULL
        CHECK (suggested_duration > 0),
    was_helpful INTEGER NOT NULL
        CHECK (was_helpful IN (0, 1)),
    action_taken TEXT NOT NULL DEFAULT 'ignored'
        CHECK (action_taken IN ('accepted', 'completed', 'dismissed', 'ignored')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (gap_start_time < gap_end_time),

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id
ON tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_deadline
ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_timetable_user_day
ON timetable_entries(user_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_timetable_day_time
ON timetable_entries(day_of_week, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id
ON feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_task_id
ON feedback(task_id);
