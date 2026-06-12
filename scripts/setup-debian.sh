#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Provisioning script for a fresh Debian VPS (Donbass Post project)
#
# Usage (as root):
#   curl -fsSL https://raw.githubusercontent.com/lavet13/_donbass-post/main/scripts/setup-debian.sh \
#     | bash -s -- [--swap [SIZE]] [--ssh-port PORT] [--harden-ssh]
#
# Examples:
#   bash setup-debian.sh                          → no swap, SSH port 22, no hardening
#   bash setup-debian.sh --swap                   → 1G swap (default size)
#   bash setup-debian.sh --swap 2G                → 2G swap (rule of thumb: =RAM up to
#                                                   2GB RAM, half of RAM above that)
#   bash setup-debian.sh --ssh-port 10022         → firewall allows SSH on 10022
#   bash setup-debian.sh --harden-ssh             → disable root login + passwords
#                                                   (REQUIRES a public key already
#                                                   added to a user's authorized_keys)
# ==============================================================================

# == Argument parsing ==========================================================
SWAP_ENABLED=false
SWAP_SIZE="1G"
SSH_PORT="22"
HARDEN_SSH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --swap)
      SWAP_ENABLED=true
      if [[ -n "${2-}" && "${2}" != --* ]]; then
        SWAP_SIZE="${2^^}"
        shift
      fi
      shift
      ;;
    --ssh-port)
      if [[ -n "${2-}" && "${2}" != --* ]]; then
        SSH_PORT="$2"
        shift
      else
        echo "❌ --ssh-port requires a value (e.g. --ssh-port 10022)"
        exit 1
      fi
      shift
      ;;
    --harden-ssh)
      HARDEN_SSH=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: bash setup-debian.sh [--swap [SIZE]] [--ssh-port PORT] [--harden-ssh]"
      exit 1
      ;;
  esac
done

# == Require root ==============================================================
if [[ "$(id -u)" -ne 0 ]]; then
  echo "❌ This script must be run as root"
  exit 1
fi

# == Sanity check: this script targets Debian only =============================
DISTRO_ID="$(. /etc/os-release && echo "$ID")"
if [[ "$DISTRO_ID" != "debian" ]]; then
  echo "❌ This script targets Debian, but detected: $DISTRO_ID"
  echo "   Write a separate setup-${DISTRO_ID}.sh for that distro."
  exit 1
fi

# == System update =============================================================
echo "Updating package index..."
apt update -y
apt upgrade -y
echo "✅ System updated"

# == Remove conflicting packages ===============================================
echo "Removing any conflicting Docker packages..."
apt remove -y docker.io docker-compose docker-doc podman-docker containerd runc 2>/dev/null || true
echo "✅ Conflicting packages removed (or were not installed)"

# == Install Docker via official apt repository ================================
if command -v docker &>/dev/null; then
  echo "✅ Docker already installed ($(docker --version)), skipping"
else
  echo "Installing Docker..."

  apt install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings

  curl -fsSL https://download.docker.com/linux/debian/gpg \
    -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

  apt update -y
  apt install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

  systemctl enable docker
  systemctl start docker
  echo "✅ Docker installed ($(docker --version))"
fi

# == Firewall (UFW) ============================================================
# NOTE: ports PUBLISHED by Docker (80/443 from nginx-certbot) bypass UFW —
# Docker inserts its own iptables rules ahead of UFW's. UFW still protects
# the SSH port and every non-Docker service on the host.
if ! command -v ufw &>/dev/null; then
  echo "Installing UFW..."
  apt install -y ufw
fi

ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable   # --force skips the interactive "may disrupt ssh" prompt
echo "✅ Firewall enabled (allowed: SSH ${SSH_PORT}, 80, 443)"

