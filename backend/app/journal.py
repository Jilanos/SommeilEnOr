"""Owner-scoped journal operations shared by the API and the export."""

import sqlite3
import uuid
from datetime import UTC, date, datetime, timedelta

from . import schemas
from .temporal import LocalTimeError, Moment, night_dates, resolve_moment


class NotFound(Exception):
    pass


class Invalid(Exception):
    def __init__(self, code: str, message: str, options: list[int] | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.options = options or []


def now_iso() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def new_id() -> str:
    return str(uuid.uuid4())


def moment(value: schemas.MomentInput) -> Moment:
    try:
        return resolve_moment(value.at, value.utc_offset_minutes)
    except LocalTimeError as exc:
        raise Invalid(exc.code, str(exc), exc.options) from exc


def moment_dict(utc: str | None, offset: int | None, local: str | None) -> dict | None:
    if utc is None:
        return None
    return {"utc": utc, "utc_offset_minutes": offset, "local": local}


# --- nights -----------------------------------------------------------------

NIGHT_FIELDS = (
    "cat_presence",
    "anticipated_stress",
    "early_wake_planned",
    "early_wake_target_time",
    "early_wake_reason",
)


def ensure_night(conn: sqlite3.Connection, owner: str, start: date) -> sqlite3.Row:
    row = conn.execute(
        "SELECT * FROM nights WHERE owner_id = ? AND start_date = ?", (owner, start.isoformat())
    ).fetchone()
    if row:
        return row
    _, end = night_dates(start)
    stamp = now_iso()
    conn.execute(
        "INSERT INTO nights (id, owner_id, start_date, end_date, created_at, updated_at)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (new_id(), owner, start.isoformat(), end.isoformat(), stamp, stamp),
    )
    return ensure_night(conn, owner, start)


def night_dict(row: sqlite3.Row | None, start: date | None) -> dict:
    if row is None:
        assert start is not None
        _, end = night_dates(start)
        return {
            "id": None,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "cat_presence": "unknown",
            "anticipated_stress": "unknown",
            "anticipated_stress_for_date": end.isoformat(),
            "early_wake_planned": "unknown",
            "early_wake_target_time": None,
            "early_wake_reason": None,
            "created_at": None,
            "updated_at": None,
        }
    data = {key: row[key] for key in row.keys() if key != "owner_id"}
    data["anticipated_stress_for_date"] = row["end_date"]
    return data


def get_night(conn: sqlite3.Connection, owner: str, start: date) -> dict:
    row = conn.execute(
        "SELECT * FROM nights WHERE owner_id = ? AND start_date = ?", (owner, start.isoformat())
    ).fetchone()
    return night_dict(row, start)


def patch_night(
    conn: sqlite3.Connection, owner: str, start: date, patch: schemas.NightPatch
) -> dict:
    row = ensure_night(conn, owner, start)
    merged = {key: row[key] for key in NIGHT_FIELDS}
    merged.update({key: getattr(patch, key) for key in patch.model_fields_set})
    for key in ("cat_presence", "anticipated_stress", "early_wake_planned"):
        if merged[key] is None:
            merged[key] = "unknown"
    if merged["early_wake_planned"] != "yes":
        merged["early_wake_target_time"] = None
        merged["early_wake_reason"] = None
    elif not merged["early_wake_target_time"]:
        raise Invalid("early_wake_target_required", "Heure de réveil prévue requise.")
    if merged["early_wake_reason"] is not None:
        merged["early_wake_reason"] = merged["early_wake_reason"].strip() or None
    conn.execute(
        "UPDATE nights SET cat_presence = ?, anticipated_stress = ?, early_wake_planned = ?,"
        " early_wake_target_time = ?, early_wake_reason = ?, updated_at = ?"
        " WHERE id = ? AND owner_id = ?",
        (*[merged[key] for key in NIGHT_FIELDS], now_iso(), row["id"], owner),
    )
    return get_night(conn, owner, start)


# --- days -------------------------------------------------------------------

DAY_ENUM_FIELDS = (
    "alcohol",
    "gluten",
    "experienced_stress",
    "evening_noncaffeinated_drink",
    "late_sugar",
    "dinner_quantity",
)


def day_dict(row: sqlite3.Row | None, tracking: date | None) -> dict:
    if row is None:
        assert tracking is not None
        data = {key: "unknown" for key in DAY_ENUM_FIELDS}
        data.update(id=None, tracking_date=tracking.isoformat(), created_at=None, updated_at=None)
        data.update(late_sugar_at=None, dinner_at=None)
        return data
    data = {key: row[key] for key in ("id", "tracking_date", *DAY_ENUM_FIELDS)}
    data["late_sugar_at"] = moment_dict(
        row["late_sugar_at_utc"], row["late_sugar_utc_offset_minutes"], row["late_sugar_local"]
    )
    data["dinner_at"] = moment_dict(
        row["dinner_at_utc"], row["dinner_utc_offset_minutes"], row["dinner_local"]
    )
    data["created_at"] = row["created_at"]
    data["updated_at"] = row["updated_at"]
    return data


def get_day(conn: sqlite3.Connection, owner: str, tracking: date) -> dict:
    row = conn.execute(
        "SELECT * FROM days WHERE owner_id = ? AND tracking_date = ?",
        (owner, tracking.isoformat()),
    ).fetchone()
    return day_dict(row, tracking)


def patch_day(
    conn: sqlite3.Connection, owner: str, tracking: date, patch: schemas.DayPatch
) -> dict:
    row = conn.execute(
        "SELECT * FROM days WHERE owner_id = ? AND tracking_date = ?",
        (owner, tracking.isoformat()),
    ).fetchone()
    stamp = now_iso()
    if row is None:
        conn.execute(
            "INSERT INTO days (id, owner_id, tracking_date, created_at, updated_at)"
            " VALUES (?, ?, ?, ?, ?)",
            (new_id(), owner, tracking.isoformat(), stamp, stamp),
        )
        row = conn.execute(
            "SELECT * FROM days WHERE owner_id = ? AND tracking_date = ?",
            (owner, tracking.isoformat()),
        ).fetchone()
    values = {key: row[key] for key in row.keys()}
    fields = patch.model_fields_set
    for key in DAY_ENUM_FIELDS:
        if key in fields:
            values[key] = getattr(patch, key) or "unknown"

    def set_moment(prefix: str, value: schemas.MomentInput | None) -> None:
        resolved = moment(value) if value is not None else None
        values[f"{prefix}_utc"] = resolved.utc_iso if resolved else None
        values[f"{prefix.removesuffix('_at')}_utc_offset_minutes"] = (
            resolved.offset_minutes if resolved else None
        )
        values[f"{prefix.removesuffix('_at')}_local"] = resolved.local_iso if resolved else None

    if "dinner_at" in fields:
        set_moment("dinner_at", patch.dinner_at)
    if "late_sugar_at" in fields:
        set_moment("late_sugar_at", patch.late_sugar_at)
    # A "no" or "unknown" answer must not leave a misleading intake time behind.
    if values["late_sugar"] != "yes":
        set_moment("late_sugar_at", None)
    elif values["late_sugar_at_utc"] is None:
        raise Invalid("late_sugar_time_required", "Heure de prise de sucre requise.")

    conn.execute(
        "UPDATE days SET alcohol = ?, gluten = ?, experienced_stress = ?,"
        " evening_noncaffeinated_drink = ?, late_sugar = ?, late_sugar_at_utc = ?,"
        " late_sugar_utc_offset_minutes = ?, late_sugar_local = ?, dinner_at_utc = ?,"
        " dinner_utc_offset_minutes = ?, dinner_local = ?, dinner_quantity = ?, updated_at = ?"
        " WHERE id = ? AND owner_id = ?",
        (
            values["alcohol"],
            values["gluten"],
            values["experienced_stress"],
            values["evening_noncaffeinated_drink"],
            values["late_sugar"],
            values["late_sugar_at_utc"],
            values["late_sugar_utc_offset_minutes"],
            values["late_sugar_local"],
            values["dinner_at_utc"],
            values["dinner_utc_offset_minutes"],
            values["dinner_local"],
            values["dinner_quantity"],
            stamp,
            row["id"],
            owner,
        ),
    )
    return get_day(conn, owner, tracking)


# --- events -----------------------------------------------------------------

KIND_FIELDS = {
    "drink": {"drink_type", "volume_ml"},
    "activity": {"activity_type", "intensity", "duration_minutes"},
    "nap": {"duration_minutes"},
}
DETAIL_FIELDS = ("drink_type", "volume_ml", "activity_type", "intensity", "duration_minutes")

EVENT_SELECT = (
    "SELECT e.*, n.start_date AS night_start_date, n.end_date AS night_end_date"
    " FROM events e JOIN nights n ON n.id = e.night_id"
)


def event_dict(row: sqlite3.Row) -> dict:
    data = {
        "id": row["id"],
        "kind": row["kind"],
        "occurred_at": moment_dict(
            row["occurred_at_utc"], row["utc_offset_minutes"], row["occurred_at_local"]
        ),
        "tracking_date": row["tracking_date"],
        "night_id": row["night_id"],
        "night_start_date": row["night_start_date"],
        "night_end_date": row["night_end_date"],
        "night_override": bool(row["night_override"]),
        "favorite_id": row["favorite_id"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }
    for key in DETAIL_FIELDS:
        data[key] = row[key]
    return data


def get_event(conn: sqlite3.Connection, owner: str, event_id: str) -> dict:
    row = conn.execute(
        f"{EVENT_SELECT} WHERE e.id = ? AND e.owner_id = ?", (event_id, owner)
    ).fetchone()
    if row is None:
        raise NotFound
    return event_dict(row)


def list_events(
    conn: sqlite3.Connection, owner: str, start: date | None = None, end: date | None = None
) -> list[dict]:
    query = f"{EVENT_SELECT} WHERE e.owner_id = ?"
    args: list = [owner]
    if start:
        query += " AND e.tracking_date >= ?"
        args.append(start.isoformat())
    if end:
        query += " AND e.tracking_date <= ?"
        args.append(end.isoformat())
    query += " ORDER BY e.occurred_at_utc, e.id"
    return [event_dict(row) for row in conn.execute(query, args)]


def _validate_details(kind: str, details: dict) -> None:
    required = KIND_FIELDS[kind]
    missing = sorted(key for key in required if details.get(key) is None)
    if missing:
        raise Invalid("missing_fields", f"Champs requis : {', '.join(missing)}.")
    extra = sorted(key for key in DETAIL_FIELDS if key not in required and details.get(key))
    if extra:
        raise Invalid("unexpected_fields", f"Champs non applicables : {', '.join(extra)}.")


def _check_nap_overlap(
    conn: sqlite3.Connection, owner: str, start: datetime, minutes: int, exclude: str | None
) -> None:
    end = start + timedelta(minutes=minutes)
    rows = conn.execute(
        "SELECT id, occurred_at_utc, duration_minutes FROM events"
        " WHERE owner_id = ? AND kind = 'nap' AND id IS NOT ?",
        (owner, exclude),
    )
    for row in rows:
        other_start = datetime.fromisoformat(row["occurred_at_utc"].replace("Z", "+00:00"))
        other_end = other_start + timedelta(minutes=row["duration_minutes"])
        if start < other_end and other_start < end:
            raise Invalid("nap_overlap", "Cette sieste chevauche une autre sieste.")


def create_event(
    conn: sqlite3.Connection,
    owner: str,
    payload: schemas.EventCreate,
    favorite_id: str | None = None,
) -> dict:
    details = {key: getattr(payload, key) for key in DETAIL_FIELDS}
    _validate_details(payload.kind, details)
    when = moment(payload.occurred_at)
    if payload.kind == "nap":
        _check_nap_overlap(conn, owner, when.utc, details["duration_minutes"], None)
    override = payload.night_start_date is not None
    night = ensure_night(conn, owner, payload.night_start_date or when.tracking_date)
    event_id = new_id()
    stamp = now_iso()
    conn.execute(
        "INSERT INTO events (id, owner_id, kind, occurred_at_utc, utc_offset_minutes,"
        " occurred_at_local, tracking_date, night_id, night_override, drink_type, volume_ml,"
        " activity_type, intensity, duration_minutes, favorite_id, created_at, updated_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            event_id,
            owner,
            payload.kind,
            when.utc_iso,
            when.offset_minutes,
            when.local_iso,
            when.tracking_date.isoformat(),
            night["id"],
            int(override),
            *[details[key] for key in DETAIL_FIELDS],
            favorite_id,
            stamp,
            stamp,
        ),
    )
    return get_event(conn, owner, event_id)


def patch_event(
    conn: sqlite3.Connection, owner: str, event_id: str, patch: schemas.EventPatch
) -> dict:
    row = conn.execute(
        f"{EVENT_SELECT} WHERE e.id = ? AND e.owner_id = ?", (event_id, owner)
    ).fetchone()
    if row is None:
        raise NotFound
    fields = patch.model_fields_set
    details = {key: row[key] for key in DETAIL_FIELDS}
    details.update({key: getattr(patch, key) for key in DETAIL_FIELDS if key in fields})
    _validate_details(row["kind"], details)

    utc, offset, local, tracking = (
        row["occurred_at_utc"],
        row["utc_offset_minutes"],
        row["occurred_at_local"],
        date.fromisoformat(row["tracking_date"]),
    )
    if "occurred_at" in fields and patch.occurred_at is not None:
        when = moment(patch.occurred_at)
        utc, offset, local, tracking = (
            when.utc_iso,
            when.offset_minutes,
            when.local_iso,
            when.tracking_date,
        )
    if row["kind"] == "nap":
        start = datetime.fromisoformat(utc.replace("Z", "+00:00"))
        _check_nap_overlap(conn, owner, start, details["duration_minutes"], event_id)

    override = bool(row["night_override"])
    night_start = date.fromisoformat(row["night_start_date"])
    if "night_start_date" in fields:
        override = patch.night_start_date is not None
        night_start = patch.night_start_date or tracking
    elif not override:
        night_start = tracking
    night = ensure_night(conn, owner, night_start)

    conn.execute(
        "UPDATE events SET occurred_at_utc = ?, utc_offset_minutes = ?, occurred_at_local = ?,"
        " tracking_date = ?, night_id = ?, night_override = ?, drink_type = ?, volume_ml = ?,"
        " activity_type = ?, intensity = ?, duration_minutes = ?, updated_at = ?"
        " WHERE id = ? AND owner_id = ?",
        (
            utc,
            offset,
            local,
            tracking.isoformat(),
            night["id"],
            int(override),
            *[details[key] for key in DETAIL_FIELDS],
            now_iso(),
            event_id,
            owner,
        ),
    )
    return get_event(conn, owner, event_id)


def delete_event(conn: sqlite3.Connection, owner: str, event_id: str) -> None:
    cursor = conn.execute("DELETE FROM events WHERE id = ? AND owner_id = ?", (event_id, owner))
    if cursor.rowcount == 0:
        raise NotFound


# --- favorites --------------------------------------------------------------


def favorite_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys() if key != "owner_id"}


