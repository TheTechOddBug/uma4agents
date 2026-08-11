#!/usr/bin/env bash
# Does the ext_authz contract survive the move from a config file to CRDs?
#
# The enforcement core decides from request facts. Under the file-driven
# gateway those facts arrive because of three settings in gateway/agw.yaml.
# On Kubernetes the same three settings exist under different names on a
# different resource. This asserts, against a live cluster, that what the
# authorization service receives is unchanged.
#
# Run with:  make k8s-verify-extauth
set -uo pipefail

NS=u4a-verify
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pass=0
fail=0

ok()   { printf '  ok   %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  FAIL %s — %s\n' "$1" "${2:-}"; fail=$((fail + 1)); }
step() { printf '\n==> %s\n' "$1"; }

step "Deploying the route, the backend, the policy and the recorder"
kubectl apply -f "$HERE/manifests.yaml" >/dev/null
kubectl -n "$NS" create configmap extauth-recorder \
  --from-file=recorder.py="$HERE/recorder.py" \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null
kubectl -n "$NS" rollout restart deploy/extauth-recorder >/dev/null 2>&1
kubectl -n "$NS" rollout status deploy/extauth-recorder --timeout=120s >/dev/null
kubectl -n "$NS" rollout status deploy/alice-vault-mcp  --timeout=120s >/dev/null
kubectl -n "$NS" wait --for=condition=Programmed gateway/meridian --timeout=120s >/dev/null
echo "  ready"

step "An unauthorized MCP tool call through the gateway"
# The body is what beat 1 is about: which tool, with which arguments.
REQ='{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_trade","arguments":{"symbol":"VTI","side":"sell","quantity":40}}}'
seen=$(kubectl -n "$NS" run extauth-probe-$RANDOM --rm -i --restart=Never -q \
  --image=curlimages/curl:latest --command -- \
  curl -sS -w '\nHTTP_STATUS:%{http_code}' \
    -X POST http://meridian.$NS.svc.cluster.local:8080/mcp \
    -H 'host: gateway.uma.lab' \
    -H 'authorization: PoP rpt_probe_token' \
    -H 'content-type: application/json' \
    -H 'mcp-protocol-version: 2026-07-28' \
    -H 'mcp-method: tools/call' \
    -H 'mcp-name: execute_trade' \
    -H 'signature: sig1=:dGVzdA==:' \
    -H 'signature-input: sig1=("@method" "@authority");created=1' \
    -H 'signature-agent: https://agent.uma.lab' \
    -H 'origin: https://agent.uma.lab' \
    -H 'traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01' \
    -d "$REQ" 2>/dev/null)

status=$(printf '%s' "$seen" | sed -n 's/.*HTTP_STATUS:\([0-9]*\).*/\1/p')
body=$(printf '%s' "$seen" | sed 's/HTTP_STATUS:[0-9]*//')

step "What the client saw"
[ "$status" = "403" ] && ok "the call is refused ($status)" \
                      || bad "the call is refused" "got status '$status'"
# Beat 1 *is* a denial body: the ticket and the AS location travel in it. A
# gateway that substitutes its own error page silently breaks the protocol.
printf '%s' "$body" | grep -q 'uma_challenge' \
  && ok "the challenge body reaches the client verbatim" \
  || bad "the challenge body reaches the client verbatim" "body was: $body"
printf '%s' "$body" | grep -q 'as_uri' \
  && ok "the AS location survives in that body" \
  || bad "the AS location survives in that body" "body was: $body"

step "What the authorization service received"
obs=$(kubectl -n "$NS" logs deploy/extauth-recorder --tail=200 \
        | grep '"event": "extauth.received"' | tail -1)
if [ -z "$obs" ]; then
  bad "the authorization service was called at all" "no observation recorded"
else
  # Single-quoted so the shell leaves it alone; the Python inside therefore
  # uses double quotes throughout.
  printf '%s' "$obs" | python3 -c '
import json, sys
d = json.load(sys.stdin)
h = d["headers"]
checks = []

# 1. The tool being called must be visible, or tier policy cannot be applied:
#    without the body every MCP request looks identical.
try:
    tool = json.loads(d["body"])["params"]["name"]
except Exception:
    tool = None
checks.append(("the JSON-RPC body arrives intact (the tool is legible)",
               tool == "execute_trade", "parsed tool=%r" % (tool,)))
