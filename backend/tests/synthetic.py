"""Synthetic journal covering every entity, midnight/DST cases and missing vs negative answers."""

from fastapi.testclient import TestClient


def populate(client: TestClient, label: str) -> dict:
    def post(path: str, body: dict) -> dict:
        response = client.post(path, json=body)
        assert response.status_code == 201, response.text
        return response.json()

    def patch(path: str, body: dict) -> dict:
        response = client.patch(path, json=body)
        assert response.status_code == 200, response.text
        return response.json()

    def event(kind: str, at: str, offset: int | None = None, **fields) -> dict:
        moment = {"at": at} if offset is None else {"at": at, "utc_offset_minutes": offset}
        return post("/api/events", {"kind": kind, "occurred_at": moment, **fields})

    favorite = post(
        "/api/favorites", {"label": f"Thé {label}", "drink_type": "black_tea", "volume_ml": 330}
    )
    events = [
        event("drink", "2026-10-19T08:10", drink_type="green_tea", volume_ml=250),
        event("drink", "2026-10-19T08:10", drink_type="green_tea", volume_ml=250),
        event("drink", "2026-10-19T15:00", drink_type="mate", volume_ml=500),
        event("drink", "2026-10-20T00:30", drink_type="infusion", volume_ml=200),
        event("drink", "2026-10-20T03:59", drink_type="black_tea", volume_ml=150),
        event("drink", "2026-10-20T04:00", drink_type="infusion", volume_ml=180),
        event(
            "drink",
            "2026-10-20T05:00",
            drink_type="infusion",
            volume_ml=120,
            night_start_date="2026-10-19",
        ),
        event(
            "activity",
            "2026-10-19T18:00",
            activity_type="cycling",
            intensity="medium",
            duration_minutes=60,
        ),
        event(
            "activity",
            "2026-10-20T07:00",
            activity_type="strength",
            intensity="low",
            duration_minutes=20,
        ),
        event("nap", "2026-10-19T13:30", duration_minutes=25),
        # Autumn DST repeated hour, both occurrences.
        event("drink", "2026-10-25T02:30", 120, drink_type="infusion", volume_ml=100),
        event("drink", "2026-10-25T02:30", 60, drink_type="infusion", volume_ml=100),
        # Spring DST.
        event("drink", "2026-03-29T03:30", drink_type="green_tea", volume_ml=200),
    ]
    events.append(
        post(f"/api/favorites/{favorite['id']}/use", {"occurred_at": {"at": "2026-10-20T09:00"}})
    )
    days = [
        patch(
            "/api/days/2026-10-19",
            {
                "alcohol": "yes",
                "gluten": "no",
                "experienced_stress": "medium",
                "evening_noncaffeinated_drink": "yes",
                "late_sugar": "yes",
                "late_sugar_at": {"at": "2026-10-19T22:45"},
                "dinner_at": {"at": "2026-10-19T20:00"},
                "dinner_quantity": "big",
            },
        ),
        patch(
            "/api/days/2026-10-20",
            {"alcohol": "no", "late_sugar": "no", "experienced_stress": "absent"},
        ),
    ]
    nights = [
        patch(
            "/api/nights/2026-10-19",
            {
                "cat_presence": "yes",
                "anticipated_stress": "high",
                "early_wake_planned": "yes",
                "early_wake_target_time": "06:00",
                "early_wake_reason": "Rendez-vous",
            },
        ),
        patch("/api/nights/2026-10-20", {"cat_presence": "no", "early_wake_planned": "no"}),
    ]
    suggestions = [
        post(
            "/api/suggestions",
            {"action_context": "drink.add", "text": f"Idée {label}\nsur 2 lignes"},
        ),
        post("/api/suggestions", {"action_context": "export", "text": 'Export, "CSV"'}),
    ]
    return {
        "favorite": favorite,
        "events": events,
        "days": days,
        "nights": nights,
        "suggestions": suggestions,
    }
