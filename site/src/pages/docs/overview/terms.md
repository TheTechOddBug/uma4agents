---
templateKey: doc
title: Terms as first-class
description: The owner does not just decide — she states what she requires, and the agent signs it.
diagram: terms-exchange
diagramCaption: The owner proffers, the agent signs, her authority counter-signs. Both sides keep the same artifact.
next:
  - title: Dictate terms, take an agreement
    to: /docs/guides/terms/
    blurb: Build this beat yourself.
  - title: Revocation and the ledger
    to: /docs/overview/revocation/
    blurb: What the signed record is for afterwards.
---

In most authorization systems a decision is a boolean that leaves no trace of
what it was a decision *about*. The caller asked, the system said yes, and the
log records that access was granted at a timestamp.

This profile makes the owner's requirements an artifact. The authorization
server **dictates** terms; the agent **signs** them; both sides keep the
receipt.

## What terms contain

Four things, machine-readable:

- **Purpose** — what this access is for, in the owner's words
- **Scope** — which resources and which operations
- **Expiry** — how long, in seconds
- **Prohibitions** — what the agent is agreeing not to do

The prohibitions are the part people underestimate. A grant says what is
allowed; only terms can say *what the agent has undertaken not to do with it* —
reuse it for a different order, retain the data, act beyond the approved
parameters. Nothing enforces a prohibition at the wire level, which is exactly
why it needs to be recorded and signed rather than assumed.

![Alice editing the terms for her holdings tier in the lab's portal: the
purpose she requires an agent to accept, how long access lasts, a
comma-separated list of prohibited actions, and a toggle for asking her every
time.](/img/docs/owner-terms.png)

These are her fields, on her surface. The tier above governs a specific
resource, so the same four values are what every agent asking for her holdings
must echo back and sign.

## Where the pattern comes from

The shape follows [IEEE 7012](https://standards.ieee.org/ieee/7012/7192/) — the
MyTerms pattern. An individual proffers machine-readable terms from a roster she
controls; a counterparty agrees; both sides keep a record. The important
inversion is who authors them. Not the service, offering something to accept or
leave. The individual, stating what she requires.

The lab keeps every version of every terms document dereferenceable at a stable
URI for the life of the authorization server, because an agreement that points
at terms nobody can retrieve is not checkable later.

## Why the agent signs

A signature makes three things true that consent checkboxes do not.

**It is attributable.** The agreement is signed by the agent's key, and that key
is the same one the grant binds to. The party that agreed and the party that
acts are provably the same.

**It is specific.** The signature covers the exact terms document, by hash. Not
"the terms as of some date" — these terms, this version.

**It is mutual.** The authorization server counter-signs a receipt. Afterwards,
each side holds a record neither can quietly revise.

## What this buys the owner

She can answer, later, questions that most systems cannot: what did this agent
undertake, when, and against which version of my terms. The
[ledger](/docs/overview/revocation/) is a projection over exactly those events.

It also changes what a breach looks like. If an agent exceeds what it agreed,
there is a signed statement of what it agreed — which is the difference between
an incident and an argument.

## The honest limit

Signing terms does not enforce them. An agent that promises not to retain data
can retain data, and no protocol prevents that. What the signature gives you is
a durable, attributable record that the promise was made, which is the
precondition for every remedy that follows — technical, contractual or legal.

The profile is careful about this distinction, and so should anything you build
on it be.
