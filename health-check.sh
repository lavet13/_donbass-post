#!/usr/bin/env bash

set -euo pipefail

# ssh splinter@194.164.245.175 -p 10022

HEADER="=== Health Check: $(date +"%Y-%m-%d") ==="

echo "$HEADER"

CONTAINERS=("postgres" "telegram-bot" "nginx-certbot")

RUNNING_CONTAINERS="$(docker compose ps --status running | tail -n +2 | tr -s ' ' | cut -d ' ' -f4)"

for CONTAINER in "${CONTAINERS[@]}"; do
  if echo "$RUNNING_CONTAINERS" | grep -q -w "$CONTAINER"; then
    echo "✅ $CONTAINER is RUNNING"
  else
    echo "❌ $CONTAINER is NOT RUNNING"
  fi
done
