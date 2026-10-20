from conftest import drink


def test_repeated_drinks_are_independent_entries(alice):
    first = drink(alice, "2026-10-20T08:00", "green_tea", 250)
    second = drink(alice, "2026-10-20T08:00", "green_tea", 250)
    mate = drink(alice, "2026-10-20T15:00", "mate", 400)
    assert first.status_code == second.status_code == mate.status_code == 201
    assert first.json()["id"] != second.json()["id"]
    assert len(alice.get("/api/events").json()) == 3


def test_drink_validation(alice):
    assert drink(alice, "2026-10-20T08:00", volume=0).status_code == 422
    assert drink(alice, "2026-10-20T08:00", volume=-5).status_code == 422
    assert drink(alice, "2026-10-20T08:00", drink_type="coffee").status_code == 422
    missing = alice.post(
        "/api/events", json={"kind": "drink", "occurred_at": {"at": "2026-10-20T08:00"}}
    )
    assert missing.json()["detail"]["code"] == "missing_fields"
    mixed = drink(alice, "2026-10-20T08:00", intensity="low")
    assert mixed.json()["detail"]["code"] == "unexpected_fields"
    gap = drink(alice, "2026-03-29T02:30")
    assert gap.json()["detail"]["code"] == "nonexistent_local_time"
    ambiguous = drink(alice, "2026-10-25T02:30")
    assert ambiguous.json()["detail"] == {
        "code": "ambiguous_local_time",
        "message": ambiguous.json()["detail"]["message"],
        "options": [60, 120],
    }


def test_favorite_creates_fresh_entry_with_own_time(alice):
    favorite = alice.post(
        "/api/favorites", json={"label": "Grand mate", "drink_type": "mate", "volume_ml": 500}
    ).json()
    used = alice.post(
        f"/api/favorites/{favorite['id']}/use",
        json={"occurred_at": {"at": "2026-10-21T07:30"}},
    )
    assert used.status_code == 201
    event = used.json()
    assert event["occurred_at"]["local"] == "2026-10-21T07:30:00+02:00"
    assert event["occurred_at"]["utc"] != favorite["created_at"]
    assert (event["drink_type"], event["volume_ml"], event["favorite_id"]) == (
        "mate",
        500,
        favorite["id"],
    )
    again = alice.post(
        f"/api/favorites/{favorite['id']}/use", json={"occurred_at": {"at": "2026-10-21T11:00"}}
    ).json()
    assert again["id"] != event["id"]

    # Editing the entry or the favorite never rewrites the other.
    alice.patch(f"/api/events/{event['id']}", json={"volume_ml": 300})
    alice.patch(f"/api/favorites/{favorite['id']}", json={"volume_ml": 250})
    assert alice.get(f"/api/events/{again['id']}").json()["volume_ml"] == 500
    assert alice.get(f"/api/events/{event['id']}").json()["volume_ml"] == 300
    assert alice.delete(f"/api/favorites/{favorite['id']}").status_code == 204
    assert len(alice.get("/api/events").json()) == 2


def test_activities_and_naps(alice):
    def activity(**body):
        payload = {
            "kind": "activity",
            "occurred_at": {"at": "2026-10-20T18:00"},
            "activity_type": "running",
            "intensity": "high",
            "duration_minutes": 45,
        }
        payload.update(body)
        return alice.post("/api/events", json=payload)

    assert activity().status_code == 201
    assert activity(activity_type="walking", intensity="low").status_code == 201
    assert activity(activity_type=["running", "cycling"]).status_code == 422
    assert activity(intensity="extreme").status_code == 422
    assert activity(duration_minutes=0).status_code == 422
    assert activity(intensity=None).json()["detail"]["code"] == "missing_fields"

    def nap(at, minutes):
        return alice.post(
            "/api/events",
            json={"kind": "nap", "occurred_at": {"at": at}, "duration_minutes": minutes},
        )

    first = nap("2026-10-20T13:30", 20)
    assert first.status_code == 201
    assert nap("2026-10-20T13:40", 30).json()["detail"]["code"] == "nap_overlap"
    assert nap("2026-10-20T13:50", 15).status_code == 201  # starts exactly at the end
    assert nap("2026-10-20T16:00", -10).status_code == 422
    assert nap("2026-10-20T16:00", 0).status_code == 422
    patched = alice.patch(f"/api/events/{first.json()['id']}", json={"duration_minutes": 25})
    assert patched.json()["detail"]["code"] == "nap_overlap"