def list_favorites(conn: sqlite3.Connection, owner: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM favorites WHERE owner_id = ? ORDER BY created_at, id", (owner,)
    )
    return [favorite_dict(row) for row in rows]


def _favorite_row(conn: sqlite3.Connection, owner: str, favorite_id: str) -> sqlite3.Row:
    row = conn.execute(
        "SELECT * FROM favorites WHERE id = ? AND owner_id = ?", (favorite_id, owner)
    ).fetchone()
    if row is None:
        raise NotFound
    return row


def create_favorite(conn: sqlite3.Connection, owner: str, payload: schemas.FavoriteCreate) -> dict:
    favorite_id, stamp = new_id(), now_iso()
    conn.execute(
        "INSERT INTO favorites (id, owner_id, label, drink_type, volume_ml, created_at,"
        " updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            favorite_id,
            owner,
            payload.label.strip(),
            payload.drink_type,
            payload.volume_ml,
            stamp,
            stamp,
        ),
    )
    return favorite_dict(_favorite_row(conn, owner, favorite_id))


def patch_favorite(
    conn: sqlite3.Connection, owner: str, favorite_id: str, patch: schemas.FavoritePatch
) -> dict:
    row = _favorite_row(conn, owner, favorite_id)
    values = {key: row[key] for key in ("label", "drink_type", "volume_ml")}
    values.update(
        {key: getattr(patch, key) for key in patch.model_fields_set if getattr(patch, key)}
    )
    conn.execute(
        "UPDATE favorites SET label = ?, drink_type = ?, volume_ml = ?, updated_at = ?"
        " WHERE id = ? AND owner_id = ?",
        (
            values["label"].strip(),
            values["drink_type"],
            values["volume_ml"],
            now_iso(),
            favorite_id,
            owner,
        ),
    )
    return favorite_dict(_favorite_row(conn, owner, favorite_id))


