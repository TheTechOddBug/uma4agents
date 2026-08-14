#!/usr/bin/env bash
#
# Publish Alice's portal to a browser tab in a Codespace.
#
# The lab serves everything under *.uma.lab behind an edge that routes by
# hostname, which a browser outside the VM cannot resolve. Inside the VM it
# can — /etc/hosts is written at create time — so the terminal half of the
# lab needs none of this. Only the browser does.
#
# Two things happen here.
#
# 1. Port-forwards. Alice's portal and her identity provider both serve plain
#    HTTP inside the cluster (9010 and 8080) because the edge terminates TLS
#    for them. That is exactly the shape Codespaces port forwarding wants, so
#    they are forwarded directly rather than through the edge. Her browser
#    session never traverses the enforcement point, so nothing the lab is
#    demonstrating is bypassed — agent traffic still goes through the gateway.
#
# 2. Origin rewriting. OIDC ties the issuer, the browser redirect and the
#    token's `iss` claim together, and all three currently name
#    keycloak.uma.lab. In a Codespace the browser reaches a github.dev
#    address instead, so Keycloak is told its public origin, the portal is
#    told to expect it, and the realm client is taught to accept a redirect
#    back to it.
set -euo pipefail

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m !\033[0m %s\n' "$*"; }

if [ -z "${CODESPACE_NAME:-}" ]; then
  warn "Not running in a Codespace — nothing to expose."
  warn "Locally the lab is reachable at https://portal.uma.lab after 'make dns-setup'."
  exit 0
fi

DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
PORTAL_URL="https://${CODESPACE_NAME}-9010.${DOMAIN}"
KEYCLOAK_URL="https://${CODESPACE_NAME}-8080.${DOMAIN}"

log "Portal   ${PORTAL_URL}"
log "Keycloak ${KEYCLOAK_URL}"

# --- 1. tell the pieces what the browser will call them ---------------------
# Keycloak already runs with KC_PROXY_HEADERS=xforwarded because the edge
# terminates TLS; this only changes which origin it advertises.
log "Pointing Keycloak and the portal at the forwarded origins"
kubectl -n alice set env deploy/keycloak "KC_HOSTNAME=${KEYCLOAK_URL}" >/dev/null
kubectl -n alice set env deploy/alice-portal \
  "OIDC_ISSUER=${KEYCLOAK_URL}/realms/alice" >/dev/null

kubectl -n alice rollout status deploy/keycloak --timeout=180s
kubectl -n alice rollout status deploy/alice-portal --timeout=180s

# --- 2. let the realm redirect back to the forwarded portal -----------------
# Patched through the admin API rather than the realm ConfigMap: the import
# only runs on a first start, so editing the ConfigMap would need the realm
# wiped to take effect.
log "Allowing the portal's forwarded origin as a redirect target"
# Read from the deployment rather than assuming: this is a documented demo
# credential set as a plain env value, not a Secret, and guessing a Secret
# name here would fail silently into a fallback that only looked correct.
KC_ADMIN_PASS="$(kubectl -n alice get deploy/keycloak -o jsonpath=\
'{.spec.template.spec.containers[0].env[?(@.name=="KC_BOOTSTRAP_ADMIN_PASSWORD")].value}')"
KC_ADMIN_USER="$(kubectl -n alice get deploy/keycloak -o jsonpath=\
'{.spec.template.spec.containers[0].env[?(@.name=="KC_BOOTSTRAP_ADMIN_USERNAME")].value}')"

kubectl -n alice exec deploy/keycloak -- sh -c "
  /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8080 --realm master \
    --user '${KC_ADMIN_USER}' --password '${KC_ADMIN_PASS}' >/dev/null &&
  CID=\$(/opt/keycloak/bin/kcadm.sh get clients -r alice \
    -q clientId=alice-portal --fields id --format csv --noquotes | tail -n1) &&
  /opt/keycloak/bin/kcadm.sh update clients/\$CID -r alice \
    -s 'redirectUris=[\"${PORTAL_URL}/*\",\"https://portal.uma.lab/*\"]' \
    -s 'webOrigins=[\"${PORTAL_URL}\",\"https://portal.uma.lab\"]'
" || warn "Realm patch failed — sign-in will bounce. See the note in docs/KUBERNETES.md."

# --- 3. forward the ports ---------------------------------------------------
log "Forwarding 9010 and 8080"
pkill -f 'kubectl.*port-forward.*(alice-portal|keycloak)' 2>/dev/null || true
nohup kubectl -n alice port-forward --address 127.0.0.1 svc/alice-portal 9010:9010 \
  >/tmp/pf-portal.log 2>&1 &
nohup kubectl -n alice port-forward --address 127.0.0.1 svc/keycloak 8080:8080 \
  >/tmp/pf-keycloak.log 2>&1 &
sleep 3

log "Open ${PORTAL_URL} and sign in as alice / alice-demo"
cat <<'EOF'
   The forwarded ports stay private, which is what you want: this lab ships
   fixed development credentials, and a public port puts them on the open
   internet behind nothing but an unguessable URL. Private ports are reachable
   from your own browser because you are signed in to GitHub — making them
   public is only for showing someone else, and is a deliberate choice.

EOF
