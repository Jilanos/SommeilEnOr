"""All-history export: versioned JSON and a normalized CSV bundle (zip).

Journal records (tracking days, nights, events) are separate from favorites and
private feature suggestions. No sleep interval, Garmin or correlation field is
produced: future Garmin matching joins on the nominal night dates and the stored
UTC offsets.
"""

import csv
import io
import json
import sqlite3
import zipfile

from . import journal
from .temporal import DAY_BOUNDARY, HABITUAL_SLEEP_WINDOW, TIMEZONE_NAME

EXPORT_FORMAT = "sommeilenor-export"
EXPORT_SCHEMA_VERSION = "1.0.0"

DATA_DICTIONARY: list[dict[str, str]] = [
    {
        "table": "*",
        "field": "unknown",
        "unit": "",
        "description": "Value 'unknown' means not answered; it is never an explicit no/absent.",
    },
    {
        "table": "*",
        "field": "*_utc",
        "unit": "ISO 8601 UTC",
        "description": "Actual instant in UTC.",
    },
    {
        "table": "*",
        "field": "*_utc_offset_minutes",
        "unit": "minutes",
        "description": "Europe/Paris UTC offset in force at that instant (60 or 120).",
    },
    {
        "table": "*",
        "field": "*_local",
        "unit": "ISO 8601 with offset",
        "description": "Actual Europe/Paris wall-clock time; never rewritten.",
    },
    {
        "table": "tracking_days",
        "field": "tracking_date",
        "unit": "date",
        "description": "Tracking day starting at 04:00 Europe/Paris.",
    },
    {
        "table": "tracking_days",
        "field": "alcohol",
        "unit": "yes|no|unknown",
        "description": "Daily alcohol, independent of dinner; no quantity.",
    },
    {
        "table": "tracking_days",
        "field": "gluten",
        "unit": "yes|no|unknown",
        "description": "Daily gluten, independent of dinner.",
    },
    {
        "table": "tracking_days",
        "field": "experienced_stress",
        "unit": "absent|medium|high|unknown",
        "description": "Stress experienced on the tracking day (assessed date: tracking_date).",
    },
    {
        "table": "tracking_days",
        "field": "evening_noncaffeinated_drink",
        "unit": "yes|no|unknown",
        "description": "Evening non-caffeinated drink context flag; not a drink event.",
    },
    {
        "table": "tracking_days",
        "field": "late_sugar",
        "unit": "yes|no|unknown",
        "description": "Manual late sugar answer; no automatic lateness threshold.",
    },
    {
        "table": "tracking_days",
        "field": "late_sugar_at_*",
        "unit": "",
        "description": (
            "Optional stated sugar intake time when late_sugar = yes; null when not supplied."
        ),
    },
    {
        "table": "tracking_days",
        "field": "dinner_at_*",
        "unit": "",
        "description": "Dinner time (empty when not answered).",
    },
    {
        "table": "tracking_days",
        "field": "dinner_quantity",
        "unit": "small|medium|big|massive|unknown",
        "description": "Dinner portion size.",
    },
    {
        "table": "nights",
        "field": "night_id",
        "unit": "uuid",
        "description": "Stable nominal night identifier; implies no measured bedtime or wake time.",
    },
    {
        "table": "nights",
        "field": "start_date",
        "unit": "date",
        "description": "Nominal evening date (the tracking day the night follows).",
    },
    {
        "table": "nights",
        "field": "end_date",
        "unit": "date",
        "description": "Nominal morning date; join key for future external sleep data.",
    },
    {
        "table": "nights",
        "field": "cat_presence",
        "unit": "yes|no|unknown",
        "description": "Cat present in the bedroom; no awakening metric.",
    },
    {
        "table": "nights",
        "field": "anticipated_stress",
        "unit": "absent|medium|high|unknown",
        "description": "Stress anticipated, during start_date, for anticipated_stress_for_date. "
        "Never overwritten by the later experienced stress.",
    },
    {
        "table": "nights",
        "field": "early_wake_planned",
        "unit": "yes|no|unknown",
        "description": "Planned early-wake constraint (not an actual wake time).",
    },
    {
        "table": "nights",
        "field": "early_wake_target_time",
        "unit": "HH:MM Europe/Paris",
        "description": "Optional planned wake target on end_date; null when not supplied.",
    },
    {
        "table": "events",
        "field": "kind",
        "unit": "drink|activity|nap",
        "description": "Repeated timed event; each row is one independent entry.",
    },
    {
        "table": "events",
        "field": "tracking_date",
        "unit": "date",
        "description": "Default tracking day computed from the actual time (04:00 rule).",
    },
    {
        "table": "events",
        "field": "night_id",
        "unit": "uuid",
        "description": "Linked nominal night; default = night following tracking_date.",
    },
    {
        "table": "events",
        "field": "night_override",
        "unit": "boolean",
        "description": "True when the night link was set manually.",
    },
    {
        "table": "events",
        "field": "drink_type",
        "unit": "green_tea|black_tea|mate|infusion",
        "description": "Drink category (drink events only).",
    },
    {"table": "events", "field": "volume_ml", "unit": "ml", "description": "Positive volume."},
    {
        "table": "events",
        "field": "activity_type",
        "unit": "walking|running|cycling|strength|other",
        "description": "Single activity type of the session.",
    },
    {
        "table": "events",
        "field": "intensity",
        "unit": "low|medium|high",
        "description": "Activity intensity.",
    },
    {
        "table": "events",
        "field": "duration_minutes",
        "unit": "minutes",
        "description": "Positive duration of an activity or nap, from occurred_at.",
    },
    {
        "table": "events",
        "field": "favorite_id",
        "unit": "uuid",
        "description": "Favorite used to prefill the entry, if any; the entry is independent.",
    },
    {
        "table": "favorites",
        "field": "*",
        "unit": "",
        "description": "Reusable drink presets; not journal events.",
    },
    {
        "table": "feature_suggestions",
        "field": "*",
        "unit": "",
        "description": "Private app feature suggestions; not journal data, never published.",
    },
]

