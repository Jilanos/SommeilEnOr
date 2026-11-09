from conftest import PASSWORD, drink


def test_register_login_logout_and_errors(make_client):
    client = make_client()
    weak = client.post("/api/auth/register", json={"email": "a@example.com", "password": "short"})
    assert weak.status_code == 422
    created = client.post(
        "/api/auth/register", json={"email": "Carol@Example.com", "password": PASSWORD}
    )
    assert created.status_code == 201
    assert created.json()["email"] == "carol@example.com"
    cookie = created.headers["set-cookie"].lower()
    assert "httponly" in cookie and "secure" in cookie and "samesite=strict" in cookie

    duplicate = make_client().post(
        "/api/auth/register", json={"email": "carol@example.com", "password": PASSWORD}
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["detail"]["code"] == "email_taken"

    other = make_client()
    for email, password in (
        ("carol@example.com", "wrong-password"),
        ("nobody@example.com", PASSWORD),
    ):
        response = other.post("/api/auth/login", json={"email": email, "password": password})
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "bad_credentials"

    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_unauthenticated_access_is_refused(make_client):
    anonymous = make_client()
    for method, path in [
        ("get", "/api/events"),
        ("post", "/api/events"),
        ("get", "/api/days/2026-10-20"),
        ("patch", "/api/days/2026-10-20"),
        ("patch", "/api/nights/2026-10-20"),
        ("get", "/api/favorites"),
        ("get", "/api/suggestions"),
        ("post", "/api/suggestions"),
        ("get", "/api/tracking-days"),
        ("get", "/api/export.json"),
        ("get", "/api/export.zip"),
    ]:
        response = getattr(anonymous, method)(path, **({"json": {}} if method != "get" else {}))
        assert response.status_code == 401, (method, path, response.status_code)


def test_second_browser_of_same_account_sees_saved_record(make_client):
    phone = make_client("dave@example.com")
    event = drink(phone, "2026-10-20T09:00").json()
    desktop = make_client("dave@example.com", register=False)
    assert [e["id"] for e in desktop.get("/api/events").json()] == [event["id"]]


def test_cross_account_isolation_with_guessed_ids(alice, bob):
    event = drink(alice, "2026-10-20T09:00").json()
    favorite = alice.post(
        "/api/favorites", json={"label": "Mon thé", "drink_type": "black_tea", "volume_ml": 300}
    ).json()
    suggestion = alice.post(
        "/api/suggestions", json={"action_context": "drink.add", "text": "Idée privée"}
    ).json()
    alice.patch("/api/days/2026-10-20", json={"alcohol": "yes"})
    alice.patch("/api/nights/2026-10-20", json={"cat_presence": "yes"})

    # Bob cannot read, mutate, use or delete Alice's records, even with their IDs.
    assert bob.get(f"/api/events/{event['id']}").status_code == 404
    assert bob.patch(f"/api/events/{event['id']}", json={"volume_ml": 1}).status_code == 404
    assert bob.delete(f"/api/events/{event['id']}").status_code == 404
    assert bob.patch(f"/api/favorites/{favorite['id']}", json={"label": "x"}).status_code == 404
    assert bob.delete(f"/api/favorites/{favorite['id']}").status_code == 404
    use = bob.post(
        f"/api/favorites/{favorite['id']}/use", json={"occurred_at": {"at": "2026-10-20T10:00"}}
    )
    assert use.status_code == 404
    assert bob.delete(f"/api/suggestions/{suggestion['id']}").status_code == 404

    assert bob.get("/api/events").json() == []
    assert bob.get("/api/favorites").json() == []
    assert bob.get("/api/suggestions").json() == []
    assert bob.get("/api/tracking-days").json() == []
    view = bob.get("/api/days/2026-10-20").json()
    assert view["day"]["alcohol"] == "unknown"
    assert view["night"]["cat_presence"] == "unknown"
    assert view["events"] == [] and view["night_events"] == []

    bob_export = bob.get("/api/export.json").json()
    assert bob_export["journal"]["events"] == []
    assert bob_export["journal"]["tracking_days"] == []
    assert bob_export["journal"]["nights"] == []
    assert bob_export["favorites"] == [] and bob_export["feature_suggestions"] == []

    # Bob's writes on the same dates create his own records only.
    bob.patch("/api/days/2026-10-20", json={"alcohol": "no"})
    assert alice.get("/api/days/2026-10-20").json()["day"]["alcohol"] == "yes"

    # Alice's data is intact.
    assert alice.get(f"/api/events/{event['id']}").json()["volume_ml"] == 250
    assert len(alice.get("/api/favorites").json()) == 1
    assert len(alice.get("/api/suggestions").json()) == 1


def test_closed_registration_refuses_new_accounts_but_keeps_login(tmp_path):
    from dataclasses import replace

    from fastapi.testclient import TestClient

    from app.config import Settings
    from app.main import create_app

    base = Settings(
        database_path=tmp_path / "closed.sqlite3",
        static_dir=None,
        secure_cookies=True,
        session_days=90,
    )
    open_client = TestClient(create_app(base), base_url="https://testserver")
    created = open_client.post(
        "/api/auth/register", json={"email": "erin@example.com", "password": PASSWORD}
    )
    assert created.status_code == 201

    closed = TestClient(
        create_app(replace(base, registration_open=False)), base_url="https://testserver"
    )
    refused = closed.post(
        "/api/auth/register", json={"email": "frank@example.com", "password": PASSWORD}
    )
    assert refused.status_code == 403
    assert refused.json()["detail"]["code"] == "registration_closed"
    login = closed.post("/api/auth/login", json={"email": "erin@example.com", "password": PASSWORD})
    assert login.status_code == 200


def test_registration_setting_reads_environment(monkeypatch):
    from app.config import load_settings

    monkeypatch.delenv("SOMMEILENOR_REGISTRATION", raising=False)
    assert load_settings().registration_open is True
    monkeypatch.setenv("SOMMEILENOR_REGISTRATION", "closed")
    assert load_settings().registration_open is False
