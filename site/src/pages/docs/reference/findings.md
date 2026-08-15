---
templateKey: doc
title: Findings
description: What the build produced for the people writing the specifications — verdicts on each UMA 2.0 primitive, nine recommendations, and what was parked.
next:
  - title: Deviations from UMA 2.0
    to: /docs/reference/deviations/
    blurb: The extension register each recommendation came out of.
  - title: Standards this composes
    to: /docs/overview/standards/
    blurb: Everything the profile is built from.
---

The point of building this was to produce evidence about what UMA 2.0 needs in
order to serve agentic access. This page is the summary; the full document is
[`FINDINGS.md`](https://github.com/nickgamb/uma4agents/blob/main/FINDINGS.md) in
the repository.

## Verdicts on each primitive

| Primitive | Verdict | Rationale |
|---|---|---|
| Cross-principal grant topology | **Keep** | The load-bearing idea; nothing else on the table has it |
| Permission ticket as negotiation handle | **Keep** | Carried clean; its single-use rotation is what makes pending safe |
| `request_submitted` pending state | **Keep** | Already specifies ask-me; the agent era adds only *where* the owner is asked |
| Claims-gathering | **Keep, transform** | Becomes the owner *proffering* a terms template, not just naming claim formats |
| RPT | **Keep semantics, replace token** | Keep the per-permission array; drop the bearer token for proof-of-possession |
| Resource-server registration and PAT | **Keep direction, relocate work** | The direction is right; the burden is relocatable — a gateway, a framework, or the resource itself |
| Resource registration model | **Transform** | Durable resources become tool surfaces, and registration becomes method-agnostic |
| Interactive claims gathering | **Transform** | Same slot, new interlocutors: agent-side elicitation, owner-side push |
| Trust elevation, multi-AS, legal framework | **Parking lot** | Real and implicated, out of scope for a first build |

## Four capabilities the agent era demands

Two are named uses of machinery UMA already has.

**Owner-mediated agent registration** — the day-one handshake. The shape where
the owner approves a relationship, applied to the requesting-agent side rather
than the resource-server side. Distinct from client registration: the agent's
proof-of-possession key already plays that role. What is new in use is the owner
approving a standing relationship with a requesting agent.

**A standing-relationship handle.** The persisted claims token is the closest
ancestor. Here it is made owner-visible and owner-revocable — a registry with a
revoke switch — which classic semantics never required. The handle's shape has
to follow the identity level, because an identified agent's session keys rotate
and a thumbprint-keyed connection forgets it every run. That bit the build.

Two are genuinely new surface.

**Per-operation, single-use grants.** Approving one trade must not become
authorizing trading. Classic scopes authorize classes of action.

**The owner's own agent or app as the consent surface.** The 2010 out-of-band
consent wireframes, with an interlocutor that finally exists.

## The nine recommendations

**1. A core grant specification, transport-agnostic.** Carry forward the party
model — owner, requesting party, and reviving the 2010 term, *requesting agent*
— the ticket loop, offline grants and owner-dictated claims. Write it against
properties rather than a wire protocol, so no vendor's roadmap can strand it.

**2. Make the owner's terms first-class.** The single most valuable
transformation: claims-gathering becomes an owner-proffered terms artifact the
requesting side echoes and signs, following IEEE 7012 and descending from UMA's
own Requesting Party Policy claim. Terms as persistent documents in three
representations at one URI; a single choice with no haggling; identical dual
records including a counter-signed receipt; refusals recorded too.

*Honest divergence:* 7012 places the terms roster with a neutral nonprofit; here
it lives on the owner's own authorization server.

**3. Specify the day-one handshake precisely.** What happens the first time an
owner meets an agent she has no relationship with, and how the resulting
relationship is named, stored and revoked.

**4. Retire the bearer RPT.** Keep the introspection semantics; bind to modern
proof-of-possession.

**5. Make resource registration method-agnostic.** Keep push registration; add a
declarative profile built on RFC 9728, with the owner context split out behind a
protected listing. Both were built against an otherwise identical stack, so the
trade is measured rather than argued, and the push implementation is preserved
on a branch so the comparison stays checkable.

What is lost from push registration, measured: authorization-server naming
authority over resource ids, immediate consistency, and the bootstrap forcing
function that made PAT issuance happen on day one. What is gained: one fetch
instead of N calls, one registry with one writer, and a privacy split where
public metadata stays structural.

The sharper statement inside this one: **the specification should describe the
job, not the box.** FedAuthz already does — it gives the resource server a job
list and never names the software that performs it. Earlier drafts of this work
read as though a gateway were where the burden *belongs*. It is where it
happened to be put.

**6. Bindings as thin, separate documents.** Ship the core with a first binding
to a concrete identity and proof-of-possession layer, and plan a second for the
OAuth and DPoP installed base. MCP is the third and most urgent: it has a formal
extension track and its 2026-07-28 revision independently grew most of the
machinery this grant needs.

**7. Specify the challenge as parameters, not as `WWW-Authenticate`.** Building
two enforcement hosts is what exposed this. A gateway has a status line to
decorate; a resource enforcing in-process does not. Mandating the header would
have excluded every in-process deployment — the resource-side frameworks most
likely to adopt this. Require the parameters; let each binding say how they
travel.

**8. An input request needs a subject.** MCP's resumable-request machinery hands
back a state handle, but its input-request union addresses only the client's own
model, filesystem and human. There is no member for *blocked on a different
principal who is not on this connection*. The fix is small: a `subject` block
whose load-bearing field is `reachable_by_client: false`. A related finding
concerns task identifiers acting as bearer tokens.

**9. Say that single-use means indivisible, not merely once.** UMA 2.0 says a
ticket is single-use and does not say how "once" is enforced, because in 2018 an
authorization server was tacitly one process — and one process makes the
question invisible. That is a property of the deployment, not of the design, and
it does not survive the deployment changing. This build's own consume endpoint
was check-then-act before it was fixed.

## Parking lot

Each with a revival condition, so parking is a decision rather than an omission.

| Item | Revive when |
|---|---|
| Trust-elevation levels | Tiers need graduated assurance — stepping up from pseudonymous to a verified organization |
| Multi-authorization-server federation | An owner's resources span authorization servers they do not control |
| The business-legal framework | Agents act with legal effect and liability questions become concrete |

## How to read these

Every recommendation came out of something that broke, or something that could
not be built as specified. The [deviations register](/docs/reference/deviations/)
is the same material organized by wire surface rather than by argument, and each
entry there names the finding it produced.
