#!/usr/bin/env bash
# Starts both the backend (FastAPI) and frontend (Next.js) dev servers.
# Usage: ./dev.sh

set -e
trap 'kill 0' EXIT

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Activate Python virtual environment
source "$PROJECT_DIR/.venv/bin/activate"

echo "Starting backend (FastAPI) ..."
cd "$PROJECT_DIR" && uvicorn backend.main:app --reload &

# Wait for backend to be ready before starting frontend
echo "Waiting for backend to be ready ..."
until curl -sf http://localhost:8000/health > /dev/null 2>&1; do
  sleep 0.5
done
echo "Backend is ready on http://localhost:8000"

echo "Starting frontend (Next.js) on http://localhost:3000 ..."
cd "$PROJECT_DIR/dashboard" && npm run dev &

wait