DAY_COLUMNS = [
    "day_id",
    "tracking_date",
    "alcohol",
    "gluten",
    "experienced_stress",
    "evening_noncaffeinated_drink",
    "late_sugar",
    "late_sugar_at_utc",
    "late_sugar_at_utc_offset_minutes",
    "late_sugar_at_local",
    "dinner_at_utc",
    "dinner_at_utc_offset_minutes",
    "dinner_at_local",
    "dinner_quantity",
    "created_at",
    "updated_at",
]
NIGHT_COLUMNS = [
    "night_id",
    "start_date",
    "end_date",
    "cat_presence",
    "anticipated_stress",
    "anticipated_stress_for_date",
    "early_wake_planned",
    "early_wake_target_time",
    "early_wake_reason",
    "created_at",
    "updated_at",
]
EVENT_COLUMNS = [
    "event_id",
    "kind",
    "occurred_at_utc",
    "occurred_at_utc_offset_minutes",
    "occurred_at_local",
    "tracking_date",
    "night_id",
    "night_start_date",
    "night_end_date",
    "night_override",
    "drink_type",
    "volume_ml",
    "activity_type",
    "intensity",
    "duration_minutes",
    "favorite_id",
    "created_at",
    "updated_at",
]
FAVORITE_COLUMNS = ["favorite_id", "label", "drink_type", "volume_ml", "created_at", "updated_at"]
SUGGESTION_COLUMNS = ["suggestion_id", "action_context", "text", "created_at"]


def _flatten_moment(prefix: str, value: dict | None) -> dict:
    value = value or {}
    return {
        f"{prefix}_utc": value.get("utc"),
        f"{prefix}_utc_offset_minutes": value.get("utc_offset_minutes"),
        f"{prefix}_local": value.get("local"),
    }


