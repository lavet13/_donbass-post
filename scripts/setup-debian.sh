#!/usr/bin/env bash

set -e # Exit immediately if any command fails (returns non-zero exit code)

# == Argument parsing ==========================================================
# Usage: bash scripts/setup-debian.sh [--swap [SIZE]]
# Examples:
#   bash scripts/setup-debian.sh            → no swap
#   bash scripts/setup-debian.sh --swap     → 1G swap (default)
#   bash scripts/setup-debian.sh --swap 2G  → 2G swap

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
      echo "Usage: bash scripts/setup-debian.sh [--swap [SIZE]]"
      exit 1
      ;;
  esac
done

# == Require root ==============================================================
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ This script must be run as root (use sudo)"
  exit 1
fi

# == System update =============================================================
echo "Updating package index..."
apt update -y
apt upgrade -y
echo "✅ System updated"

# == Remove conflicting packages ===============================================
# These are unofficial Docker packages that conflict with the official ones.
# apt remove is safe to run even if packages aren't installed — it just skips them.
echo "Removing any conflicting Docker packages..."
apt remove -y docker.io docker-compose docker-doc podman-docker containerd runc 2>/dev/null || true
echo "✅ Conflicting packages removed (or were not installed)"

# == Install Docker via official apt repository ================================
# This follows the official Docker documentation for Debian exactly.
# We check first so the script is safe to re-run (idempotent).
if command -v docker &>/dev/null; then
  echo "✅ Docker already installed ($(docker --version)), skipping"
else
  echo "Installing Docker..."

  # Install prerequisites needed to add the Docker apt repository
  apt install -y ca-certificates curl

  # Create the keyrings directory with correct permissions
  # -m 0755: directory readable by all, writable only by root
  install -m 0755 -d /etc/apt/keyrings

  # Download Docker's official GPG key — used to verify package authenticity
  curl -fsSL https://download.docker.com/linux/debian/gpg \
    -o /etc/apt/keyrings/docker.asc

  # Make the key readable by all users (apt needs to read it)
  chmod a+r /etc/apt/keyrings/docker.asc

  # Add the Docker apt repository using the DEB822 format
  # $(. /etc/os-release && echo "$VERSION_CODENAME") reads the Debian version
  # codename (e.g. "bookworm") from the OS release file
  tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

  # Refresh package index to include the new Docker repository
  apt update -y

  # Install Docker Engine, CLI, containerd, and Compose plugin
  # docker-ce:              Docker daemon
  # docker-ce-cli:          docker command line tool
  # containerd.io:          container runtime Docker uses internally
  # docker-buildx-plugin:   extended build capabilities (multi-platform etc.)
  # docker-compose-plugin:  docker compose v2 (the "docker compose" command)
  apt install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

  # Enable and start Docker so it runs on boot
  systemctl enable docker
  systemctl start docker

  echo "✅ Docker installed ($(docker --version))"
fi

# == Deploy user ===============================================================
if id "deploy" &>/dev/null; then
  echo "✅ User 'deploy' already exists, skipping creation"
else
  echo "Creating user 'deploy'..."
  adduser --disabled-password --gecos "" deploy
  echo "✅ User 'deploy' created"
fi

# Add to docker group — safe to run multiple times, no duplicate membership
usermod -aG docker deploy
echo "✅ User 'deploy' added to docker group"

# == SSH directory =============================================================
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

# == Web directory =============================================================
WEB_DIR="/var/www/donbass-post-web"

mkdir -p "$WEB_DIR"
chown deploy:deploy "$WEB_DIR"
chmod 755 "$WEB_DIR"
echo "✅ $WEB_DIR ready"

# == Swap ======================================================================
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

# == Summary ===================================================================
echo ""
echo "✅ VPS setup complete"
echo ""
echo "Next steps:"
echo "  1. Add your deploy user's public SSH key to $AUTH_KEYS"
echo "  2. Update VPS_USERNAME secret in GitHub to 'deploy'"
echo "  3. Push a commit to trigger the first deployment"