def delete_favorite(conn: sqlite3.Connection, owner: str, favorite_id: str) -> None:
    # Events created from the favorite are independent and keep their values.
    cursor = conn.execute(
        "DELETE FROM favorites WHERE id = ? AND owner_id = ?", (favorite_id, owner)
    )
    if cursor.rowcount == 0:
        raise NotFound


def use_favorite(
    conn: sqlite3.Connection, owner: str, favorite_id: str, payload: schemas.FavoriteUse
) -> dict:
    """Copy the favorite's values into a fresh drink entry with its own intake time."""
    row = _favorite_row(conn, owner, favorite_id)
    event = schemas.EventCreate(
        kind="drink",
        occurred_at=payload.occurred_at,
        drink_type=row["drink_type"],
        volume_ml=row["volume_ml"],
    )
    return create_event(conn, owner, event, favorite_id=favorite_id)


# --- suggestions ------------------------------------------------------------


def suggestion_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys() if key != "owner_id"}


def list_suggestions(conn: sqlite3.Connection, owner: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM suggestions WHERE owner_id = ? ORDER BY created_at DESC, id", (owner,)
    )
    return [suggestion_dict(row) for row in rows]


def create_suggestion(
    conn: sqlite3.Connection, owner: str, payload: schemas.SuggestionCreate
) -> dict:
    suggestion_id = new_id()
    conn.execute(
        "INSERT INTO suggestions (id, owner_id, action_context, text, created_at)"
        " VALUES (?, ?, ?, ?, ?)",
        (suggestion_id, owner, payload.action_context, payload.text.strip(), now_iso()),
    )
    row = conn.execute("SELECT * FROM suggestions WHERE id = ?", (suggestion_id,)).fetchone()
    return suggestion_dict(row)


