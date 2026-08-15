---
templateKey: doc
title: Revocation and the ledger
description: What was promised, what was approved, what was touched — and what happens the moment the owner changes her mind.
next:
  - title: How it compares to UMA 2.0
    to: /docs/overview/compare-uma/
    blurb: What this profile keeps and what it changes.
  - title: Events
    to: /docs/reference/events/
    blurb: The event stream the ledger projects over.
---

Consent that cannot be withdrawn is not consent, and an approval nobody can
reconstruct afterwards is not much of a record. Those two requirements produce
the same machinery.

## One event stream

Every step of a negotiation emits a structured event: the challenge, the terms
dictated, the contract committed, the owner notified, her decision, the grant
issued, the call allowed or denied, the connection revoked.

Every event carries the same **correlation id** — the negotiation family,
assigned when the ticket is created and stable across every rotation of it. One
negotiation, one thread, however many messages it took.

## The ledger is a projection

The ledger is not a separate store. It is a view over that stream:

- **promised** — the contracts committed, with the hash of the terms signed
- **approved / denied** — the owner's own decisions
- **touched** — the calls actually allowed
- **revoked** — connections ended

Keeping it a projection rather than a table means the audit trail cannot
disagree with what happened. There is no second write to forget.

Refusals are recorded too. A denial is a decision, and a log that only contains
successes cannot answer the question anyone actually asks after an incident.

## Revocation has to be atomic

Revoking a connection does two things: it ends the relationship, and it burns
every live grant issued under it.

Doing those as two steps is a bug, and it was one here. The connection flipped,
and the grants were burned in a second operation that could fail independently —
leaving the agent holding exactly the authority the owner had just withdrawn,
with the interface telling her it was gone.

The fix is the same lesson as
[single-use](/docs/overview/single-use/): one operation that decides and records
together. Revocation ends the connection and burns its grants indivisibly, or it
does neither.

## What the agent sees

An agent presenting a revoked grant is told so explicitly, and the answer is
**terminal**. It is not `need_info`, and it is not an invitation to renegotiate.

That distinction matters more than it looks. A bare "inactive" sends a
well-behaved agent back around a negotiation whose outcome is already settled,
which wastes everyone's time and looks, from the owner's side, like an agent
that will not take no for an answer.

## Why this survives the deployment

In the replicated shape, revocation is correct because every replica reads the
same store, so a revoked connection is revoked everywhere the instant it
commits.

That is worth stating plainly as a boundary rather than a feature. Stretch this
across regions, or across more than one authorization server, and it becomes a
distributed-systems problem this profile does not itself solve. What it gives
you is a revocation that is atomic within one authority, which is the part the
protocol can be responsible for.
