# An agent framework nobody modified

Every other demo in this lab drives the grant from code in this repository —
the demo driver, the shim beside Claude Code, Alice's personal AI. That proves
the protocol works. It proves nothing about whether anyone can adopt it.

This one is the other way round. [kagent](https://kagent.dev) is not ours, has
not been changed, and has never heard of UMA. It sees three ordinary MCP tools.
Alice's policy governs it anyway.

```bash
make kagent            # opt-in: it brings a model with it
make kagent-check
make kagent-down
```

## The adapter is the whole trick

kagent's MCP client will not sign an RFC 9421 request or a terms agreement, and
it should not have to. Something else does.

```
kagent Agent  ──MCP──▶  U4A adapter  ──four beats──▶  Alice's authority
(knows nothing)         (Bob's key)                   (decides)
```

The adapter is `clients/agent-shim/shim.py` — the same file Bob runs beside
Claude Code — started with `UMA4A_SHIM_TRANSPORT=streamable-http` so it can be
reached over the network instead of spawned as a subprocess. That one variable
is the entire difference. It holds Bob's signing key, runs the challenge,
proffers Alice's terms to Bob's standing configuration, signs the agreement,
presents proof-of-possession and keeps the counter-signed receipts.

It lives in **Bob's** namespace, because it is his: his key, his configuration,
his receipts. Alice's authority has never heard of it and treats what comes
through it as one more agent.

### The claim, checked without a model in the way

```bash
make adapter-check        # compose
make k8s-adapter-check    # kubernetes
```

`clients/demo-driver/adapter_check.py` is a plain MCP client. It imports
nothing of ours — no `uma4a_grant`, no key, no ticket — and it reaches Alice's
holdings:

```
== An agent with no U4A code in it ==
   ok   it discovers Alice's tools as ordinary MCP
   ok   and calling one returns her data
   ok   it never saw a ticket, terms, or a signature
```

If that passes, the only thing kagent adds is deciding which tool to call.

## Choosing a model

Opt-in, because a model is a real cost — a container that pulls a couple of
gigabytes, or an account somewhere. The U4A path is identical in every case.

| | |
|---|---|
| `make kagent` | Ollama in the cluster. No account anywhere, no key. Pulls a small tool-calling model on first start, which takes a few minutes. |
| `make kagent MODEL=anthropic` | `ANTHROPIC_API_KEY` from your shell, into a Secret and nowhere else. |
| `make kagent MODEL=openai` | `OPENAI_API_KEY`, likewise. |

The key never reaches this repository. `k8s/scripts/kagent.sh` reads it from
your environment, creates a `Secret`, and the `ModelConfig` references it —
which is also why the cloud manifest is a template rather than a committed
file with a placeholder someone might fill in and commit.

Small model, on purpose. This exists to show a framework negotiating with
Alice's authority, not to demonstrate reasoning. Any tool-calling model works.

## What it looks like

```
== An agent framework, asked a question ==
   agent: sterling-vance/advisory-agent (kagent)
   question: What is in Alice's portfolio?
   it has one tool server: the U4A adapter. It knows nothing else.
   [alice] approving connection request for tier1
```

The first contact is held for her, as it is for every agent she has never met —
kagent's framework-ness earns it nothing. Her portal shows it beside Bob's
script agent and your own MCP client, with its own terms, its own trail and its
own revoke button.

## What this demonstrates, and what it does not

**It is an adoption result, not a protocol finding.** The negotiation is the
adapter's. Nothing here changes what the authorization server does, and
`make kagent-check` would pass with a different framework, or none.

What it does establish is worth having anyway:

- **The requesting side needs an adapter, not a rewrite.** An agent platform
  can be pointed at Alice's resources and governed without a line of its code
  changing. That is the difference between a protocol people admire and one
  they use.
- **Both sides of the boundary become declarative.** Alice's vault is already a
  kmcp `MCPServer` rather than a Deployment we wrote; with this, so is the
  agent asking. Two Kubernetes objects, one boundary between them.
- **The framework's identity buys nothing.** kagent arrives as a stranger, is
  held like a stranger, and appears in her connections list like a stranger.

## Kubernetes only, and why

kagent is a Kubernetes controller. There is no compose shape for it and this
does not pretend otherwise.

The part that matters *is* in compose: `make adapter` runs the adapter as a
service, and `make adapter-check` proves an unmodified MCP client reaches
Alice's things through it. What compose cannot show is a framework doing the
asking.

## See also

- [DEMOS.md](DEMOS.md) — all three demos, and when to reach for which
- [KWAAI-BINDING.md](KWAAI-BINDING.md) — the same trick on the owner's side
- `clients/agent-shim/README.md` — the adapter as Bob runs it locally
- `k8s/components/kagent/` — the Agent, and both model shapes
