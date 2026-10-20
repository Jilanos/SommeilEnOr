import csv
import io
import json
import sqlite3
import zipfile

from synthetic import populate

FORBIDDEN_KEYS = (
    "password",
    "token",
    "session",
    "email",
    "garmin",
    "correlation",
    "bedtime",
    "wake_time",
    "sleep_quality",
)


def all_keys(value, found=None):
    found = set() if found is None else found
    if isinstance(value, dict):
        for key, item in value.items():
            found.add(key.lower())
            all_keys(item, found)
    elif isinstance(value, list):
        for item in value:
            all_keys(item, found)
    return found


def read_zip(payload: bytes) -> tuple[dict, dict[str, list[dict]]]:
    archive = zipfile.ZipFile(io.BytesIO(payload))
    manifest = json.loads(archive.read("manifest.json"))
    tables = {
        name: list(csv.DictReader(io.StringIO(archive.read(name).decode())))
        for name in archive.namelist()
        if name.endswith(".csv")
    }
    return manifest, tables


def test_json_and_csv_exports_match_persisted_rows(alice, bob, settings):
    populate(alice, "alice")
    populate(bob, "bob")
    owner = alice.get("/api/auth/me").json()["id"]
    data = alice.get("/api/export.json").json()
    manifest, tables = read_zip(alice.get("/api/export.zip").content)

    assert data["format"] == "sommeilenor-export" and data["schema_version"] == "1.0.0"
    assert data["conventions"]["tracking_day_boundary"] == "04:00"
    assert data["conventions"]["habitual_sleep_window"]["informational_only"] is True
    assert manifest["schema_version"] == data["schema_version"]

    db = sqlite3.connect(settings.database_path)
    db.row_factory = sqlite3.Row
    expected = {
        table: {
            row["id"]: dict(row)
            for row in db.execute(f"SELECT * FROM {table} WHERE owner_id = ?", (owner,))
        }
        for table in ("events", "days", "nights", "favorites", "suggestions")
    }

    # Every persisted entity of the owner is exported exactly once, in JSON and CSV.
    sections = {
        "events": (data["journal"]["events"], "events.csv", "event_id"),
        "days": (data["journal"]["tracking_days"], "tracking_days.csv", "day_id"),
        "nights": (data["journal"]["nights"], "nights.csv", "night_id"),
        "favorites": (data["favorites"], "favorites.csv", "favorite_id"),
        "suggestions": (data["feature_suggestions"], "feature_suggestions.csv", "suggestion_id"),
    }
    for table, (json_rows, csv_name, csv_id) in sections.items():
        assert sorted(r["id"] for r in json_rows) == sorted(expected[table]), table
        assert sorted(r[csv_id] for r in tables[csv_name]) == sorted(expected[table]), table
        assert manifest["files"][csv_name]["rows"] == len(expected[table]), table

    assert len(expected["events"]) == 14
    assert len(expected["nights"]) >= 4

    # Field-level comparison of events (timestamps, offsets, units, night links).
    csv_events = {row["event_id"]: row for row in tables["events.csv"]}
    for event in data["journal"]["events"]:
        row = expected["events"][event["id"]]
        csv_row = csv_events[event["id"]]
        assert event["occurred_at"] == {
            "utc": row["occurred_at_utc"],
            "utc_offset_minutes": row["utc_offset_minutes"],
            "local": row["occurred_at_local"],
        }
        assert csv_row["occurred_at_utc"] == row["occurred_at_utc"]
        assert int(csv_row["occurred_at_utc_offset_minutes"]) == row["utc_offset_minutes"]
        assert csv_row["occurred_at_local"] == row["occurred_at_local"]
        assert event["night_id"] == csv_row["night_id"] == row["night_id"]
        assert csv_row["night_override"] == ("true" if row["night_override"] else "false")
        for key in ("kind", "tracking_date", "drink_type", "activity_type", "intensity"):
            assert event[key] == row[key]
            assert csv_row[key] == (row[key] or "")
        for key in ("volume_ml", "duration_minutes"):
            assert event[key] == row[key]
            assert (float(csv_row[key]) if csv_row[key] else None) == row[key]

    by_local = {e["occurred_at"]["local"]: e for e in data["journal"]["events"]}
    assert by_local["2026-10-20T00:30:00+02:00"]["tracking_date"] == "2026-10-19"
    assert by_local["2026-10-20T03:59:00+02:00"]["night_end_date"] == "2026-10-20"
    assert by_local["2026-10-20T04:00:00+02:00"]["tracking_date"] == "2026-10-20"
    override = by_local["2026-10-20T05:00:00+02:00"]
    assert override["night_override"] is True and override["night_start_date"] == "2026-10-19"
    assert {"2026-10-25T02:30:00+02:00", "2026-10-25T02:30:00+01:00"} <= set(by_local)
    assert by_local["2026-03-29T03:30:00+02:00"]["occurred_at"]["utc"] == "2026-03-29T01:30:00Z"
    favorite_event = by_local["2026-10-20T09:00:00+02:00"]
    assert favorite_event["favorite_id"] == data["favorites"][0]["id"]

    # Missing vs negative answers, dinner quantity, timed sugar and distinct stress periods.
    days = {d["tracking_date"]: d for d in data["journal"]["tracking_days"]}
    csv_days = {d["tracking_date"]: d for d in tables["tracking_days.csv"]}
    assert (
        days["2026-10-19"]["dinner_quantity"] == csv_days["2026-10-19"]["dinner_quantity"] == "big"
    )
    assert days["2026-10-19"]["late_sugar_at"]["local"] == "2026-10-19T22:45:00+02:00"
    assert csv_days["2026-10-19"]["late_sugar_at_local"] == "2026-10-19T22:45:00+02:00"
    assert csv_days["2026-10-19"]["dinner_at_local"] == "2026-10-19T20:00:00+02:00"
    assert (days["2026-10-20"]["late_sugar"], days["2026-10-20"]["late_sugar_at"]) == ("no", None)
    assert csv_days["2026-10-20"]["late_sugar_at_utc"] == ""
    assert (csv_days["2026-10-20"]["alcohol"], csv_days["2026-10-20"]["gluten"]) == (
        "no",
        "unknown",
    )
    assert csv_days["2026-10-20"]["dinner_quantity"] == "unknown"
    assert days["2026-10-19"]["experienced_stress"] == "medium"
    nights = {n["start_date"]: n for n in tables["nights.csv"]}
    assert nights["2026-10-19"]["anticipated_stress"] == "high"
    assert nights["2026-10-19"]["anticipated_stress_for_date"] == "2026-10-20"
    assert days["2026-10-20"]["experienced_stress"] == "absent"
    assert nights["2026-10-19"]["early_wake_target_time"] == "06:00"
    assert nights["2026-10-20"]["early_wake_target_time"] == ""
    assert nights["2026-10-20"]["anticipated_stress"] == "unknown"

    # Suggestions keep multi-line text and stay outside the journal.
    texts = {row["text"] for row in tables["feature_suggestions.csv"]}
    assert "Idée alice\nsur 2 lignes" in texts and 'Export, "CSV"' in texts
    assert "bob" not in json.dumps(data)

    # No credentials, contact data or fabricated sleep/Garmin/correlation fields.
    keys = all_keys(data) | {
        column.lower() for rows in tables.values() for column in (rows[0] if rows else {})
    }
    assert not [key for key in keys if any(word in key for word in FORBIDDEN_KEYS)]
    assert {r["table"] for r in tables["data_dictionary.csv"]} >= {
        "tracking_days",
        "nights",
        "events",
        "favorites",
        "feature_suggestions",
    }


def test_export_headers_present_for_empty_account(alice):
    _, tables = read_zip(alice.get("/api/export.zip").content)
    archive = zipfile.ZipFile(io.BytesIO(alice.get("/api/export.zip").content))
    assert set(archive.namelist()) == {
        "manifest.json",
        "tracking_days.csv",
        "nights.csv",
        "events.csv",
        "favorites.csv",
        "feature_suggestions.csv",
        "data_dictionary.csv",
    }
    assert archive.read("events.csv").decode().startswith("event_id,kind,occurred_at_utc")
    assert tables["events.csv"] == []
