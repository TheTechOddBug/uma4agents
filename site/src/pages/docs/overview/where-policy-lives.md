---
templateKey: doc
seoTitle: "Where should AI agent access policy live? The case for decentralizing it"
title: Where policy lives
description: Centralising agent authorization policy in one identity provider fails the moment the data's owner is not your user. What decentralized policy means concretely, and what it costs.
next:
  - title: Compared to policy engines
    to: /docs/overview/compare-policy-engines/
    blurb: Whose policy, not which engine.
  - title: Why the owner decides
    to: /docs/overview/why/
    blurb: The argument this page is the architecture of.
---

Almost every agent-authorization design on the table today puts policy in one
place: an identity provider, a gateway, a central policy service. An
administrator consents on behalf of an organisation, a token is minted, and the
resource server downstream consumes it without a policy voice of its own.

Inside one company that is not just acceptable, it is *correct*. It is also the
special case.

## The assumption underneath centralised policy

Central policy works when the party who administers it is the party who owns
the data. Collapse those and everything follows: one admin decision can bind
every downstream resource, because every downstream resource belongs to the
same organisation that made the decision.

Now take them apart. Your customer's holdings are not yours. Your patient's
record is not yours. The person who should decide whether a third party's agent
may read it does not work at your company, has no account with the agent's
identity provider, and is not in any admin console.

**Central policy has no seat for them.** Not because it was designed badly, but
because it answers a different question — one where the administrator and the
owner are the same party.

## What decentralizing it actually means

Not "policy scattered everywhere". Not a policy engine per service. One thing,
specifically:

> The authority that decides sits on the **owner's** side of the boundary, and
> the resource server enforces rather than decides.

That is a smaller change than it sounds and a bigger one than it looks. The
resource server keeps its enforcement point — it still challenges, still
introspects, still refuses. What it stops doing is holding the rules. It has no
allow-list, no per-customer configuration about third parties, and nothing to
maintain when a new agent appears, because the decision was never its to make.

The owner gets an authorization server that is hers: her terms, her tiers, her
pending queue, her ledger, her revoke button.

## What this is not

**It is not a rival to your policy engine.** A policy engine decides; this is
about *whose policy* the decision expresses. You will probably want an engine
inside the owner's authority. See
[compared to policy engines](/docs/overview/compare-policy-engines/).

**It is not decentralized identity.** No ledger, no DIDs, nothing required of
the agent's identity scheme at all — the owner's authority is indifferent to
how the requesting side identifies itself. See
[identity stays where it is](/docs/overview/flow/).

**It is not one authority per service.** It is one authority per *owner*, which
is the axis that matters, and the reason the same policy can cover every
resource server she has a relationship with.

## What it costs

Worth being direct, because a design that only lists benefits is not being
honest with you.

- **Somebody has to run her authority.** In the lab it is a service; in the
  world it might be her bank, her employer, a personal AI on her own hardware,
  or a provider she chose. That is a real deployment question with no single
  answer yet.
- **Two authorities can disagree.** Revocation is atomic within one authority.
  Stretch it across regions or across more than one and it becomes a
  distributed-systems problem this profile does not itself solve.
- **The owner becomes a dependency.** Requests wait on her, and her attention
  turns out to be attackable — which needs
  [its own answer](/docs/overview/attention/).

## Where to go next

- [Why the owner decides](/docs/overview/why/) — the argument this is the architecture of
- [Architecture](/docs/overview/architecture/) — the components, and which side each sits on
- [Compared to UMA 2.0](/docs/overview/compare-uma/) — what carries forward from the 2018 design
