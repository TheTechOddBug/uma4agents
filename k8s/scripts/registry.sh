#!/usr/bin/env bash
# A registry beside the cluster, and the containerd config that points at it.
#
# The alternative is `kind load docker-image`, which re-imports a whole image
# to every node on every change: six images across three nodes is a minute or
# two each time a line of app.py moves. A push to a local registry moves only
# the changed layers, in about two seconds.
#
# It also makes imagePullPolicy mean something real rather than being a
# fiction the lab quietly relies on, which matters for a deployment whose
# whole purpose is to be read as reference material.
set -euo pipefail

REGISTRY_NAME=u4a-registry
REGISTRY_PORT=5001
CLUSTER=uma4agents

if [ "$(docker inspect -f '{{.State.Running}}' "$REGISTRY_NAME" 2>/dev/null || true)" != "true" ]; then
  docker run -d --restart=always -p "127.0.0.1:${REGISTRY_PORT}:5000" \
    --name "$REGISTRY_NAME" registry:2 >/dev/null
  echo "  registry started on localhost:${REGISTRY_PORT}"
else
  echo "  registry already running"
fi

# Each node needs a hosts.toml telling containerd where localhost:5001 is.
# The cluster config already sets config_path; this is the other half.
for node in $(kind get nodes --name "$CLUSTER"); do
  docker exec "$node" mkdir -p "/etc/containerd/certs.d/localhost:${REGISTRY_PORT}"
  docker exec -i "$node" cp /dev/stdin \
    "/etc/containerd/certs.d/localhost:${REGISTRY_PORT}/hosts.toml" <<EOF
[host."http://${REGISTRY_NAME}:5000"]
  capabilities = ["pull", "resolve"]
EOF
done

# The registry has to share the kind network for the nodes to reach it by name.
if ! docker network inspect kind -f '{{range .Containers}}{{.Name}} {{end}}' \
     2>/dev/null | grep -q "$REGISTRY_NAME"; then
  docker network connect kind "$REGISTRY_NAME" 2>/dev/null || true
fi

echo "  nodes can pull from localhost:${REGISTRY_PORT}"