def test_default_night_link_and_manual_override(alice):
    late = drink(alice, "2026-10-20T00:30").json()
    assert late["tracking_date"] == "2026-10-19"
    assert (late["night_start_date"], late["night_end_date"]) == ("2026-10-19", "2026-10-20")
    assert late["night_override"] is False

    awakening = drink(alice, "2026-10-20T05:00", "infusion").json()
    assert awakening["tracking_date"] == "2026-10-20"
    assert awakening["night_start_date"] == "2026-10-20"

    # Manual reassignment of the 05:00 event to the ongoing night.
    moved = alice.patch(
        f"/api/events/{awakening['id']}", json={"night_start_date": "2026-10-19"}
    ).json()
    assert moved["night_override"] is True
    assert moved["night_id"] == late["night_id"]
    assert moved["tracking_date"] == "2026-10-20"

    # Editing the time keeps the override; the tracking date follows the time.
    retimed = alice.patch(
        f"/api/events/{awakening['id']}", json={"occurred_at": {"at": "2026-10-20T05:15"}}
    ).json()
    assert retimed["night_id"] == late["night_id"] and retimed["night_override"] is True

    # Without override, editing the time recomputes the default night.
    shifted = alice.patch(
        f"/api/events/{late['id']}", json={"occurred_at": {"at": "2026-10-20T09:00"}}
    ).json()
    assert (shifted["tracking_date"], shifted["night_start_date"]) == ("2026-10-20", "2026-10-20")

    reset = alice.patch(f"/api/events/{awakening['id']}", json={"night_start_date": None}).json()
    assert reset["night_override"] is False and reset["night_start_date"] == "2026-10-20"

    created = drink(alice, "2026-10-20T05:00", night_start_date="2026-10-19").json()
    assert created["night_override"] is True and created["night_start_date"] == "2026-10-19"

    view = alice.get("/api/days/2026-10-19").json()
    assert [e["id"] for e in view["night_events"]] == [created["id"]]
    assert view["events"] == []


def test_unrestricted_past_correction_and_deletion(alice):
    old = drink(alice, "2019-01-05T10:00").json()
    edited = alice.patch(
        f"/api/events/{old['id']}", json={"occurred_at": {"at": "2018-12-31T23:00"}}
    )
    assert edited.json()["tracking_date"] == "2018-12-31"
    assert alice.patch("/api/days/2018-12-31", json={"gluten": "no"}).status_code == 200
    assert alice.delete(f"/api/events/{old['id']}").status_code == 204
    assert alice.get(f"/api/events/{old['id']}").status_code == 404


