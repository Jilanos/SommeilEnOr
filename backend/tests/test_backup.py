from conftest import PASSWORD
from fastapi.testclient import TestClient
from synthetic import populate

from app.backup import create_backup, restore_backup
from app.config import Settings
from app.main import create_app


def comparable(export: dict) -> dict:
    return {key: value for key, value in export.items() if key != "exported_at"}


def login(app, email: str) -> TestClient:
    client = TestClient(app, base_url="https://testserver")
    response = client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
    assert response.status_code == 200
    return client


def test_restart_preserves_entries(make_client, settings):
    populate(make_client("alice@example.com"), "alice")
    restarted = create_app(settings)
    client = login(restarted, "alice@example.com")
    assert len(client.get("/api/events").json()) == 14


def test_two_account_backup_restores_into_isolated_instance(alice, bob, settings, tmp_path):
    populate(alice, "alice")
    populate(bob, "bob")
    before = {
        name: comparable(client.get("/api/export.json").json())
        for name, client in (("alice", alice), ("bob", bob))
    }
    backup = tmp_path / "backups" / "synthetic.sqlite3"
    create_backup(settings.database_path, backup)

    # Changes after the backup must not appear after the restore.
    alice.post("/api/suggestions", json={"action_context": "late", "text": "après sauvegarde"})

    restored_db = tmp_path / "restored" / "sommeilenor.sqlite3"
    restore_backup(backup, restored_db)
    restored = create_app(
        Settings(database_path=restored_db, static_dir=None, secure_cookies=True, session_days=90)
    )
    after = {
        name: comparable(login(restored, f"{name}@example.com").get("/api/export.json").json())
        for name in ("alice", "bob")
    }
    assert after == before

    # Ownership isolation still holds in the restored instance, including guessed IDs.
    alice_r, bob_r = login(restored, "alice@example.com"), login(restored, "bob@example.com")
    alice_event = before["alice"]["journal"]["events"][0]["id"]
    alice_favorite = before["alice"]["favorites"][0]["id"]
    alice_suggestion = before["alice"]["feature_suggestions"][0]["id"]
    assert bob_r.get(f"/api/events/{alice_event}").status_code == 404
    assert bob_r.delete(f"/api/events/{alice_event}").status_code == 404
    assert bob_r.delete(f"/api/favorites/{alice_favorite}").status_code == 404
    assert bob_r.delete(f"/api/suggestions/{alice_suggestion}").status_code == 404
    assert alice_r.get(f"/api/events/{alice_event}").status_code == 200
    bob_ids = {e["id"] for e in bob_r.get("/api/events").json()}
    assert alice_event not in bob_ids and len(bob_ids) == 14
