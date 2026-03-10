#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d --build
echo "Pre-Legal running at http://localhost:8000"
