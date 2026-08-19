---
templateKey: doc
seoTitle: "Authorizing AI agents you cannot pre-register or allow-list"
title: Agents you cannot pre-register
description: You cannot enumerate every AI agent that will ever ask for your users' data. How to write access policy that holds for the ten-thousandth stranger without maintaining a list.
next:
  - title: Agent assurance
    to: /docs/overview/assurance/
    blurb: What you can establish about a stranger, and what it may change.
  - title: The owner's attention
    to: /docs/overview/attention/
    blurb: What stops an unbounded queue of strangers.
---

Every access-control system you have ever operated starts with a list. Users,
roles, service accounts, API clients — someone enrolls them, someone reviews
them, someone removes them.

Now the callers are AI agents belonging to other people's companies, arriving
on behalf of your users, and there is no plausible moment at which anyone
enrolls them. The first one is a stranger. So is the ten-thousandth.

## The list is the problem, not the size of it

The instinct is to make enrolment cheaper — self-service registration, a
directory, a marketplace of vetted agents. Each of those helps and none of them
addresses the shape of the problem, which is that **the party who would have to
maintain the list has no relationship with the parties on it**.

An allow-list of trusted agents also has a quieter failure. It answers "who",
when the question the owner is actually asking is "what, for what purpose, for
how long". Two agents from the same firm may deserve different answers; the
same agent may deserve different answers on Tuesday and on a trade worth
six figures.

## Write policy about requests, not about callers

The move is to stop naming agents at all. The owner's policy names **her own
resources** — which tools, what terms, whether she must be asked — and every
agent negotiates against it:

```json
"tier3": {
  "resources": ["alice-vault/execute_trade"],
  "ask_me": true,
  "terms": { "purpose": "Execution of one client-approved order",
             "expires_in": 900, "per_operation": true }
}
```

There is no issuer in that document, no agent identifier, no thumbprint. It was
written before any agent existed and holds for all of them. A new agent is not
a gap in her configuration — it is simply a stranger, and her policy already
says what strangers get.

## What she can still say about the one in front of her

Naming no agent does not mean treating them identically. Her authority can
write rules over **what it was able to verify** about a request — is it bound to
a key it will recognise, can it trace the credential, is anyone named and
reachable behind it — and those rules still name no agent:

```json
{"when": ["assurance.accountability_below:1"], "then": "ask"}
```

That holds for the next stranger too. The safety rule is that what an agent
shows can only *add* friction; only decisions the owner made herself can remove
any. See [agent assurance](/docs/overview/assurance/).

## The first contact is still a decision

Scaling past enrolment does not mean skipping consent. An agent with no
standing relationship pends the first time however permissive the tier — the
owner is asked once, about the relationship rather than the request, and the
agent holds its ticket while she decides. After that her existing terms cover
it, and she is only asked again for operations she said she must approve.

Which raises the obvious attack: if anyone can arrive, anyone can arrive ten
thousand times. That is [the owner's attention](/docs/overview/attention/),
and it needs its own answer.

## Where to go next

- [Why the owner decides](/docs/overview/why/) — one policy, written once, and everyone negotiates against it
- [Terms as first-class](/docs/overview/terms/) — what she is actually dictating
- [Revocation and the ledger](/docs/overview/revocation/) — ending it, per agent or per operator
