---
templateKey: blog-post
title: "Deploying U4A at Scale: What Changes When One Process Becomes Three"
date: 2026-08-12T00:00:00.000Z
author: Nick Gamb
description: "The lab proved the protocol. It proved nothing about deployment. Here is what actually breaks when you run owner-authoritative authorization for real — and the reference architecture, on Kubernetes with the solo.io stack, that we built to find out."
featuredpost: true
featuredimage: /img/blog/u4a-at-scale.svg
category: Agentic Identity
tags:
  - Agentic Identity
  - UMA
  - U4A
  - Kubernetes
  - Authorization
---

The [first post](/blog/2026-08-06-let-them-a-developers-guide-to-u4a/) made an argument and pointed at a lab that runs it. One command brings the whole thing up: four beats, and an owner who sets her terms and then goes to sleep while other people's agents negotiate against them. One command, one Docker network, one of everything.

That lab proves the protocol. It proves nothing whatsoever about deployment, and I want to be precise about the difference, because it is the difference between a demo and something you would put in front of an auditor.

Everything ran as a single replica. The grant state — tickets, negotiations, issued tokens, the standing relationships — lived in module-level dictionaries. The seam between Alice and the party asking for her data, the whole thesis, existed only as prose in an architecture document. None of that is dishonest for a proof of concept. All of it stops being true the moment you deploy.

So we built the second shape: the same source, on Kubernetes, with each party in its own namespace and a service mesh between them. It found real bugs. Those bugs are the useful part of this post.

![The reference architecture](/img/blog/u4a-at-scale.svg)

## The one that will bite everyone: single-use has to be indivisible

UMA 2.0 says a permission ticket is single-use. This profile adds a single-use, operation-bound token — the thing that makes "approve this trade" not become "may trade".

Neither the specification nor our own first implementation says *how* "once" is enforced. In 2018 an authorization server was tacitly one process, and one process makes the question invisible: read the flag, decide, write the flag, and nothing can interleave.

Here is what ours looked like:

```python
@app.post("/consume")
async def consume_rpt(request: Request, token: str = Form(...)) -> dict:
    claims, rec, err = _decode_rpt(token)   # read
    if err:
        return {"consumed": False, "error": err}
    rec["consumed"] = True                  # write
    return {"consumed": True, "family": rec["family"]}
```

Correct — because a single asyncio event loop never yields between the read and the write. The docstring above it already said the burn "has to be the atomic step", which means the property was *understood* and then guaranteed by an accident of deployment rather than by the design.

At three replicas the accident stops holding. Two callers present the same approved trade to two different servers; both read `consumed: False`; both write `True`; both are told yes. The trade executes twice, and nothing anywhere logs an error.

The fix is not clever. It is one statement that both decides and reports:

```sql
UPDATE rpts SET consumed = true
 WHERE jti = $1 AND consumed = false
RETURNING family;
```

Zero rows means you lost the race, which means you deny. That is the whole contract.

**What to take from this for your own implementation:** the interface matters more than the database. Our first sketch was `get(key)` / `put(key, value)`, which is wrong in the specific way that matters — it preserves the check-then-act shape and moves the race onto the network. Every method that guards a single-use thing has to be an *intent* that decides and writes in one step and tells the caller whether it won.

Two more of the same shape, both found by looking for it once we knew what to look for. Revoking a resource server flipped a status that the PAT check reads on every call — at three replicas the other two keep honouring a token the owner just withdrew, which is a security regression rather than a demo glitch. And revoking a connection iterated live tokens *after* flipping the connection: two steps that must be one, or a revocation that flips and then fails leaves the agent holding exactly the authority Alice just took away.

I have written this up as a recommendation to the working group. The short version: **a single-use artifact must be consumed by an operation that both decides and records in one indivisible step, and that reports to the caller whether it won.** It costs the specification one sentence. It costs an implementer a replayed transaction.

## Where your enforcement point gets its inputs decides whether it can move

The enforcement point in the lab is an external authorization service. Under Docker Compose it is configured by a file; on Kubernetes the same thing is expressed as a policy resource. We ported it expecting trouble and got almost none — the request body, the signature headers and the path rewrite all arrive unchanged, and the expression that rewrites the path transfers character for character.

Exactly one thing does not survive: the `Host` header. It arrives as the *authorization service's own address*, and no configuration changes that.

It cost us nothing, and the reason it cost nothing is the part worth copying. The enforcer rebuilds the HTTP message signature base from its **configured** expected authority and never from the request:

```python
# No `authority` here on purpose: the RFC 9421 base is reconstructed from
# the enforcer's *configured* expected_authority, never from the request,
```

