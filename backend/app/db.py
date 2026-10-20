"""SQLite persistence. Every journal table carries an owner_id; queries filter on it."""

import sqlite3
from collections.abc import Iterator
from pathlib import Path

SCHEMA_VERSION = 1

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nights (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    cat_presence TEXT NOT NULL DEFAULT 'unknown',
    anticipated_stress TEXT NOT NULL DEFAULT 'unknown',
    early_wake_planned TEXT NOT NULL DEFAULT 'unknown',
    early_wake_target_time TEXT,
    early_wake_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (owner_id, start_date)
);

CREATE TABLE IF NOT EXISTS days (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracking_date TEXT NOT NULL,
    alcohol TEXT NOT NULL DEFAULT 'unknown',
    gluten TEXT NOT NULL DEFAULT 'unknown',
    experienced_stress TEXT NOT NULL DEFAULT 'unknown',
    evening_noncaffeinated_drink TEXT NOT NULL DEFAULT 'unknown',
    late_sugar TEXT NOT NULL DEFAULT 'unknown',
    late_sugar_at_utc TEXT,
    late_sugar_utc_offset_minutes INTEGER,
    late_sugar_local TEXT,
    dinner_at_utc TEXT,
    dinner_utc_offset_minutes INTEGER,
    dinner_local TEXT,
    dinner_quantity TEXT NOT NULL DEFAULT 'unknown',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (owner_id, tracking_date)
);

CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    drink_type TEXT NOT NULL,
    volume_ml REAL NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('drink', 'activity', 'nap')),
    occurred_at_utc TEXT NOT NULL,
    utc_offset_minutes INTEGER NOT NULL,
    occurred_at_local TEXT NOT NULL,
    tracking_date TEXT NOT NULL,
    night_id TEXT NOT NULL REFERENCES nights(id),
    night_override INTEGER NOT NULL DEFAULT 0,
    drink_type TEXT,
    volume_ml REAL,
    activity_type TEXT,
    intensity TEXT,
    duration_minutes INTEGER,
    favorite_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_owner_day ON events (owner_id, tracking_date);
CREATE INDEX IF NOT EXISTS events_owner_night ON events (owner_id, night_id);

CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_context TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


def connect(path: Path) -> sqlite3.Connection:
    if str(path) != ":memory:":
        path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 5000")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def init_db(path: Path) -> None:
    conn = connect(path)
    try:
        conn.executescript(SCHEMA)
        conn.execute(f"PRAGMA user_version = {SCHEMA_VERSION}")
    finally:
        conn.close()


def connection_scope(path: Path) -> Iterator[sqlite3.Connection]:
    conn = connect(path)
    try:
        yield conn
    finally:
        conn.close()


class transaction:
    """BEGIN IMMEDIATE ... COMMIT/ROLLBACK on an autocommit connection."""

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def __enter__(self) -> sqlite3.Connection:
        self.conn.execute("BEGIN IMMEDIATE")
        return self.conn

    def __exit__(self, exc_type, exc, tb) -> None:
        self.conn.execute("ROLLBACK" if exc_type else "COMMIT")