checks.append(("the body is not truncated",
               h.get("x-envoy-auth-partial-body") != "true",
               "x-envoy-auth-partial-body was set"))

# 2. Proof-of-possession is unverifiable without these two.
for name in ("signature", "signature-input", "authorization"):
    checks.append((f"{name} is forwarded", bool(h.get(name)), "header absent"))

# 3. The PEP serves /check{path} so it can see the path the client asked for
#    rather than the callback path. The CEL is identical to the file config.
checks.append(("the path is rewritten to /check + the original path",
               d["path"] == "/check/mcp", "path was %r" % (d["path"],)))

# 4. Routing headers and trace context.
for name in ("mcp-method", "mcp-name", "mcp-protocol-version",
             "signature-agent", "origin", "traceparent"):
    checks.append((f"{name} is forwarded", bool(h.get(name)), "header absent"))

# 5. The one that does NOT survive, asserted so a future release cannot
#    change it without this failing. `host` is rewritten to the authorization
#    service address, so a PEP that read the authority from the request would
#    break here. This one reconstructs the RFC 9421 base from configuration
#    instead (lib/uma4a_pep.py:64) — a decision made for signature
#    correctness that turns out to be what makes it portable.
checks.append(("host is rewritten to the authz service, not forwarded",
               h.get("host", "").startswith("extauth-recorder"),
               "host was %r — if this now forwards the client Host, "
               "the finding has changed" % (h.get("host"),)))

for name, good, detail in checks:
    print(("  ok   " if good else "  FAIL ") + name +
          ("" if good else " — " + detail))
print("SUMMARY %d %d" % (sum(1 for _, g, _ in checks if g),
                         sum(1 for _, g, _ in checks if not g)))
' > /tmp/u4a-extauth-checks.txt 2>&1
  grep -v '^SUMMARY' /tmp/u4a-extauth-checks.txt
  summary=$(grep '^SUMMARY' /tmp/u4a-extauth-checks.txt || true)
  if [ -n "$summary" ]; then
    pass=$((pass + $(echo "$summary" | awk '{print $2}')))
    fail=$((fail + $(echo "$summary" | awk '{print $3}')))
  else
    bad "the observation could be parsed" "see /tmp/u4a-extauth-checks.txt"
  fi
fi

step "An oversized call: truncated or refused?"
# The CRD's own description for maxSize says a larger body "will be rejected
# with a response". It is not — the body is cut and forwarded with
# x-envoy-auth-partial-body set. That is a bypass shape (pad a call past the
# ceiling and the tool name disappears), so it is pinned here: if a future
# release starts genuinely rejecting, this fails and the finding is revisited.
kubectl -n "$NS" patch agentgatewaypolicy uma-enforcement --type=merge \
  -p '{"spec":{"traffic":{"extAuth":{"forwardBody":{"maxSize":64}}}}}' >/dev/null
sleep 8
BIG='{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"execute_trade","arguments":{"symbol":"VTI","side":"sell","quantity":40,"note":"padding that pushes this call past the sixty four byte ceiling"}}}'
kubectl -n "$NS" run extauth-big-$RANDOM --rm -i --restart=Never -q \
  --image=curlimages/curl:latest --command -- \
  curl -sS -o /dev/null -X POST http://meridian.$NS.svc.cluster.local:8080/mcp \
    -H 'content-type: application/json' -H 'mcp-method: tools/call' \
    -H 'mcp-name: execute_trade' -d "$BIG" >/dev/null 2>&1
sleep 2
big=$(kubectl -n "$NS" logs deploy/extauth-recorder --tail=200 \
        | grep '"event": "extauth.received"' | tail -1)
kubectl -n "$NS" patch agentgatewaypolicy uma-enforcement --type=merge \
  -p '{"spec":{"traffic":{"extAuth":{"forwardBody":{"maxSize":16384}}}}}' >/dev/null

if [ -z "$big" ]; then
  bad "an oversized call still reaches the authorization service" "nothing recorded"
else
  if printf '%s' "$big" | grep -q '"x-envoy-auth-partial-body": "true"'; then
    ok "an oversized body is truncated and flagged, not refused by the gateway"
    ok "the enforcement point is told, so it can fail closed for a stated reason"
  else
    bad "an oversized body is truncated and flagged" \
        "x-envoy-auth-partial-body absent — the gateway's behaviour has changed"
  fi
fi

printf '\nk8s-verify-extauth: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
