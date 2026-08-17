#!/usr/bin/env bash
# The kagent path: an agent framework nobody modified, governed by Alice.
#
# Everything the lab shows elsewhere drives the grant from code in this repo.
# This installs kagent's controller, gives it a model, points it at the U4A
# adapter running in Bob's namespace, and asks it a question — so what proves
# the claim is a framework we did not write, calling tools it believes are
# ordinary, and being held to Alice's terms anyway.
#
# Opt-in, because a model is a real cost: either a container that pulls a
# couple of gigabytes, or an account somewhere.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
K8S="$ROOT/k8s"
# shellcheck disable=SC1091
source "$K8S/platform/versions.env"

bold() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

model_config() {
  local model="$1"
  case "$model" in
    ollama)
      bold "A model in the cluster (ollama, no account anywhere)"
      kubectl apply -f "$K8S/components/kagent/model-ollama.yaml" >/dev/null
      printf '  pulling the model, which takes a few minutes the first time'
      kubectl -n kagent rollout status deploy/ollama --timeout=900s >/dev/null
      echo "  ready"
      ;;
    anthropic|openai)
      local var key provider name
      if [ "$model" = anthropic ]; then
        var=ANTHROPIC_API_KEY; provider=Anthropic; name="claude-sonnet-4-5-20250929"
      else
        var=OPENAI_API_KEY;    provider=OpenAI;    name="gpt-4o-mini"
      fi
      key="${!var:-}"
      if [ -z "$key" ]; then
        echo "  $var is not set in your environment." >&2
        echo "  Either export it, or run 'make kagent' for the local model." >&2
        exit 1
      fi
      bold "A hosted model ($provider)"
      # The key goes from your shell into a Secret and nowhere else. It is not
      # written to this repository and not echoed.
      kubectl -n sterling-vance create secret generic u4a-model-key \
        --from-literal=api-key="$key" --dry-run=client -o yaml | kubectl apply -f - >/dev/null
      MODEL_PROVIDER="$provider" MODEL_NAME="$name" \
        envsubst < "$K8S/components/kagent/model-cloud.yaml" | kubectl apply -f - >/dev/null
      echo "  ready"
      ;;
    *)
      echo "unknown MODEL=$model (want: ollama, anthropic, openai)" >&2; exit 1 ;;
  esac
}

up() {
  local model="${1:-ollama}"

  bold "kagent controller $KAGENT_VERSION"
  # The chart ships a dozen sample agents — k8s, istio, helm, cilium, argo.
  # Every one of them wants a model, so on a cluster with no provider
  # configured they sit in CreateContainerConfigError and `--wait` blocks
  # until it times out. We are bringing our own agent and our own model, so
  # they are off. This is the same "an Agent needs a model" cost the lab
  # avoids by making the whole path opt-in.
  helm upgrade --install kagent oci://ghcr.io/kagent-dev/kagent/helm/kagent \
    --namespace kagent --create-namespace \
    --version "$KAGENT_VERSION" \
    --set k8s-agent.enabled=false \
    --set kgateway-agent.enabled=false \
    --set istio-agent.enabled=false \
    --set promql-agent.enabled=false \
    --set observability-agent.enabled=false \
    --set argo-rollouts-agent.enabled=false \
    --set helm-agent.enabled=false \
    --set cilium-policy-agent.enabled=false \
    --set cilium-manager-agent.enabled=false \
    --set cilium-debug-agent.enabled=false \
    --set querydoc.enabled=false \
    --wait --timeout 10m >/dev/null
  # Every namespace in this lab is enrolled in ambient, so that what calls
  # what is attested rather than merely reachable. Helm created this one, so
  # it misses the label the others get from k8s/base/namespaces — and without
  # it the controller's calls arrive with no identity, which a `principals`
  # rule cannot match. That is the trap KUBERNETES.md lists, met again.
  kubectl label namespace kagent istio.io/dataplane-mode=ambient --overwrite >/dev/null
  kubectl -n kagent rollout restart deploy/kagent-controller >/dev/null
  kubectl -n kagent rollout status deploy/kagent-controller --timeout=300s >/dev/null
  echo "  ready"

  bold "The U4A adapter, in Bob's namespace"
  # The same shim Bob runs beside Claude Code, as a service. It holds his key
  # and runs the four beats; the agent above it sees ordinary MCP.
  "$K8S/scripts/job-configmaps.sh"
  kubectl apply -f "$K8S/base/sterling-vance/agent-shim.yaml" >/dev/null
  # After the apply, because the manifest's own replicas: 0 is what keeps a
  # cold cluster on the portal demo.
  kubectl -n sterling-vance scale deploy/agent-shim --replicas=1 >/dev/null
  kubectl -n sterling-vance rollout status deploy/agent-shim --timeout=300s >/dev/null
  echo "  ready"

  model_config "$model"

  bold "Bob's agent, as a kagent Agent"
  kubectl apply -f "$K8S/components/kagent/agent.yaml" >/dev/null
  kubectl -n sterling-vance wait --for=condition=Accepted --timeout=300s \
    agent/advisory-agent >/dev/null 2>&1 || true
  kubectl -n sterling-vance rollout status deploy/advisory-agent --timeout=300s >/dev/null 2>&1 || true
  echo "  ready"

  printf '\n  Ask it something:  make kagent-check\n'
  printf '  Alice decides in her portal, as always.\n'
}

check() {
  bold "Asking Bob's agent for Alice's holdings"
  echo "  Her policy holds a first contact, so approve it in her portal —"
  echo "  or let the demo driver's simulated Alice answer, as it does headless."
  kubectl -n sterling-vance delete job kagent-ask --ignore-not-found >/dev/null 2>&1
  kubectl apply -f "$K8S/base/jobs/kagent-ask.yaml" >/dev/null
  kubectl -n sterling-vance wait --for=condition=complete --timeout=600s \
    job/kagent-ask >/dev/null 2>&1 || true
  kubectl -n sterling-vance logs job/kagent-ask --tail=60
}

down() {
  kubectl delete -f "$K8S/components/kagent/agent.yaml" --ignore-not-found >/dev/null 2>&1 || true
  kubectl -n sterling-vance scale deploy/agent-shim --replicas=0 >/dev/null 2>&1 || true
  echo "==> kagent stopped; the adapter is scaled back to zero"
}

case "${1:-up}" in
  up)    up "${2:-ollama}" ;;
  check) check ;;
  down)  down ;;
  *)     echo "usage: kagent.sh up|check|down [model]" >&2; exit 1 ;;
esac
