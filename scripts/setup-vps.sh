#!/bin/bash
set -e

# ── Argument parsing ──────────────────────────────────────────────────────────
# Usage: bash setup-vps.sh [--swap [SIZE]]
# Examples:
#   bash setup-vps.sh              → no swap
#   bash setup-vps.sh --swap       → 1G swap (default)
#   bash setup-vps.sh --swap 2G   → 2G swap

SWAP_ENABLED=false
SWAP_SIZE="1G"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --swap)
      SWAP_ENABLED=true
      # Check if next argument exists and doesn't start with --
      # If so, treat it as the size value
      if [[ -n "${2-}" && "${2}" != --* ]]; then
        SWAP_SIZE="$2"
        shift  # consume the size argument
      fi
      shift  # consume --swap
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: bash setup-vps.sh [--swap [SIZE]]"
      exit 1
      ;;
  esac
done

# ── Deploy user ───────────────────────────────────────────────────────────────
if id "deploy" &>/dev/null; then
  echo "✅ User 'deploy' already exists, skipping creation"
else
  echo "Creating user 'deploy'..."
  adduser --disabled-password --gecos "" deploy
  echo "✅ User 'deploy' created"
fi

usermod -aG docker deploy
echo "✅ User 'deploy' added to docker group"

# ── SSH directory ─────────────────────────────────────────────────────────────
SSH_DIR="/home/deploy/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"
chown deploy:deploy "$SSH_DIR"

if [ ! -f "$AUTH_KEYS" ]; then
  touch "$AUTH_KEYS"
  chmod 600 "$AUTH_KEYS"
  chown deploy:deploy "$AUTH_KEYS"
  echo "✅ Created $AUTH_KEYS"
  echo "⚠  Remember to add your public key to $AUTH_KEYS"
else
  echo "✅ $AUTH_KEYS already exists, skipping"
fi

# ── Web directory ─────────────────────────────────────────────────────────────
WEB_DIR="/var/www/donbass-post-web"

mkdir -p "$WEB_DIR"
chown deploy:deploy "$WEB_DIR"
chmod 755 "$WEB_DIR"
echo "✅ $WEB_DIR ready"

# ── Swap ──────────────────────────────────────────────────────────────────────
if [ "$SWAP_ENABLED" = true ]; then
  if swapon --show | grep -q "/swapfile"; then
    echo "✅ Swap already active, skipping"
  else
    if [ ! -f /swapfile ]; then
      echo "Configuring ${SWAP_SIZE} swap..."
      fallocate -l "$SWAP_SIZE" /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
    fi
    swapon /swapfile
    if ! grep -q "/swapfile" /etc/fstab; then
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo "✅ Swap configured (${SWAP_SIZE})"
  fi
else
  echo "⏭  Swap skipped (pass --swap or --swap 2G to enable)"
fi

echo ""
echo "✅ VPS setup complete"
echo "Next: add your deploy user's public SSH key to $AUTH_KEYS"