That comment was written for an entirely different reason — an authority taken from a header is an authority an attacker can set. It turns out to be the same decision that made the enforcement point portable between hosts. An implementation that had recovered the authority from the transport would have broken silently on the move, with signatures failing to verify for a reason nothing in the logs would name.

**The general rule:** an enforcement point must take its authorization inputs from its configuration and from the credential, never from the routing layer that delivered them. It is a security rule and a portability rule with a single cause, which is usually the sign of a good one.

While we were in there, we found a second thing worth knowing if you are building on a gateway: past the configured body limit, the request body is **truncated and forwarded**, not refused — despite the schema's own description saying otherwise. A cut-off JSON-RPC body does not parse, so the tool name vanishes from a call that was merely padded. Deny-by-default caught it, but reported "unknown method" and said nothing about a halved body. Fail closed *on purpose* beats fail closed by accident; the signal is in the request already.

## Readiness, and a deadlock you will write by accident

This one is specific to any profile where two parties authenticate each other by dereference, which increasingly means most of them.

Alice's authorization server pulls its registry from what the resource server publishes. It dereferences the resource's public identifier, and the resource authenticates that query by fetching the authorization server's published keys — mid-request. The pull is a **cycle**.

Now put it behind an orchestrator and write the obvious readiness probe: "my registry is populated."

It deadlocks. Gate readiness on the pull, and the service has no ready endpoints, so the back-call has nowhere to land, so the pull fails, so readiness never goes green. What an operator sees is a healthy-looking pod stuck at `0/1` for two minutes and then one quiet log line.

So liveness and readiness point at a health check that is deliberately independent of the pull, and a separate endpoint answers "has it landed" for waits and dashboards — never as a probe. The asymmetry is the whole lesson: **in a profile where two parties authenticate each other by dereference, neither party's liveness may be conditioned on the exchange completing.**

## Making the seam structural instead of rhetorical

The thesis of U4A is that the requesting party is not the resource owner. In the compose lab that is a sentence in a document. On Kubernetes it can be a boundary the infrastructure enforces.

Each party gets a namespace and a service account, which means each workload gets a cryptographic identity — `spiffe://cluster.local/ns/<namespace>/sa/<name>` — and mutual TLS between all of them. Policies are then written against those identities rather than against network position. A pod that gets a new address, or a workload that lies about its name, changes nothing.

What that buys, and these are assertions in a test rather than claims in a diagram:

```
the requesting party -> the owner's authorization server      403
the requesting party -> the vault                             refused
the enforcement point -> the owner's /owner/*                 403
the enforcement point -> the owner's /jwks                    allowed
```

The last two are the same port and the same workload. That is why two namespaces get an L7 proxy and the rest do not: letting the resource server reach the port would let it read and rewrite the policy it exists to enforce, and only a rule that can read a path can split them. Everywhere else the L4 layer answers the question for free.

One design note that matters more than it looks. The split is three-sided, not two. FedAuthz divides responsibility between the resource **owner**, the resource **server**, and the **authorization server** — between parties, not processes. The compose stack collapses all three onto one network. Separating the brokerage that holds the assets from the owner whose policy governs them is what makes the central claim visible: it enforces, and it can never read what it is enforcing.

## The stack, and why each piece is there

The reference architecture uses the solo.io open-source stack, and each piece earns its place by doing something the argument needs.

**agentgateway** hosts the enforcement point. It already speaks MCP, and the external authorization contract we depend on ports across from the file-driven configuration with only the field names changing.

**kgateway** is the north-south edge. Two Gateway API implementations in one cluster is fine, and worth showing: the edge and the agent-facing gateway are different jobs.

**kmcp** turns Alice's vault into an `MCPServer` resource. This is the one I would push hardest on if you are adopting the shape. U4A's transformation of UMA's resource model is that durable resources become *tool surfaces*; an `MCPServer` is exactly a tool surface as a thing the cluster understands. What a reader sees in the manifest is a declaration of the thing being protected, with no authorization code inside it.

**Istio ambient** gives every workload an identity with no sidecars, which is what lets the vault stay an unmodified MCP server and still be inside the mesh.

**CloudNativePG** holds the grant state, because the guarantees are not "some rows": a ticket is spent once, a per-operation grant is burned once, and a revocation must not be visible to one replica and invisible to another.

We used Postgres rather than a cache, and the reasoning is itself a finding worth stating: every hard requirement here is one statement a reader can say aloud, with durability for the audit ledger. A cache gets the same atomicity only through scripting gymnastics and adds a second stateful component to explain. Nothing in this workload is hot enough to want a cache tier in front of the database — and saying that out loud rather than adding one out of habit is part of the job.

## Four mesh traps, each of which fails by pointing somewhere else

