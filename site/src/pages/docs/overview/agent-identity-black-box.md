---
templateKey: doc
seoTitle: "Do you need to know what an AI agent is to authorize it?"
title: The agent identity black box
diagram: black-box
diagramCaption: "Four differently-arranged requesting sides. The terms, the grant and the answer come back identical; only the handle moves."
description: Agent identity is contested and unsettled — enrolled, ephemeral, centralized, decentralized. You can authorize an agent without resolving any of it, and here is the test that proves it.
next:
  - title: Identity stays where it is
    to: /docs/overview/flow/
    blurb: The falsifiable version of this claim.
  - title: Agent assurance
    to: /docs/overview/assurance/
    blurb: What you can verify, as opposed to what it tells you.
---

There is a live argument about how AI agents should prove who they are.
Enrolled identities or ephemeral keys. A new principal type in your identity
provider, or a credential that never touches one. Decentralized identifiers and
verifiable credentials, or a workload identity from a cloud provider. Every
vendor has a position and most have an acronym.

You are being asked to pick one before you can let an agent do anything.

**You are not, and the reason is worth understanding.**

## Treat it as a black box on purpose

The owner's authority needs exactly two things from the requesting side:

1. Something it can **recognise again** — so a relationship can exist, and so a
   grant can be bound to the thing that presents it.
2. Something the agent can **sign with** — so an agreement to her terms is
   attributable and a token cannot simply be stolen and replayed.

A bare public key satisfies both. So does a credential from an agent identity
protocol. So, presumably, does whatever wins the argument in two years. None of
those choices needs to reach the owner's policy, and in this profile none of
them does.

## The claim, made falsifiable

It is easy to assert that identity does not leak into decisions. Here is how it
is actually checked, and the negative half is the part that matters.

The same negotiation runs against four differently-arranged requesting sides —
a bare key, an agent with a verified issuer and rotating session keys, one
described by a published operator document, one whose key is published in a
directory. Then two things are asserted:

- the terms, the grant and the authorization server's answer are **identical**
  across all four; and
- **the owner's policy contains no identity vocabulary at all** — no issuer, no
  thumbprint, no credential type, nothing.

The second assertion is what makes the first mean something. A system that
ignored every identity signal would pass the first test too. If any signal ever
became an authorization input, one of the two halves breaks: either her policy
has to name it, or the four runs stop agreeing.

That check is [identity stays where it is](/docs/overview/flow/), and it runs
in the lab.

## Then what is the identity *for*?

Two things, neither of which is deciding.

**Continuity.** A pseudonymous agent *is* its key, so a key thumbprint names the
relationship. An agent with a real identity rotates session keys, so the
relationship has to be named by the verified issuer and subject instead —
otherwise the owner forgets an agent she has already met, every session.

**Something true to show her.** When a request is put to a person, "a firm that
publishes this metadata says it operates this agent" is more useful than a
40-character hash. It is shown, and it is not trusted:
[assurance](/docs/overview/assurance/) is what her authority *verified*, never
what the agent asserted, and nothing an agent shows about itself can widen
access.

## What you can do about it today

Let the argument play out. Build the part you own: what happens when somebody
else's agent shows up at your resource server and asks for something. That part
does not depend on who wins, and it is the part nobody else is specifying.

## Where to go next

- [Identity is not authorization](/docs/overview/identity/) — the distinction, stated plainly
- [Compared to agent identity work](/docs/overview/compare-agent-identity/) — how this sits beside AAuth, Web Bot Auth, and the rest
- [Agent assurance](/docs/overview/assurance/) — verified, never attested
