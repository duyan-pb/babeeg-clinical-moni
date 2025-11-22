#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-5000}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -d node_modules ]; then
  echo "node_modules missing; installing dependencies..."
  npm install
fi

echo "Starting demo on ${HOST}:${PORT}"
npm run dev -- --host "$HOST" --port "$PORT"
