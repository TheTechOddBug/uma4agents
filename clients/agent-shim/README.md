# agent-shim

Lets an **unmodified agent** act as Bob's requesting agent against Alice's
vault. Any MCP client will do — the shim is a plain stdio MCP server, so
whatever launches MCP servers for your agent can launch this one.

It is to UMA-for-agents what `mcp-remote` is to MCP OAuth: it holds the
agent's signing key, signs every request (RFC 9421), and runs the four-beat
grant when the gateway challenges — surfacing Alice's dictated terms for Bob
to accept.

Your agent needs to know nothing about any of that. It calls a tool; the shim
does the negotiating.

## Connect any MCP client

Almost every client reads the same shape, in some file of its own —
`claude_desktop_config.json`, `.cursor/mcp.json`, `.vscode/mcp.json`,
`~/.codeium/windsurf/mcp_config.json`, and so on:

```json
{
  "mcpServers": {
    "alice-vault": {
      "command": "uv",
      "args": [
        "run", "--with", "mcp>=2,<3", "--with", "httpx", "--with", "pyjwt[crypto]",
        "python", "/ABS/PATH/uma4agents/clients/agent-shim/shim.py"
      ],
      "env": {
        "PYTHONPATH": "/ABS/PATH/uma4agents/lib",
        "UMA4A_CACERT": "/ABS/PATH/uma4agents/certs/rootCA.pem"
      }
    }
  }
}
```

**Use absolute paths.** Clients launch servers from a working directory of
their own choosing, and it is rarely the repo root.

Then ask your agent something like *"what's in Alice's portfolio?"*. The first
tool call is challenged, and the grant is negotiated in front of you.

### Which CA

The two labs issue their own, in different places:

| Lab | `UMA4A_CACERT` |
|---|---|
| compose (`make up`) | `certs/rootCA.pem`, written by `make init` |
| Kubernetes (`make kind-up`) | `/tmp/u4a-k8s-ca.pem`, after `make k8s-trust-ca` |

The Kubernetes path has no `make init` and puts no certificate on your
machine — cert-manager issues the CA inside the cluster, and `k8s-trust-ca`
exports a copy.

### You are a different party than Bob

This is the interesting part. Bob's agent already exists in the demo, with a
key of its own. Yours gets its own key on first run — and a pseudonymous
agent **is** its key, so Alice's authorization server derives the connection
handle from its RFC 7638 thumbprint. Different key, different agent.

Which means Alice treats you as a stranger, correctly:

- Your first request **pends**, whatever the tier and whatever she has already
  agreed with Bob. She has never met your agent.
- Once approved, it appears beside Bob's in **Connected Agents** in her
  portal, with its own terms and its own trail in the ledger.
- She can revoke yours and leave his alone, or the reverse.

You are not borrowing Bob's relationship. You are negotiating your own, and
watching her policy decide about you specifically. To run several distinct
agents, give each its own `UMA4A_KEYSTORE` — that is the whole of what makes
them different parties.

### If your lab is in a Codespace

Run the agent **inside** the Codespace. The lab answers to `gateway.uma.lab`
only from within that machine, and the edge routes by hostname, so forwarding
a port will not stand in for it — the forwarded name is not one the edge has
a route for.

Anything that runs in a terminal there works, as does an editor connected to
the Codespace, since it launches MCP servers inside the container. Use
`/workspaces/uma4agents/...` as the absolute path, and the Kubernetes CA:

```bash
make k8s-trust-ca      # writes /tmp/u4a-k8s-ca.pem
```

## What varies between clients

Two things, and the shim degrades rather than failing:

**Showing Alice's terms.** Where the client supports MCP *elicitation*, her
terms appear as a form for Bob to accept or decline. Where it does not, his
**standing config** decides — auto-accepting terms whose expiry is within
`UMA4A_STANDING_MAX_EXPIRES` and declining anything longer. Either way the
agreement is signed and the receipt is kept; what changes is whether a human
saw it.

**Waiting for Alice.** A request on an ask-me tier pends until she approves it
in her portal. The shim holds the ticket, then hands back to the agent after
`UMA4A_PEND_HANDBACK` seconds so a client with a short tool timeout is not
left hanging — the negotiation survives, and the next call resumes it.

## Settings

| Variable | Default | What it is |
|---|---|---|
| `UMA4A_GATEWAY` | `https://gateway.uma.lab/mcp` | The resource server |
| `UMA4A_CACERT` | `certs/rootCA.pem` | CA that signs the lab's TLS |
| `UMA4A_KEYSTORE` | `~/.uma4agents/agent-key.pem` | The agent's key — its identity |
| `UMA4A_STANDING_MAX_EXPIRES` | `604800` | Fallback auto-accept bound, seconds |
| `UMA4A_PEND_HANDBACK` | `15` | Seconds to hold a pending ticket before returning |
| `UMA4A_AGENT_ISSUER` | — | AAuth person server, for the identified-agent path |
| `UMA4A_PERSON_TOKEN` | — | Bob's token at that issuer |

Without the last two the agent is **pseudonymous** — it is its key, and the
thumbprint is the connection handle. With them it is **identified**, and its
continuity survives key rotation.

## A concrete example: Claude Code

From the repo root, so the relative paths above resolve:

```bash
claude mcp add alice-vault -- \
  env PYTHONPATH=lib UMA4A_CACERT=certs/rootCA.pem \
  uv run --with 'mcp>=2,<3' --with httpx --with 'pyjwt[crypto]' \
  python clients/agent-shim/shim.py
```

Claude Code renders elicitation, so Alice's terms arrive as a form to approve.
`execute_trade` pends until she approves it in her portal.

## Verify headlessly

`make shim-test` runs the shim under a scripted stdio MCP client that
exercises both approval paths — elicitation and standing config — so you can
tell whether a problem is the lab or your client.
