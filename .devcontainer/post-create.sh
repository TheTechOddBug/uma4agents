#!/usr/bin/env bash
#
# Prepare a Codespace to run the Kubernetes lab.
#
# Two jobs: install the one tool the devcontainer features do not provide,
# and make *.uma.lab resolve. Everything else is left to `make kind-up`, so
# what runs here is the same path the README documents rather than a
# Codespaces-only shortcut that could drift from it.
set -euo pipefail

log() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }

# --- kind ------------------------------------------------------------------
# Not available as a devcontainer feature, so fetch the released binary. The
# version is pinned in k8s/platform/versions.env with everything else, which
# is the file to change rather than this one.
if ! command -v kind >/dev/null 2>&1; then
  KIND_VERSION="$(grep -E '^KIND_VERSION=' k8s/platform/versions.env 2>/dev/null | cut -d= -f2 || true)"
  KIND_VERSION="${KIND_VERSION:-v0.30.0}"
  log "Installing kind ${KIND_VERSION}"
  curl -fsSL -o /tmp/kind \
    "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64"
  sudo install -m 0755 /tmp/kind /usr/local/bin/kind
  rm -f /tmp/kind
fi

# --- *.uma.lab -------------------------------------------------------------
# The lab serves everything under uma.lab, and kind publishes the edge on
# 127.0.0.1:443. On macOS `make dns-setup` writes /etc/resolver/uma.lab and
# points it at the in-cluster DNS; a Codespace has no resolver directory and
# no need for one — we have root, so /etc/hosts is simpler and does the same
# job for every name the routes define.
HOSTS="admin.uma.lab agent.uma.lab alice-as.uma.lab gateway.uma.lab \
keycloak.uma.lab ns.uma.lab portal.uma.lab ps.uma.lab grafana.uma.lab"

if ! grep -q 'uma\.lab' /etc/hosts; then
  log "Mapping *.uma.lab to 127.0.0.1 in /etc/hosts"
  {
    echo ""
    echo "# UMA for Agents lab — the edge is published on 127.0.0.1 by kind."
    echo "127.0.0.1 ${HOSTS}"
  } | sudo tee -a /etc/hosts >/dev/null
fi

# --- where things will be -------------------------------------------------
# The forwarded URL is derived from the Codespace name, so it can be printed
# before anything is listening. Otherwise the only way to learn it is to run
# `make codespaces-web` and read the output, or hunt through the PORTS tab
# after a port happens to open.
CS_NAME="${CODESPACE_NAME:-}"
if [ -z "$CS_NAME" ] && [ -d /workspaces/.codespaces/shared ]; then
  CS_NAME="$(grep -rhoE '^CODESPACE_NAME=[A-Za-z0-9-]+$' \
    /workspaces/.codespaces/shared/.env* 2>/dev/null | head -1 | cut -d= -f2 || true)"
fi
DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

log "Ready. Next:"
cat <<'EOF'

  make kind-up          bring up the cluster and the whole stack  (~13 min)
  make k8s-smoke-test   verify it — expect 13 passed, 0 failed
  make k8s-demo-all     walk Alice's whole day
  make codespaces-web   publish Alice's portal to a browser tab

EOF

if [ -n "$CS_NAME" ]; then
  printf '  Alice'"'"'s portal will be at, once you run `make codespaces-web`:\n\n'
  printf '    \033[1mhttps://%s-9010.%s\033[0m\n\n' "$CS_NAME" "$DOMAIN"
  printf '  Sign in as alice / alice-demo. The same link appears in the PORTS\n'
  printf '  tab and in that command'"'"'s output, so there are three ways to find it.\n\n'
fi

printf '  START-HERE.md and docs/KUBERNETES.md should already be open beside this\n'
printf '  terminal. If not, open START-HERE.md and follow it from step 1.\n\n'
