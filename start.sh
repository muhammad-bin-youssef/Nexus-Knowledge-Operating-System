#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "Starting Knowledge OS backend..."
(cd "$ROOT/backend" && cargo run --release 2>/dev/null || cargo run) &
BACKEND_PID=$!

echo "Waiting for backend..."
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  sleep 1
done

echo "Starting Knowledge OS frontend..."
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Knowledge OS is running:"
echo "  Frontend: http://127.0.0.1:5173"
echo "  Backend:  http://127.0.0.1:3001"
echo ""
echo "Press Ctrl+C to stop."

wait
