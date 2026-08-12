#!/usr/bin/env bash
# Merge the uma.lab server block into kube-system's CoreDNS Corefile.
#
# kind ships plain CoreDNS with no import directory to drop a file into, so
# the honest way in is to edit the ConfigMap and restart the deployment. It
# takes about five seconds and it is idempotent: the block is keyed by a
# marker comment and replaced wholesale if it is already there.
#
# Why this is needed at all is in k8s/base/edge/coredns-rewrite.yaml — the
# short version is that the authorization server has to dereference the
# resource server's *public* identifier from inside the cluster, because a
# pulled copy fetched over a shortcut proves nothing about what is published.
set -euo pipefail

MARKER="# BEGIN u4a uma.lab"
END_MARKER="# END u4a uma.lab"

block=$(kubectl -n uma-edge get configmap coredns-uma-lab -o jsonpath='{.data.uma-lab\.server}')

current=$(kubectl -n kube-system get configmap coredns -o jsonpath='{.data.Corefile}')

# Strip any block we added previously, so re-running replaces rather than
# appends.
cleaned=$(printf '%s\n' "$current" | awk -v b="$MARKER" -v e="$END_MARKER" '
  index($0, b) { skip = 1 }
  !skip { print }
  index($0, e) { skip = 0 }
')

merged=$(printf '%s\n%s\n%s\n%s\n' "$cleaned" "$MARKER" "$block" "$END_MARKER")

if [ "$merged" = "$current" ]; then
  echo "  CoreDNS already carries the uma.lab block"
  exit 0
fi

kubectl -n kube-system create configmap coredns \
  --from-literal=Corefile="$merged" \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null

kubectl -n kube-system rollout restart deployment/coredns >/dev/null
kubectl -n kube-system rollout status deployment/coredns --timeout=90s >/dev/null
echo "  CoreDNS now resolves *.uma.lab to the edge"
