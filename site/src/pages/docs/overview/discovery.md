---
templateKey: doc
title: Discovery, public and protected
description: What a resource is can be public. Whose instances sit behind it cannot.
diagram: discovery-layers
diagramCaption: Both bands are served by the resource server, from one registry. Only the audience differs.
next:
  - title: Issue the challenge
    to: /docs/guides/challenge/
    blurb: Where the published metadata gets checked against the challenge.
  - title: Endpoints
    to: /docs/reference/endpoints/
    blurb: The exact documents and who may read them.
---

Before an agent calls anything it should be able to find out what it is dealing
with: what this resource offers, what scopes exist, and which authorization
server speaks for it. That is discovery, and it splits cleanly in two.

## The public layer

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html) Protected Resource
Metadata is a document anybody may fetch. It describes the resource
**structurally**:

- the tool surfaces it exposes, and the scopes each needs
- which authorization servers are authoritative for it
- where its own keys are published
- where to ask about owner-bound instances

None of that is sensitive. It is the shape of the door, and knowing the shape of
a door tells you nothing about who lives there.

The document is signed, so a relayed or cached copy can be checked against the
resource's own key rather than trusted because of where it was found.

## The protected layer

Which resources **Alice** owns is a different kind of fact. Publishing that at an
unauthenticated URL would be a privacy leak that the older push-registration
model never had — under push, the resource server told one authorization server
about one owner's resources, and nobody else was told anything.

So owner-bound instances live behind an endpoint that serves only a caller who
proves possession of the owner's authorization server key, using the same
message-signature mechanics the agent uses, pointed the other way. It is a
protected webfinger for one person's things.

The trust for that was established at onboarding: the resource server holds a
token issued by exactly that authorization server.

## Why the split matters

It lets registration be **pulled** rather than pushed. The resource server
publishes what it protects; the owner's authorization server reads it and
materialises its own registry. One writer, one source of truth, and no
imperative registration call that can half-fail and leave the two sides
disagreeing.

![The lab's portal listing Alice's protected resources: each one tagged
published and pulled, with its scopes, the policy tier governing it, and
whether it grants automatically under her terms or asks her every
time.](/img/docs/owner-resources.png)

Each row above was **pulled** rather than pushed — her authorization server read
them from what the resource server publishes. The row above them is the resource
server holding protection access in her name, with a revoke button beside it.

It also explains why the older model felt heavy. The two bands carry facts with
different cardinality: what a tool is, and which scopes it needs, are universal
and true once — while whose instance sits behind it is per-owner. Push
registration sent both down one per-instance channel, so a universal fact was
re-registered for every owner. Splitting them puts each on a surface sized for
it.

It also gives the agent a second witness. The challenge names an authorization
server, and the published metadata names authorization servers. The agent checks
one against the other before trusting either, so a challenge pointing at an
authorization server the resource has never heard of is refused rather than
followed.

That check is cheap and it closes a real hole: without it, anything that can
return a 401 can send an agent to negotiate with a server of its choosing.

## What this costs

A pull-based registry is eventually consistent. There is a window after a
resource server publishes something and before the authorization server has read
it, and a request for a resource the authorization server does not yet know
about has to be handled deliberately rather than crashing.

The lab handles it by re-pulling on an unknown resource id, which makes the
registry self-healing at the cost of one extra fetch on a cold path. That
tradeoff, and the deadlock it is easy to create while implementing it, are
covered in [Deploy it at scale](/docs/guides/at-scale/).
