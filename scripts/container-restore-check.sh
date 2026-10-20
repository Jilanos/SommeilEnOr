#!/usr/bin/env bash
# Exercises restart persistence and two-account backup/restore on the container image,
# with synthetic data only. Uses throwaway volumes/containers named sommeilenor-check-*.
#   docker build -t sommeilenor:local . && scripts/container-restore-check.sh
set -euo pipefail

IMAGE=${IMAGE:-sommeilenor:local}
WORK=$(mktemp -d)
BACKUPS="$WORK/backups"
mkdir -p "$BACKUPS" && chmod 777 "$BACKUPS"
SRC_PORT=18761
DST_PORT=18762

cleanup() {
  docker rm -f sommeilenor-check-src sommeilenor-check-dst >/dev/null 2>&1 || true
  docker volume rm sommeilenor-check-src sommeilenor-check-dst >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

start() { # name port
  docker run -d --name "sommeilenor-check-$1" -p "127.0.0.1:$2:8000" \
    -e SOMMEILENOR_SECURE_COOKIES=false \
    -v "sommeilenor-check-$1:/data" -v "$BACKUPS:/backups" "$IMAGE" >/dev/null
  wait_ready "$2"
}
check() { # label condition...
  local label=$1; shift
  if "$@"; then echo "PASS $label"; else echo "FAIL $label" >&2; exit 1; fi
}
wait_ready() {
  for _ in $(seq 1 60); do curl -sf "http://127.0.0.1:$1/api/health" >/dev/null && return; sleep 0.5; done
  echo "instance on port $1 not ready" >&2; exit 1
}
call() { # port jar method path [json]
  curl -sf -b "$WORK/$2" -c "$WORK/$2" -X "$3" -H 'Content-Type: application/json' \
    ${5:+--data "$5"} "http://127.0.0.1:$1$4"
}
export_of() { # port jar  -> export without its timestamp
  call "$1" "$2" GET /api/export.json | python3 -c 'import json,sys; d=json.load(sys.stdin); d.pop("exported_at"); print(json.dumps(d, sort_keys=True))'
}

docker volume create sommeilenor-check-src >/dev/null
docker volume create sommeilenor-check-dst >/dev/null
start src $SRC_PORT

for who in alice bob; do
  call $SRC_PORT $who POST /api/auth/register "{\"email\":\"$who@example.com\",\"password\":\"synthetic-password-1\"}" >/dev/null
  call $SRC_PORT $who POST /api/events '{"kind":"drink","occurred_at":{"at":"2026-10-20T00:30"},"drink_type":"infusion","volume_ml":200}' >/dev/null
  call $SRC_PORT $who POST /api/events '{"kind":"nap","occurred_at":{"at":"2026-10-19T13:30"},"duration_minutes":20}' >/dev/null
  fav=$(call $SRC_PORT $who POST /api/favorites '{"label":"Mate","drink_type":"mate","volume_ml":500}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
  call $SRC_PORT $who POST "/api/favorites/$fav/use" '{"occurred_at":{"at":"2026-10-20T09:00"}}' >/dev/null
  call $SRC_PORT $who PATCH /api/days/2026-10-19 '{"alcohol":"no","dinner_quantity":"big","dinner_at":{"at":"2026-10-19T20:00"}}' >/dev/null
  call $SRC_PORT $who PATCH /api/nights/2026-10-19 '{"cat_presence":"yes","anticipated_stress":"high"}' >/dev/null
  call $SRC_PORT $who POST /api/suggestions "{\"action_context\":\"drink.add\",\"text\":\"idee $who\"}" >/dev/null
done
alice_before=$(export_of $SRC_PORT alice)
bob_before=$(export_of $SRC_PORT bob)
alice_event=$(echo "$alice_before" | python3 -c 'import json,sys; print(json.load(sys.stdin)["journal"]["events"][0]["id"])')

docker restart sommeilenor-check-src >/dev/null && wait_ready $SRC_PORT
check "restart preserves journal entries" [ "$(export_of $SRC_PORT alice)" = "$alice_before" ]

docker exec sommeilenor-check-src python -m app.backup create /backups/synthetic.sqlite3 >/dev/null
echo "PASS online backup created"

# Restore into an isolated instance (fresh volume), with the app not running.
docker run --rm -v sommeilenor-check-dst:/data -v "$BACKUPS:/backups" "$IMAGE" \
  python -m app.backup restore /backups/synthetic.sqlite3 >/dev/null
start dst $DST_PORT
for who in alice bob; do
  call $DST_PORT "r-$who" POST /api/auth/login "{\"email\":\"$who@example.com\",\"password\":\"synthetic-password-1\"}" >/dev/null
done
check "restored alice export identical (journal, favorites, suggestions)" [ "$(export_of $DST_PORT r-alice)" = "$alice_before" ]
check "restored bob export identical" [ "$(export_of $DST_PORT r-bob)" = "$bob_before" ]
status=$(curl -s -o /dev/null -w '%{http_code}' -b "$WORK/r-bob" "http://127.0.0.1:$DST_PORT/api/events/$alice_event")
check "isolation intact after restore (guessed ID -> 404)" [ "$status" = 404 ]
echo "container restore check complete"
