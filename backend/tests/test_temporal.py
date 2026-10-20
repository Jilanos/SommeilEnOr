from datetime import date, datetime

import pytest

from app.temporal import LocalTimeError, resolve_moment, tracking_date_for

# 2026-10-20 is a Tuesday; Monday is 2026-10-19.
MONDAY, TUESDAY = date(2026, 10, 19), date(2026, 10, 20)


def test_reference_dates_are_monday_and_tuesday():
    assert MONDAY.strftime("%A") == "Monday"
    assert TUESDAY.strftime("%A") == "Tuesday"


@pytest.mark.parametrize(
    ("local", "expected"),
    [
        ("2026-10-20T00:30", MONDAY),
        ("2026-10-20T03:59", MONDAY),
        ("2026-10-20T04:00", TUESDAY),
        ("2026-10-20T05:00", TUESDAY),  # during a nocturnal awakening: strict rule
        ("2026-10-20T08:00", TUESDAY),
        # Habitual 23:30-07:00 window has no effect on assignment.
        ("2026-10-20T23:45", TUESDAY),
        ("2026-10-21T06:30", date(2026, 10, 21)),
    ],
)
def test_strict_four_am_boundary(local, expected):
    moment = resolve_moment(local)
    assert moment.tracking_date == expected
    assert moment.local.replace(tzinfo=None) == datetime.fromisoformat(local)


def test_offset_aware_instant_keeps_actual_time_and_offset():
    moment = resolve_moment("2026-10-19T22:30:00Z")
    assert moment.utc_iso == "2026-10-19T22:30:00Z"
    assert moment.offset_minutes == 120
    assert moment.local_iso == "2026-10-20T00:30:00+02:00"
    assert moment.tracking_date == MONDAY


def test_spring_forward_gap_is_rejected():
    with pytest.raises(LocalTimeError) as error:
        resolve_moment("2026-03-29T02:30")
    assert error.value.code == "nonexistent_local_time"


def test_spring_forward_offsets_and_tracking_day():
    before = resolve_moment("2026-03-29T01:59")
    after = resolve_moment("2026-03-29T03:00")
    assert (before.offset_minutes, after.offset_minutes) == (60, 120)
    assert before.utc < after.utc
    assert before.tracking_date == after.tracking_date == date(2026, 3, 28)
    assert resolve_moment("2026-03-29T04:00").tracking_date == date(2026, 3, 29)


def test_autumn_repeated_hour_requires_offset_and_preserves_order():
    with pytest.raises(LocalTimeError) as error:
        resolve_moment("2026-10-25T02:30")
    assert error.value.code == "ambiguous_local_time"
    assert error.value.options == [60, 120]
    first = resolve_moment("2026-10-25T02:30", 120)
    second = resolve_moment("2026-10-25T02:30", 60)
    assert first.utc_iso == "2026-10-25T00:30:00Z"
    assert second.utc_iso == "2026-10-25T01:30:00Z"
    assert first.tracking_date == second.tracking_date == date(2026, 10, 24)
    with pytest.raises(LocalTimeError):
        resolve_moment("2026-10-25T02:30", 30)


def test_tracking_date_for_aware_datetime_in_other_zone():
    # 03:30 UTC on a winter day = 04:30 Paris -> new tracking day.
    assert tracking_date_for(datetime.fromisoformat("2026-01-10T03:30:00+00:00")) == date(
        2026, 1, 10
    )