# == Helper: create a user with an SSH directory ===============================
# Arguments:
#   $1 — username
#   $2 — extra group to add the user to (e.g. "docker" or "sudo")
create_user_with_ssh() {
  local username="$1"
  local extra_group="$2"
  local ssh_dir="/home/${username}/.ssh"
  local auth_keys="${ssh_dir}/authorized_keys"

  if id "$username" &>/dev/null; then
    echo "✅ User '$username' already exists, skipping creation"
  else
    echo "Creating user '$username'..."
    adduser --disabled-password --gecos "" "$username"
    echo "✅ User '$username' created"
  fi

  usermod -aG "$extra_group" "$username"
  echo "✅ User '$username' added to '$extra_group' group"

  mkdir -p "$ssh_dir"
  chmod 700 "$ssh_dir"
  chown "${username}:${username}" "$ssh_dir"

  if [[ ! -f "$auth_keys" ]]; then
    touch "$auth_keys"
    chmod 600 "$auth_keys"
    chown "${username}:${username}" "$auth_keys"
    echo "✅ Created $auth_keys"
    echo "⚠  Remember to add a public key to $auth_keys"
  else
    echo "✅ $auth_keys already exists, skipping"
  fi
}

# == Users =====================================================================
# deploy   — unprivileged CI user; can run Docker, no sudo
# splinter — admin user with sudo for manual maintenance
create_user_with_ssh "deploy" "docker"
create_user_with_ssh "splinter" "sudo"

# == Web directory =============================================================
WEB_DIR="/var/www/donbass-post-web"
mkdir -p "$WEB_DIR"
chown deploy:deploy "$WEB_DIR"
chmod 755 "$WEB_DIR"
echo "✅ $WEB_DIR ready"

# == Swap ======================================================================
if [[ "$SWAP_ENABLED" = true ]]; then
  if swapon --show | grep -q "/swapfile"; then
    echo "✅ Swap already active, skipping"
  else
    if [[ ! -f /swapfile ]]; then
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

# == SSH hardening (opt-in) ====================================================
if [[ "$HARDEN_SSH" = true ]]; then
  # Safety guard: refuse to disable passwords unless at least one user
  # already has a non-empty authorized_keys — otherwise you lock yourself out.
  if [[ -s /home/deploy/.ssh/authorized_keys || -s /home/splinter/.ssh/authorized_keys ]]; then
    # -s tests "file exists AND is non-empty"

    # sed -i edits the file in place:
    #   s/pattern/replacement/  — substitute
    #   ^#\?  — line start, optional leading # (handles commented defaults)
    sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

    # Validate config before reloading — a broken sshd_config + reload
    # could kill SSH entirely
    if sshd -t; then
      systemctl reload sshd
      echo "✅ SSH hardened (root login + password auth disabled)"
      echo "⚠  Keep your current session open and verify key login works"
      echo "   from a SECOND terminal before disconnecting!"
    else
      echo "❌ sshd config validation failed — NOT reloading, fix manually"
      exit 1
    fi
  else
    echo "❌ Refusing to harden SSH: no public key found in any authorized_keys."
    echo "   Add a key first, then re-run with --harden-ssh"
    exit 1
  fi
else
  echo "⏭  SSH hardening skipped (pass --harden-ssh after adding public keys)"
fi

# == Summary ===================================================================
echo ""
echo "✅ VPS setup complete"
echo ""
echo "── Manual steps remaining ────────────────────────────────────────────"
echo ""
echo "1. Generate keypairs on your LOCAL machine:"
echo "     ssh-keygen -t ed25519 -C github-actions-deploy -f ~/.ssh/deploy_key"
echo "     ssh-keygen -t ed25519 -C splinter-admin -f ~/.ssh/splinter_key"
echo ""
echo "2. Add the PUBLIC keys on this server:"
echo "     deploy:   /home/deploy/.ssh/authorized_keys"
echo "     splinter: /home/splinter/.ssh/authorized_keys"
echo ""
echo "3. GitHub repository secrets (Settings → Secrets and variables → Actions):"
echo "     VPS_HOST      — this server's public IP"
echo "     VPS_SSH_PORT  — ${SSH_PORT}"
echo "     VPS_USERNAME  — deploy"
echo "     VPS_SSH_KEY   — full contents of the PRIVATE key (~/.ssh/deploy_key),"
echo "                     including BEGIN/END lines"
echo ""
echo "4. Verify key-based login from a second terminal, then re-run this"
echo "   script with --harden-ssh to disable root login and password auth"
echo ""
echo "5. Push a commit (or run workflow_dispatch) to trigger the first deploy"
