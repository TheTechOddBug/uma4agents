"""Sterling & Vance — the public web presence of the firm that operates Bob's agent.

Both of the identity conventions this lab adopts assume the requesting side has
somewhere on the web that speaks for it, and neither works without one:

  /agent.json
      A Client ID Metadata Document (draft-ietf-oauth-client-id-metadata-document),
      the mechanism MCP now prefers over Dynamic Client Registration. Alice's
      approval dialog resolves this to show an operator and a policy URI
      instead of a bare key thumbprint. Display metadata only — her AS still
      keys the connection by the agent's key or its verified issuer, so
      nothing here can widen access.

  /.well-known/http-message-signatures-directory
      A Web Bot Auth key directory (draft-meunier-http-message-signatures-directory):
      a JWKS of the keys this operator's agents sign with. A resource that has
      never met this agent can fetch it and learn the key belongs to a
      published operator — which is the RqP != RO cold-start problem, since by
      definition there is no prior relationship to lean on.

The keys served here are registered at runtime by the agents themselves
(POST /register), because in this lab they are generated per-run. A real
operator would publish keys it already holds.
"""

import json
import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

ORIGIN = os.environ.get("AGENT_OPERATOR_ORIGIN", "https://agent.uma.lab")
NAME = os.environ.get("AGENT_OPERATOR_NAME", "Sterling & Vance — Advisory Agent")

app = FastAPI(title="agent-operator")

# keyid -> JWK, registered by the operator's own agents at startup.
KEYS: dict[str, dict] = {}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "keys": len(KEYS)}


@app.get("/agent.json")
async def client_id_metadata() -> JSONResponse:
    """The CIMD document. `client_id` MUST equal the URL this is served from —
    that self-reference is what stops one site publishing metadata about
    another's client, and Alice's AS rejects the document if it disagrees."""
    return JSONResponse({
        "client_id": f"{ORIGIN}/agent.json",
        "client_name": NAME,
        "client_uri": ORIGIN,
        "policy_uri": f"{ORIGIN}/privacy",
        "tos_uri": f"{ORIGIN}/terms",
        "contacts": ["advisory-ops@sterling-vance.example"],
        "software_id": "uma4agents-agent-shim",
    })


@app.get("/.well-known/http-message-signatures-directory")
async def signatures_directory() -> JSONResponse:
    """Web Bot Auth key directory: a JWKS under a dedicated media type."""
    return JSONResponse(
        {"keys": list(KEYS.values())},
        media_type="application/http-message-signatures-directory+json",
    )


@app.post("/register")
async def register(request: Request) -> dict:
    """Lab-only: an agent publishes the key it is about to sign with.

    Real operators publish keys they already hold; this exists because the
    lab's agent keys are generated per run. It is deliberately unauthenticated
    and local-only — nothing downstream trusts this directory for
    authorization, only for discovery.
    """
    body = await request.json()
    jwk = body.get("jwk") or {}
    keyid = body.get("keyid") or jwk.get("kid")
    if not keyid or not jwk:
        return {"registered": False, "error": "keyid and jwk required"}
    KEYS[keyid] = {**jwk, "kid": keyid}
    print(json.dumps({"event": "agent_key.published", "keyid": keyid}), flush=True)
    return {"registered": True, "keyid": keyid, "keys": len(KEYS)}
