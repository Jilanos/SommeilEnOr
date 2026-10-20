"""Consistent SQLite backup and restore.

    python -m app.backup create /backups/sommeilenor-YYYYMMDD.sqlite3
    python -m app.backup restore /backups/sommeilenor-YYYYMMDD.sqlite3   # app stopped

``create`` uses the SQLite online backup API, so it is safe while the app runs.
``restore`` checks the file's integrity and schema before replacing the database.
"""

import argparse
import sqlite3
import sys
from pathlib import Path

from .config import load_settings
from .db import SCHEMA_VERSION, connect, init_db


def create_backup(database: Path, destination: Path) -> None:
    if destination.exists():
        raise SystemExit(f"refusing to overwrite {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    source = connect(database)
    target = sqlite3.connect(destination)
    try:
        source.backup(target)
    finally:
        target.close()
        source.close()


def check_backup(path: Path) -> None:
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        if conn.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise SystemExit("integrity check failed")
        version = conn.execute("PRAGMA user_version").fetchone()[0]
        if version != SCHEMA_VERSION:
            raise SystemExit(f"unsupported schema version {version}")
    finally:
        conn.close()


def restore_backup(source: Path, database: Path) -> None:
    check_backup(source)
    for suffix in ("-wal", "-shm"):
        Path(f"{database}{suffix}").unlink(missing_ok=True)
    database.parent.mkdir(parents=True, exist_ok=True)
    origin = sqlite3.connect(f"file:{source}?mode=ro", uri=True)
    target = sqlite3.connect(database)
    try:
        origin.backup(target)
    finally:
        target.close()
        origin.close()
    init_db(database)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.backup")
    parser.add_argument("action", choices=["create", "restore"])
    parser.add_argument("path", type=Path)
    args = parser.parse_args(argv)
    database = load_settings().database_path
    if args.action == "create":
        create_backup(database, args.path)
    else:
        restore_backup(args.path, database)
    print(f"{args.action}: {args.path} <-> {database}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
