"""Runtime settings read from environment variables (see .env.example)."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    database_path: Path
    static_dir: Path | None
    secure_cookies: bool
    session_days: int
    registration_open: bool = True


def load_settings() -> Settings:
    static = os.environ.get("SOMMEILENOR_STATIC_DIR")
    return Settings(
        database_path=Path(os.environ.get("SOMMEILENOR_DB_PATH", "data/sommeilenor.sqlite3")),
        static_dir=Path(static) if static else None,
        secure_cookies=os.environ.get("SOMMEILENOR_SECURE_COOKIES", "true").lower() != "false",
        session_days=int(os.environ.get("SOMMEILENOR_SESSION_DAYS", "90")),
        registration_open=os.environ.get("SOMMEILENOR_REGISTRATION", "open").lower() != "closed",
    )
