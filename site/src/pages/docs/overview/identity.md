---
templateKey: doc
title: Identity is not authorization
description: Knowing which agent is calling tells you nothing about whether it may proceed. Both are needed, and they answer different questions.
next:
  - title: Proof-of-possession
    to: /docs/overview/proof-of-possession/
    blurb: How a grant stays attached to the thing that earned it.
  - title: Agent identity, compared
    to: /docs/overview/compare-agent-identity/
    blurb: AAuth, Web Bot Auth, CIMD, and where each fits.
---

Most of the current work on agents is about identity: proving which agent is
calling, who operates it, and that it has not been impersonated. That work is
necessary and this profile depends on it.

It is also not sufficient, and conflating the two is the most common mistake in
this area.

## Two questions

**Who is asking?** Answered by an identity layer. It produces a verifiable
statement about the agent — its issuer, its subject, the key it holds.

**May they?** Answered by an authority that holds someone's policy. It takes the
identity as an *input* and produces a decision, along with the terms under which
that decision holds.

An identity protocol that answers the first question well still leaves the
second entirely open. The reverse is also true: an authority with no reliable
identity is deciding about a stranger it cannot name.

## Two levels of identity

The profile supports both, and the difference is worth understanding because it
changes what a standing relationship means.

**Pseudonymous.** The agent has no issued identity. It *is* its key, and the
connection is handled by that key's
[RFC 7638](https://www.rfc-editor.org/rfc/rfc7638.html) thumbprint. Simple, no
issuer to trust, and the relationship persists exactly as long as the key does.
Rotate the key and the owner sees a new agent.

**Identified.** An agent identity provider issues a token asserting the agent's
issuer and subject, binding a per-session key. The connection is keyed by issuer
and subject, so continuity survives key rotation — a thumbprint-keyed connection
would forget an identified agent every session.

The lab defaults to pseudonymous, which keeps the demo dependency-free, and
supports the identified path through [AAuth](https://github.com/dickhardt/AAuth).

## The rule that keeps them separate

Identity metadata never becomes an authorization input.

An agent can present a document describing who operates it, and a directory
where its keys are published. Both are useful — they let an owner who has never
seen this agent be told something true about it before she decides. Neither is
consulted when the enforcement point verifies a request.

The verifying key is always the one named in the grant. Everything else is
display.

That rule exists because the alternative fails quietly: an authorization
decision that trusts a self-published document is a decision anyone can
influence by publishing a document.

## Why the owner still has to decide

An identified agent from a reputable issuer, operated by a firm the owner has
heard of, with keys published in a directory she can check, is still an agent
she has not agreed to.

Identity narrows the question from "who are you" to "you are this specific
agent, from this issuer" — and then the question the owner answers is unchanged.
That is why first contact
[pends regardless of tier](/docs/overview/four-beats/), and why the terms are
signed rather than assumed.
