#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Remote health check — run from your LOCAL machine.
# SSHes into the VPS, asks Docker Compose which services are running,
# and reports per-service status. Exits 1 if anything is down.
#
# Usage: bash scripts/health-check.sh
# ==============================================================================

# == Config ====================================================================
# Find the env file next to this script, regardless of where it's called from.
# $0 is the script path; dirname strips the filename to get the directory.
ENV_FILE="$(dirname $0)/health-check.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing $ENV_FILE"
  echo "   Copy health-check.env.example → health-check.env and fill it in"
  exit 1
fi

# . and source are identical — both run the file in the current shell,
# so the variables it defines become available below.
source "$ENV_FILE"

CONTAINERS=(
  "postgres"
  "telegram-bot"
  "nginx-certbot"
)

# == Helpers ===================================================================
# Runs a command on the VPS over SSH.
# Arguments:
#   $@ — the command string to execute remotely
ssh_exec() {
  ssh -p "$VPS_PORT" "${VPS_USER}@${VPS_HOST}" "$@"
}

# == Main ======================================================================
echo "=== Health Check: $(date +"%Y-%m-%d %H:%M") ==="
echo "Target: ${VPS_USER}@${VPS_HOST}:${VPS_PORT}"
echo ""

# CERTBOT_EMAIL=placeholder only silences the Compose interpolation warning —
# the value is never used by `ps`
RUNNING_CONTAINERS="$(ssh_exec "cd ${COMPOSE_DIR} && \
  CERTBOT_EMAIL=placeholder \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  ps --status running")"

FAILED=0

for CONTAINER in "${CONTAINERS[@]}"; do
  if grep -q -w "$CONTAINER" <<< "$RUNNING_CONTAINERS"; then
    echo "✅ $CONTAINER is RUNNING"
  else
    echo "❌ $CONTAINER is NOT RUNNING"
    FAILED=$((FAILED + 1))   # arithmetic expansion — counts failures
  fi
done

echo ""
if [[ $FAILED -ne 0 ]]; then
  echo "❌ Health check FAILED — ${FAILED}/${#CONTAINERS[@]} service(s) down"
  exit 1
fi

echo "✅ All ${#CONTAINERS[@]} services healthy"
