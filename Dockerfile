# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild
COPY tsconfig.json vite.config.ts index.html ./
COPY public public
COPY sw sw
COPY src src
RUN npm run build

FROM python:3.13-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    SOMMEILENOR_DB_PATH=/data/sommeilenor.sqlite3 \
    SOMMEILENOR_STATIC_DIR=/app/static \
    SOMMEILENOR_SECURE_COOKIES=true
COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /usr/local/bin/uv
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/app app
COPY --from=frontend /build/dist static
RUN useradd --system --uid 10001 sommeilenor && mkdir -p /data /backups \
    && chown sommeilenor /data /backups
USER sommeilenor
VOLUME ["/data"]
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health')"
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
