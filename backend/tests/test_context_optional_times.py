"""Persistence and export of optional context times without an HTTP transport."""

import csv
import io
import zipfile
from datetime import date

import pytest

from app import db, journal, schemas
from app.export import build_csv_zip, build_export

DAY = date(2026, 11, 9)


@pytest.fixture
def context_db(tmp_path):
    path = tmp_path / "synthetic.sqlite3"
    db.init_db(path)
    conn = db.connect(path)
    for owner in ("alice", "bob"):
        conn.execute(
            "INSERT INTO users VALUES (?, ?, ?, ?)",
            (owner, f"{owner}@example.com", "unused-test-hash", "2026-11-09T00:00:00Z"),
        )
    yield conn
    conn.close()


def test_yes_without_times_survives_reload_and_json_csv_export(context_db):
    conn = context_db
    journal.patch_day(conn, "alice", DAY, schemas.DayPatch(late_sugar="yes"))
    journal.patch_night(conn, "alice", DAY, schemas.NightPatch(early_wake_planned="yes"))
    day = journal.get_day(conn, "alice", DAY)
    night = journal.get_night(conn, "alice", DAY)
    assert day["late_sugar"] == "yes" and day["late_sugar_at"] is None
    assert night["early_wake_planned"] == "yes"
    assert night["early_wake_target_time"] is None
    assert journal.get_day(conn, "bob", DAY)["late_sugar"] == "unknown"
    assert journal.get_night(conn, "bob", DAY)["early_wake_planned"] == "unknown"
    export = build_export(conn, "alice")
    assert export["journal"]["tracking_days"][0]["late_sugar_at"] is None
    assert export["journal"]["nights"][0]["early_wake_target_time"] is None
    with zipfile.ZipFile(io.BytesIO(build_csv_zip(export))) as archive:
        day_csv = next(csv.DictReader(io.StringIO(archive.read("tracking_days.csv").decode())))
        night_csv = next(csv.DictReader(io.StringIO(archive.read("nights.csv").decode())))
        assert day_csv["late_sugar"] == "yes" and day_csv["late_sugar_at_utc"] == ""
        assert night_csv["early_wake_planned"] == "yes"
        assert night_csv["early_wake_target_time"] == ""


@pytest.mark.parametrize("clear", ["no", "unknown"])
def test_clearing_answers_removes_optional_time_and_reason(context_db, clear):
    conn = context_db
    journal.patch_day(
        conn,
        "alice",
        DAY,
        schemas.DayPatch(
            late_sugar="yes", late_sugar_at=schemas.MomentInput(at="2026-11-09T22:30")
        ),
    )
    journal.patch_night(
        conn,
        "alice",
        DAY,
        schemas.NightPatch(
            early_wake_planned="yes", early_wake_target_time="06:30", early_wake_reason="Train"
        ),
    )
    day = journal.patch_day(conn, "alice", DAY, schemas.DayPatch(late_sugar=clear))
    night = journal.patch_night(conn, "alice", DAY, schemas.NightPatch(early_wake_planned=clear))
    assert day["late_sugar"] == clear and day["late_sugar_at"] is None
    assert night["early_wake_planned"] == clear
    assert night["early_wake_target_time"] is None and night["early_wake_reason"] is None


def test_times_can_be_added_then_cleared_without_losing_yes(context_db):
    conn = context_db
    journal.patch_day(conn, "alice", DAY, schemas.DayPatch(late_sugar="yes"))
    journal.patch_night(conn, "alice", DAY, schemas.NightPatch(early_wake_planned="yes"))
    day = journal.patch_day(
        conn,
        "alice",
        DAY,
        schemas.DayPatch(late_sugar_at=schemas.MomentInput(at="2026-11-09T22:30")),
    )
    night = journal.patch_night(
        conn, "alice", DAY, schemas.NightPatch(early_wake_target_time="06:30")
    )
    assert day["late_sugar_at"]["local"].startswith("2026-11-09T22:30")
    assert night["early_wake_target_time"] == "06:30"
    day = journal.patch_day(conn, "alice", DAY, schemas.DayPatch(late_sugar_at=None))
    night = journal.patch_night(conn, "alice", DAY, schemas.NightPatch(early_wake_target_time=None))
    assert day["late_sugar"] == "yes" and day["late_sugar_at"] is None
    assert night["early_wake_planned"] == "yes" and night["early_wake_target_time"] is None
