from collections.abc import Callable
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

PASSWORD = "synthetic-password-1"


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        database_path=tmp_path / "test.sqlite3",
        static_dir=None,
        secure_cookies=True,
        session_days=90,
    )


@pytest.fixture
def make_client(settings: Settings) -> Callable[..., TestClient]:
    app = create_app(settings)

    def factory(email: str | None = None, register: bool = True) -> TestClient:
        client = TestClient(app, base_url="https://testserver")
        if email:
            path = "/api/auth/register" if register else "/api/auth/login"
            response = client.post(path, json={"email": email, "password": PASSWORD})
            assert response.status_code in (200, 201), response.text
        return client

    return factory


@pytest.fixture
def alice(make_client) -> TestClient:
    return make_client("alice@example.com")


@pytest.fixture
def bob(make_client) -> TestClient:
    return make_client("bob@example.com")


def drink(client: TestClient, at: str, drink_type: str = "green_tea", volume: float = 250, **extra):
    body = {
        "kind": "drink",
        "occurred_at": {"at": at},
        "drink_type": drink_type,
        "volume_ml": volume,
        **extra,
    }
    return client.post("/api/events", json=body)