If you take one practical thing from this post, make it this list. Each of these cost real time, and each fails in a way that sends you looking in the wrong place.

**A policy that selects nothing protects nothing, and looks exactly like one that does.** Our vault policy used the label convention the neighbouring workloads used. The controller that created the vault labelled its pods with the recommended keys instead. The selector matched zero pods; the policy was accepted, displayed, and enforced nothing.

**A path rule bound to a workload is not a path rule.** In ambient mode, a policy with a workload selector is enforced at L4, and the L4 layer cannot read a path — so instead of falling back to permitting the connection, it denies. Every call returns 403 and the gateway reports only "external authorization failed", which is the correct answer to the wrong question. Path rules have to bind to the service.

**A gateway addresses endpoints, not the service.** So its traffic never passes a service-scoped L7 proxy. Ours had to be workload-scoped, and the symptom until we worked that out was a policy that was plainly correct and plainly not applying.

**Behind an L7 proxy, the second hop carries the proxy's identity, not the caller's.** Without a rule naming the proxy, everything is refused *after* the policy meant to permit it has already said yes — a 503 with nothing denied in any log, because from the proxy's point of view nothing was.

And a fifth, which we did not find by reading. **A principals rule silently excludes anything outside the mesh.** The database operator was named correctly and its namespace was not enrolled, so its traffic arrived with no identity at all and the rule could never match. The database kept serving and quietly stopped being able to fail over — invisible until the day it matters.

## Break it on purpose

That last one was found by a chaos target, on its first run, which is the argument for writing one.

```bash
make k8s-chaos
```

It puts a request in front of Alice, deletes the authorization server that accepted it, kills the database primary, waits for a standby to take over, and then has her answer **that same request** from her portal. Not a fresh one — starting a new negotiation would show that the lab still works, which is not the question. The question is whether the thing that was waiting for her when the machine came apart is still hers to answer.

It found a second bug immediately: the authorization server exited if the database was unreachable at startup. A replicated database is unreachable for a few seconds every time it fails over, so a routine promotion became a crash loop that outlived the outage by minutes. The pool connect is retried now.

The premise of this entire demo is that the owner may be asleep for hours. Under compose that is a claim about the protocol. Here it is a claim about the system, and a claim about a system is only worth what you have done to falsify it.

## Run it

```bash
git clone https://github.com/nickgamb/uma4agents
cd uma4agents
brew install kind helm     # docker and kubectl come with Docker Desktop
make dns-setup             # one sudo, for *.uma.lab in a browser
make kind-up               # ~10 minutes, mostly image pulls
```

Notice what is *not* in there: no `make init`, no `mkcert`, no certificate on your machine. The cluster issues its own certificate authority and distributes it to every namespace at the same path the compose stack uses, so no application code knows which shape it is running in.

Then:

```bash
make k8s-smoke-test    # 13 checks, including "all three replicas sign with one key"
make k8s-demo-all      # Alice's day, from the requesting party's namespace
make k8s-policy-test   # 11 checks — eight of them refusals
make k8s-load          # 24 agents at once; exactly one presentation wins
make k8s-chaos         # break it while she is being asked
```

`k8s-policy-test` is the one I would look at first. A policy suite that only proves the allows passes on a cluster with **no policy at all**, which is why most of them are worthless. This one asserts the refusals.

There is a fifteen-minute walkthrough in [docs/KUBERNETES.md](https://github.com/nickgamb/uma4agents/blob/main/docs/KUBERNETES.md) — every step a command, an expected number, and what to notice in the output.

## What I would tell you to copy

Not the manifests. The manifests are a reference for one shape of one lab, and yours will be different.

Copy these four:

1. **Make single-use indivisible at the storage layer**, and express it as an intent that reports who won, not as a read followed by a write.
2. **Take authorization inputs from configuration and the credential, never from the transport.** It is a security property that happens to also be a portability property.
3. **Never gate liveness on an exchange that routes back to you.** If two parties authenticate each other by dereference, a readiness probe on the exchange is a deadlock waiting for a busy day.
4. **Write the test that proves the refusals.** Everything passes when nothing is enforced.

The protocol was the interesting part in the first post. Deploying it turned out to be interesting for a different reason: almost everything that broke was something the specification did not have to say in 2018, because in 2018 an authorization server was one process. That assumption is now load-bearing in a way nobody wrote down, and the agent era is going to run into it at volume.

---

*U4A is [open source under Apache 2.0](https://github.com/nickgamb/uma4agents). [FINDINGS.md](https://github.com/nickgamb/uma4agents/blob/main/FINDINGS.md) carries the recommendations to spec authors, each backed by running code — including the atomicity finding above, which the deployment work produced.*
