#!/usr/bin/env bash

set -euo pipefail

# Planning to add this
# ssh splinter@194.164.245.175 -p 10022

HEADER="=== Health Check: $(date +"%Y-%m-%d") ==="

echo "$HEADER"

CONTAINERS=(
  "postgres"
  "telegram-bot"
  "nginx-certbot"
)

RUNNING_CONTAINERS="$(CERTBOT_EMAIL=lavet13@mail.ru docker compose -f docker-compose.yml -f docker-compose.prod.yml ps --status running)"

FAILED=0

for CONTAINER in "${CONTAINERS[@]}"; do
  if echo "$RUNNING_CONTAINERS" | grep -q -w "$CONTAINER"; then
    echo "✅ $CONTAINER is RUNNING"
  else
    echo "❌ $CONTAINER is NOT RUNNING"
    FAILED=1
  fi
done

if [[ $FAILED -ne 0 ]]; then
  echo "Health check FAILED"
  exit 1
fi

echo "All services healthy"
