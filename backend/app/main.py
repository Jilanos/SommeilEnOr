"""FastAPI application: authentication, owner-scoped journal API, export, static PWA."""

import sqlite3
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse

from . import journal, schemas
from .config import Settings, load_settings
from .db import connection_scope, init_db, transaction
from .export import build_csv_zip, build_export
from .security import DUMMY_HASH, hash_password, new_session_token, token_hash, verify_password

SESSION_COOKIE = "sommeilenor_session"


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    init_db(settings.database_path)
    app = FastAPI(title="SommeilEnOr API", docs_url=None, redoc_url=None, openapi_url=None)

    def get_conn() -> Iterator[sqlite3.Connection]:
        yield from connection_scope(settings.database_path)

    Conn = Annotated[sqlite3.Connection, Depends(get_conn)]

    def current_user(request: Request, conn: Conn) -> str:
        token = request.cookies.get(SESSION_COOKIE)
        if token:
            row = conn.execute(
                "SELECT user_id, expires_at FROM sessions WHERE token_hash = ?",
                (token_hash(token),),
            ).fetchone()
            if row and row["expires_at"] > journal.now_iso():
                return row["user_id"]
        raise HTTPException(401, {"code": "unauthenticated", "message": "Connexion requise."})

    Owner = Annotated[str, Depends(current_user)]

    @app.exception_handler(journal.Invalid)
    def invalid_handler(_: Request, exc: journal.Invalid) -> JSONResponse:
        detail = {"code": exc.code, "message": exc.message, "options": exc.options}
        return JSONResponse({"detail": detail}, status_code=422)

    @app.exception_handler(journal.NotFound)
    def not_found_handler(_: Request, __: journal.NotFound) -> JSONResponse:
        detail = {"code": "not_found", "message": "Élément introuvable."}
        return JSONResponse({"detail": detail}, status_code=404)

    @app.middleware("http")
    async def no_store(request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    def open_session(conn: sqlite3.Connection, response: Response, user_id: str) -> None:
        token, hashed = new_session_token()
        now = datetime.now(UTC)
        expires = now + timedelta(days=settings.session_days)
        fmt = "%Y-%m-%dT%H:%M:%SZ"
        conn.execute(
            "INSERT INTO sessions (token_hash, user_id, created_at, expires_at)"
            " VALUES (?, ?, ?, ?)",
            (hashed, user_id, now.strftime(fmt), expires.strftime(fmt)),
        )
        response.set_cookie(
            SESSION_COOKIE,
            token,
            max_age=settings.session_days * 86400,
            httponly=True,
            secure=settings.secure_cookies,
            samesite="strict",
            path="/",
        )

    # --- auth ---------------------------------------------------------------

    @app.get("/api/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.post("/api/auth/register", status_code=201)
    def register(payload: schemas.Credentials, response: Response, conn: Conn) -> dict:
        user_id = journal.new_id()
        try:
            with transaction(conn):
                conn.execute(
                    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                    (
                        user_id,
                        payload.email.lower(),
                        hash_password(payload.password),
                        journal.now_iso(),
                    ),
                )
                open_session(conn, response, user_id)
        except sqlite3.IntegrityError as exc:
            raise HTTPException(
                409, {"code": "email_taken", "message": "Cette adresse est déjà utilisée."}
            ) from exc
        return {"id": user_id, "email": payload.email.lower()}

    @app.post("/api/auth/login")
    def login(payload: schemas.LoginRequest, response: Response, conn: Conn) -> dict:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (payload.email.strip().lower(),),
        ).fetchone()
        valid = verify_password(payload.password, row["password_hash"] if row else DUMMY_HASH)
        if not row or not valid:
            raise HTTPException(
                401, {"code": "bad_credentials", "message": "Adresse ou mot de passe incorrect."}
            )
        with transaction(conn):
            open_session(conn, response, row["id"])
        return {"id": row["id"], "email": row["email"]}

    @app.post("/api/auth/logout", status_code=204)
    def logout(request: Request, response: Response, conn: Conn) -> None:
        token = request.cookies.get(SESSION_COOKIE)
        if token:
            conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash(token),))
        response.delete_cookie(SESSION_COOKIE, path="/")

    @app.get("/api/auth/me")
    def me(owner: Owner, conn: Conn) -> dict:
        row = conn.execute("SELECT id, email FROM users WHERE id = ?", (owner,)).fetchone()
        return {"id": row["id"], "email": row["email"]}

    # --- history: days and nights ------------------------------------------

    @app.get("/api/tracking-days")
    def tracking_days(owner: Owner, conn: Conn) -> list[str]:
        return journal.tracking_dates(conn, owner)

    @app.get("/api/days/{tracking_date}")
    def day_view(tracking_date: date, owner: Owner, conn: Conn) -> dict:
        return journal.day_view(conn, owner, tracking_date)

    @app.patch("/api/days/{tracking_date}")
    def patch_day(tracking_date: date, payload: schemas.DayPatch, owner: Owner, conn: Conn) -> dict:
        with transaction(conn):
            return journal.patch_day(conn, owner, tracking_date, payload)

    @app.patch("/api/nights/{start_date}")
    def patch_night(
        start_date: date, payload: schemas.NightPatch, owner: Owner, conn: Conn
    ) -> dict:
        with transaction(conn):
            return journal.patch_night(conn, owner, start_date, payload)

    # --- events -------------------------------------------------------------

    @app.get("/api/events")
    def list_events(
        owner: Owner, conn: Conn, start: date | None = None, end: date | None = None
    ) -> list[dict]:
        return journal.list_events(conn, owner, start, end)

    @app.post("/api/events", status_code=201)
    def create_event(payload: schemas.EventCreate, owner: Owner, conn: Conn) -> dict:
        with transaction(conn):
            return journal.create_event(conn, owner, payload)

    @app.get("/api/events/{event_id}")
    def get_event(event_id: str, owner: Owner, conn: Conn) -> dict:
        return journal.get_event(conn, owner, event_id)

    @app.patch("/api/events/{event_id}")
    def patch_event(event_id: str, payload: schemas.EventPatch, owner: Owner, conn: Conn) -> dict:
        with transaction(conn):
            return journal.patch_event(conn, owner, event_id, payload)

    @app.delete("/api/events/{event_id}", status_code=204)
    def delete_event(event_id: str, owner: Owner, conn: Conn) -> None:
        with transaction(conn):
            journal.delete_event(conn, owner, event_id)

    # --- favorites ----------------------------------------------------------

    @app.get("/api/favorites")
    def list_favorites(owner: Owner, conn: Conn) -> list[dict]:
        return journal.list_favorites(conn, owner)

    @app.post("/api/favorites", status_code=201)
    def create_favorite(payload: schemas.FavoriteCreate, owner: Owner, conn: Conn) -> dict:
        with transaction(conn):
            return journal.create_favorite(conn, owner, payload)

    @app.patch("/api/favorites/{favorite_id}")
    def patch_favorite(
        favorite_id: str, payload: schemas.FavoritePatch, owner: Owner, conn: Conn
    ) -> dict:
        with transaction(conn):
            return journal.patch_favorite(conn, owner, favorite_id, payload)

    @app.delete("/api/favorites/{favorite_id}", status_code=204)
    def delete_favorite(favorite_id: str, owner: Owner, conn: Conn) -> None:
        with transaction(conn):
            journal.delete_favorite(conn, owner, favorite_id)

    @app.post("/api/favorites/{favorite_id}/use", status_code=201)
    def use_favorite(
        favorite_id: str, payload: schemas.FavoriteUse, owner: Owner, conn: Conn
    ) -> dict:
        with transaction(conn):
            return journal.use_favorite(conn, owner, favorite_id, payload)

    # --- feature suggestions -----------------------------------------------

    @app.get("/api/suggestions")
    def list_suggestions(owner: Owner, conn: Conn) -> list[dict]:
        return journal.list_suggestions(conn, owner)

    @app.post("/api/suggestions", status_code=201)
    def create_suggestion(payload: schemas.SuggestionCreate, owner: Owner, conn: Conn) -> dict:
        with transaction(conn):
            return journal.create_suggestion(conn, owner, payload)

    @app.delete("/api/suggestions/{suggestion_id}", status_code=204)
    def delete_suggestion(suggestion_id: str, owner: Owner, conn: Conn) -> None:
        with transaction(conn):
            journal.delete_suggestion(conn, owner, suggestion_id)

    # --- export -------------------------------------------------------------

    def export_name(extension: str) -> str:
        return f"sommeilenor-export-{datetime.now(UTC).strftime('%Y%m%dT%H%M%SZ')}.{extension}"

    @app.get("/api/export.json")
    def export_json(owner: Owner, conn: Conn) -> JSONResponse:
        data = build_export(conn, owner)
        disposition = f'attachment; filename="{export_name("json")}"'
        return JSONResponse(data, headers={"Content-Disposition": disposition})

    @app.get("/api/export.zip")
    def export_zip(owner: Owner, conn: Conn) -> Response:
        payload = build_csv_zip(build_export(conn, owner))
        disposition = f'attachment; filename="{export_name("zip")}"'
        return Response(
            payload, media_type="application/zip", headers={"Content-Disposition": disposition}
        )

    @app.api_route("/api/{rest:path}", methods=["GET", "POST", "PATCH", "PUT", "DELETE"])
    def api_not_found(rest: str) -> None:
        raise HTTPException(404, {"code": "not_found", "message": "Route inconnue."})

    if settings.static_dir:
        mount_static(app, settings.static_dir)
    return app


def mount_static(app: FastAPI, root: Path) -> None:
    """Serve the built PWA; unknown paths fall back to index.html."""
    root = root.resolve()

    @app.get("/{path:path}", include_in_schema=False)
    def static(path: str) -> FileResponse:
        candidate = (root / path).resolve()
        if path and candidate.is_file() and candidate.is_relative_to(root):
            headers = {}
            if path in ("sw.js", "manifest.webmanifest"):
                headers["Cache-Control"] = "no-cache"
            elif path.startswith("assets/"):
                headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return FileResponse(candidate, headers=headers)
        return FileResponse(root / "index.html", headers={"Cache-Control": "no-cache"})
