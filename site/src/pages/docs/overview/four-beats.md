---
templateKey: doc
seoTitle: "How agent authorization works: the four-beat grant"
title: The four beats
description: Challenge, attempt, commit, grant — the whole negotiation, and what each exchange is for.
diagram: four-beats
diagramCaption: One negotiation. Alice appears only in beat three, and only on her own surface — she is never on the connection between the agent and the resource.
next:
  - title: The three parties
    to: /docs/overview/parties/
    blurb: Who is doing what in each beat.
  - title: Issue the challenge
    to: /docs/guides/challenge/
    blurb: Build the first beat yourself.
---

A negotiation is four exchanges. Everything else in this profile is detail hung
off them.

```
agent ──1── enforcement point      "no, and here is a ticket"
agent ──2── authorization server   "here is the ticket"  → "here are my terms"
agent ──3── authorization server   "signed"              → granted, or held
agent ──4── enforcement point      the authorized call
```

Beats 2 and 3 both go to the owner's authorization server. Beats 1 and 4 both go
to the resource server. The agent is the only party that talks to both, which is
what lets the two sides stay ignorant of each other.

## Beat 1 — challenge

The agent calls a protected tool without sufficient authorization. The
enforcement point refuses and returns a **permission ticket** along with the
address of the authorization server that can do something about it.

The refusal is the useful part. It is not an error — it is the resource server
saying *this is negotiable, and here is who to negotiate with*. The ticket names
a specific attempt: this agent, this resource, these scopes.

A second thing rides along. The challenge names the authorization server, and
the resource's [published metadata](/docs/overview/discovery/) also names it,
so the agent can check the two against each other before it trusts either.

## Beat 2 — attempt

The agent presents the ticket at the authorization server's token endpoint and
receives, in most cases, a demand rather than a grant: `need_info`, carrying the
**terms** the owner requires for this resource.

The terms are machine-readable — purpose, scope, how long, what is prohibited —
and they come from the owner's policy, not from the resource server. This is the
beat where the owner's authority actually asserts itself.

The ticket is spent by being presented. A fresh one comes back with the demand.

## Beat 3 — commit

The agent signs the terms and re-presents the rotated ticket with the signed
agreement attached.

Signing is the point at which the requesting side becomes accountable for
something specific. What happens next depends on the owner's policy and on
whether she has met this agent before:

- known agent, permissive tier → **granted** immediately
- agent she has never seen → **held**, whatever the tier
- operation her policy reserves → **held** until she approves

Held is not failure. The negotiation stays alive, the agent keeps its ticket,
and the answer arrives when she taps.

## Beat 4 — grant

The agent receives a token bound to its key — [proof-of-possession, not
bearer](/docs/overview/proof-of-possession/) — and calls the tool again,
signing the request.

For sensitive operations the grant is bound to that one operation and its
parameters, and is [spent once](/docs/overview/single-use/). Replaying it
fails. Using it for a different trade fails.

## Why four and not two

A single exchange could carry a token. It could not carry a *negotiation* —
somewhere for the owner's terms to be stated, somewhere for the agent to accept
them, and somewhere for the whole thing to pause while she is asleep. Each beat
exists because something has to happen between the request and the answer that
neither party can do alone.
