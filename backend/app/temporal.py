"""Tracking-day and nominal-night rules.

A tracking day starts at 04:00 Europe/Paris wall-clock time. An event belongs by
default to the tracking day of its local time minus four hours, and to the main
night that starts in the evening of that tracking day (nominally ending the next
calendar day). Actual timestamps are never rewritten. The habitual 23:30-07:00
window is informational only and has no effect here.
"""

from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

TIMEZONE_NAME = "Europe/Paris"
TIMEZONE = ZoneInfo(TIMEZONE_NAME)
DAY_BOUNDARY = time(4, 0)
HABITUAL_SLEEP_WINDOW = ("23:30", "07:00")


class LocalTimeError(ValueError):
    def __init__(self, code: str, message: str, options: list[int] | None = None):
        super().__init__(message)
        self.code = code
        self.options = options or []


@dataclass(frozen=True)
class Moment:
    """An actual instant with the Europe/Paris offset that applied at that instant."""

    utc: datetime
    offset_minutes: int

    @property
    def local(self) -> datetime:
        return self.utc.astimezone(TIMEZONE)

    @property
    def utc_iso(self) -> str:
        return self.utc.strftime("%Y-%m-%dT%H:%M:%SZ")

    @property
    def local_iso(self) -> str:
        return self.local.isoformat(timespec="seconds")

    @property
    def tracking_date(self) -> date:
        return tracking_date_for(self.local)


def _offset_minutes(local: datetime) -> int:
    offset = local.utcoffset()
    assert offset is not None
    return int(offset.total_seconds() // 60)


def tracking_date_for(local: datetime) -> date:
    """Tracking date of an aware datetime, using the strict 04:00 local boundary."""
    wall = local.astimezone(TIMEZONE).replace(tzinfo=None)
    return (wall - timedelta(hours=DAY_BOUNDARY.hour, minutes=DAY_BOUNDARY.minute)).date()


def night_dates(tracking: date) -> tuple[date, date]:
    """Nominal (start, end) calendar dates of the main night following a tracking day."""
    return tracking, tracking + timedelta(days=1)


def moment_from_utc(value: datetime) -> Moment:
    utc = value.astimezone(UTC)
    return Moment(utc=utc, offset_minutes=_offset_minutes(utc.astimezone(TIMEZONE)))


def resolve_moment(value: str, offset_minutes: int | None = None) -> Moment:
    """Parse an ISO datetime.

    An offset-aware value is an actual instant. A naive value is Europe/Paris wall
    time: a time skipped by the spring DST change is rejected, and a time repeated
    by the autumn change requires ``offset_minutes`` to pick the occurrence.
    """
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise LocalTimeError("invalid_datetime", "Date/heure invalide.") from exc
    if parsed.tzinfo is not None:
        return moment_from_utc(parsed)

    candidates: dict[int, datetime] = {}
    for fold in (0, 1):
        local = parsed.replace(tzinfo=TIMEZONE, fold=fold)
        roundtrip = local.astimezone(UTC).astimezone(TIMEZONE).replace(tzinfo=None)
        if roundtrip == parsed:
            candidates[_offset_minutes(local)] = local
    if not candidates:
        raise LocalTimeError(
            "nonexistent_local_time", "Cette heure n'existe pas (changement d'heure)."
        )
    if offset_minutes is not None:
        if offset_minutes not in candidates:
            raise LocalTimeError(
                "invalid_offset", "Décalage horaire incompatible.", sorted(candidates)
            )
        return moment_from_utc(candidates[offset_minutes])
    if len(candidates) > 1:
        raise LocalTimeError(
            "ambiguous_local_time",
            "Cette heure existe deux fois (changement d'heure) : précisez le décalage.",
            sorted(candidates),
        )
    return moment_from_utc(next(iter(candidates.values())))
