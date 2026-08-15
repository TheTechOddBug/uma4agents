---
templateKey: doc
title: Proof-of-possession
description: A grant that names a key, and a request signed with it — so holding the token is not enough.
diagram: proof-of-possession
diagramCaption: Three callers, one grant. Only the one holding the private key gets through.
next:
  - title: Single-use means indivisible
    to: /docs/overview/single-use/
    blurb: The other half of what makes a grant hard to misuse.
  - title: Mint an operation-bound grant
    to: /docs/guides/grant/
    blurb: Build it.
---

A bearer token is a token anyone holding it can spend. That is a reasonable
trade when the holder is a server you operate and the token lives in memory for
minutes. It is a worse trade when the holder is somebody else's agent, the token
authorises touching another person's money, and the owner is asleep.

Grants here are **proof-of-possession**. The grant names a key; every request
using it must be signed by that key.

## What the signature covers

Signatures follow [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html) HTTP
Message Signatures. The signature base is reconstructed by the verifier from a
small set of components — method, authority, path, and the body digest — and
compared against what the agent signed.

Two properties fall out. A captured request cannot be replayed against a
different resource, because the authority and path are covered. And a captured
request cannot be modified, because the body digest is covered.

## The rule that makes it portable

**The authority comes from configuration, never from the request.**

This looks like a detail and is the single most important line in the verifier.
If the authority used to rebuild the signature base is taken from a header, then
it is an authorization input an attacker can set. Taking it from configuration
closes that.

It also, unexpectedly, makes the verifier portable. Moving the enforcement point
between two different gateways, everything survived — the body, the signature
headers, the path rewrite. Exactly one thing did not: the incoming `Host`
arrives as the authorization service's own address, and no configuration changes
that. A verifier that read the transport would have broken silently, with
signatures failing for a reason nothing in the logs would name.

## Operation binding

For sensitive operations the grant goes further than naming a key. It binds to
**one operation with one set of parameters**, carried as a hash of the canonical
operation.

That is what makes "approve this trade" mean this trade. Without it, an approval
for selling forty shares is an approval to trade — the owner tapped once and
authorised a capability rather than an act.

The enforcement point checks the operation binding against the call it is about
to allow. A grant issued for one order presented against another is refused,
even though the signature is valid and the token has not expired.

## The order of checks

Enforcement happens in a fixed order, and the order is normative rather than
incidental:

1. introspect the grant — non-consuming
2. check the permissions cover this tool
3. verify proof-of-possession
4. check the operation binding
5. spend the grant — atomic, and last

Consuming first is the intuitive order and it is a denial of service: an
unsigned replay burns the grant, and the approval the owner just gave is
destroyed by someone who never had the key. Spending last means only a request
that was going to succeed can spend anything.