def build_export(conn: sqlite3.Connection, owner: str) -> dict:
    user = conn.execute("SELECT id, created_at FROM users WHERE id = ?", (owner,)).fetchone()
    days = [
        journal.day_dict(row, None)
        for row in conn.execute(
            "SELECT * FROM days WHERE owner_id = ? ORDER BY tracking_date", (owner,)
        )
    ]
    nights = [
        journal.night_dict(row, None)
        for row in conn.execute(
            "SELECT * FROM nights WHERE owner_id = ? ORDER BY start_date", (owner,)
        )
    ]
    return {
        "format": EXPORT_FORMAT,
        "schema_version": EXPORT_SCHEMA_VERSION,
        "exported_at": journal.now_iso(),
        "account": {"id": user["id"], "created_at": user["created_at"]},
        "conventions": {
            "timezone": TIMEZONE_NAME,
            "tracking_day_boundary": DAY_BOUNDARY.strftime("%H:%M"),
            "habitual_sleep_window": {
                "start": HABITUAL_SLEEP_WINDOW[0],
                "end": HABITUAL_SLEEP_WINDOW[1],
                "informational_only": True,
            },
            "unknown_means": "not answered",
            "volume_unit": "ml",
            "duration_unit": "minutes",
        },
        "journal": {
            "tracking_days": days,
            "nights": nights,
            "events": journal.list_events(conn, owner),
        },
        "favorites": journal.list_favorites(conn, owner),
        "feature_suggestions": list(reversed(journal.list_suggestions(conn, owner))),
        "data_dictionary": DATA_DICTIONARY,
    }


def _csv(columns: list[str], rows: list[dict]) -> str:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=columns, lineterminator="\n")
    writer.writeheader()
    for row in rows:
        writer.writerow({key: "" if row.get(key) is None else row[key] for key in columns})
    return buffer.getvalue()


def csv_rows(data: dict) -> dict[str, tuple[list[str], list[dict]]]:
    days = [
        {
            "day_id": day["id"],
            **{key: day[key] for key in DAY_COLUMNS if key in day},
            **_flatten_moment("late_sugar_at", day["late_sugar_at"]),
            **_flatten_moment("dinner_at", day["dinner_at"]),
        }
        for day in data["journal"]["tracking_days"]
    ]
    nights = [{"night_id": night["id"], **night} for night in data["journal"]["nights"]]
    events = [
        {
            "event_id": event["id"],
            **event,
            **_flatten_moment("occurred_at", event["occurred_at"]),
            "night_override": "true" if event["night_override"] else "false",
        }
        for event in data["journal"]["events"]
    ]
    favorites = [{"favorite_id": fav["id"], **fav} for fav in data["favorites"]]
    suggestions = [{"suggestion_id": s["id"], **s} for s in data["feature_suggestions"]]
    return {
        "tracking_days.csv": (DAY_COLUMNS, days),
        "nights.csv": (NIGHT_COLUMNS, nights),
        "events.csv": (EVENT_COLUMNS, events),
        "favorites.csv": (FAVORITE_COLUMNS, favorites),
        "feature_suggestions.csv": (SUGGESTION_COLUMNS, suggestions),
        "data_dictionary.csv": (["table", "field", "unit", "description"], DATA_DICTIONARY),
    }


def build_csv_zip(data: dict) -> bytes:
    tables = csv_rows(data)
    manifest = {
        "format": EXPORT_FORMAT,
        "schema_version": EXPORT_SCHEMA_VERSION,
        "exported_at": data["exported_at"],
        "account": data["account"],
        "conventions": data["conventions"],
        "files": {name: {"rows": len(rows)} for name, (_, rows) in tables.items()},
    }
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        for name, (columns, rows) in tables.items():
            archive.writestr(name, _csv(columns, rows))
    return buffer.getvalue()