def delete_suggestion(conn: sqlite3.Connection, owner: str, suggestion_id: str) -> None:
    cursor = conn.execute(
        "DELETE FROM suggestions WHERE id = ? AND owner_id = ?", (suggestion_id, owner)
    )
    if cursor.rowcount == 0:
        raise NotFound


# --- history ----------------------------------------------------------------


def tracking_dates(conn: sqlite3.Connection, owner: str) -> list[str]:
    rows = conn.execute(
        "SELECT tracking_date AS d FROM events WHERE owner_id = ?"
        " UNION SELECT tracking_date FROM days WHERE owner_id = ?"
        " UNION SELECT start_date FROM nights WHERE owner_id = ?"
        "   AND (cat_presence != 'unknown' OR anticipated_stress != 'unknown'"
        "        OR early_wake_planned != 'unknown')"
        " ORDER BY d DESC",
        (owner, owner, owner),
    )
    return [row["d"] for row in rows]


def day_view(conn: sqlite3.Connection, owner: str, tracking: date) -> dict:
    """A tracking day with its context, its following night and related events.

    ``events`` are the events whose tracking date is this day; ``night_events`` are
    the events linked to this day's following night (by default or by override).
    """
    night = get_night(conn, owner, tracking)
    events = list_events(conn, owner, tracking, tracking)
    night_events = []
    if night["id"]:
        rows = conn.execute(
            f"{EVENT_SELECT} WHERE e.owner_id = ? AND e.night_id = ?"
            " ORDER BY e.occurred_at_utc, e.id",
            (owner, night["id"]),
        )
        night_events = [event_dict(row) for row in rows]
    return {
        "tracking_date": tracking.isoformat(),
        "day": get_day(conn, owner, tracking),
        "night": night,
        "events": events,
        "night_events": night_events,
    }