def test_day_context_missing_vs_negative_and_late_sugar(alice):
    view = alice.get("/api/days/2026-10-20").json()
    assert view["day"]["alcohol"] == "unknown" and view["day"]["id"] is None

    day = alice.patch(
        "/api/days/2026-10-20",
        json={
            "alcohol": "no",
            "dinner_at": {"at": "2026-10-20T20:15"},
            "dinner_quantity": "massive",
            "evening_noncaffeinated_drink": "yes",
        },
    ).json()
    assert (day["alcohol"], day["gluten"]) == ("no", "unknown")
    assert day["dinner_at"]["local"] == "2026-10-20T20:15:00+02:00"
    assert day["dinner_quantity"] == "massive"
    # The evening drink flag never creates an intake.
    assert alice.get("/api/events").json() == []

    assert alice.patch("/api/days/2026-10-20", json={"dinner_quantity": "huge"}).status_code == 422
    missing = alice.patch("/api/days/2026-10-20", json={"late_sugar": "yes"})
    assert missing.json()["detail"]["code"] == "late_sugar_time_required"
    sugar = alice.patch(
        "/api/days/2026-10-20",
        json={"late_sugar": "yes", "late_sugar_at": {"at": "2026-10-20T22:40"}},
    ).json()
    assert sugar["late_sugar_at"]["local"] == "2026-10-20T22:40:00+02:00"
    no_sugar = alice.patch("/api/days/2026-10-20", json={"late_sugar": "no"}).json()
    assert no_sugar["late_sugar"] == "no" and no_sugar["late_sugar_at"] is None
    assert no_sugar["alcohol"] == "no"  # untouched fields are preserved

    cleared = alice.patch("/api/days/2026-10-20", json={"dinner_at": None}).json()
    assert cleared["dinner_at"] is None and cleared["dinner_quantity"] == "massive"


def test_stress_periods_are_independent(alice):
    alice.patch("/api/days/2026-10-19", json={"experienced_stress": "medium"})
    alice.patch("/api/nights/2026-10-19", json={"anticipated_stress": "high"})
    # Tuesday's experienced stress does not overwrite Monday's anticipation of Tuesday.
    alice.patch("/api/days/2026-10-20", json={"experienced_stress": "absent"})
    monday = alice.get("/api/days/2026-10-19").json()
    tuesday = alice.get("/api/days/2026-10-20").json()
    assert monday["day"]["experienced_stress"] == "medium"
    assert monday["night"]["anticipated_stress"] == "high"
    assert monday["night"]["anticipated_stress_for_date"] == "2026-10-20"
    assert tuesday["day"]["experienced_stress"] == "absent"
    assert tuesday["night"]["anticipated_stress"] == "unknown"
    bad = alice.patch("/api/days/2026-10-20", json={"experienced_stress": "low"})
    assert bad.status_code == 422


def test_night_context_and_planned_early_wake(alice):
    missing = alice.patch("/api/nights/2026-10-20", json={"early_wake_planned": "yes"})
    assert missing.json()["detail"]["code"] == "early_wake_target_required"
    night = alice.patch(
        "/api/nights/2026-10-20",
        json={
            "cat_presence": "no",
            "early_wake_planned": "yes",
            "early_wake_target_time": "05:45",
            "early_wake_reason": "Train",
        },
    ).json()
    assert (night["start_date"], night["end_date"]) == ("2026-10-20", "2026-10-21")
    assert night["early_wake_target_time"] == "05:45" and night["early_wake_reason"] == "Train"
    assert "wake_time" not in night and "bedtime" not in night
    stable_id = night["id"]
    cancelled = alice.patch("/api/nights/2026-10-20", json={"early_wake_planned": "no"}).json()
    assert cancelled["early_wake_target_time"] is None and cancelled["id"] == stable_id
    assert (
        alice.patch("/api/nights/2026-10-20", json={"early_wake_target_time": "25:00"}).status_code
        == 422
    )


def test_suggestions_are_private_and_not_journal_events(alice):
    created = alice.post(
        "/api/suggestions", json={"action_context": "nap.add", "text": "Ajouter un minuteur"}
    )
    assert created.status_code == 201
    assert created.json()["action_context"] == "nap.add"
    assert alice.get("/api/events").json() == []
    assert alice.get("/api/tracking-days").json() == []
    assert (
        alice.post(
            "/api/suggestions", json={"action_context": "Bad Context!", "text": "x"}
        ).status_code
        == 422
    )
    assert (
        alice.post("/api/suggestions", json={"action_context": "a", "text": ""}).status_code == 422
    )
