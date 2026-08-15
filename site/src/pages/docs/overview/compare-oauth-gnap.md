---
templateKey: doc
title: Compared to OAuth 2.0 and GNAP
description: Both can carry a negotiation. Neither, on its own, puts the deciding party anywhere but the service.
next:
  - title: Compared to policy engines
    to: /docs/overview/compare-policy-engines/
    blurb: The other thing people already run.
  - title: Proof-of-possession
    to: /docs/overview/proof-of-possession/
    blurb: The mechanism both of these can supply.
---

If you already run OAuth, most of this profile will look familiar, because UMA
is built on OAuth and inherits its endpoints and its vocabulary. The question
worth answering is what OAuth alone leaves open.

## OAuth 2.0

In OAuth, a resource owner authorises a client to access their own resources.
The flow assumes the owner is present — the redirect goes to their browser,
they see a consent screen, they approve.

Three things follow from that assumption, and all three break here.

**The owner is the one logging in.** OAuth's authorization endpoint is a place
you send a human. If the owner is asleep and the request came from somebody
else's agent, there is nobody to redirect.

**The client belongs to the service.** Client registration is a relationship
between the application and the authorization server, which is usually operated
by the same party as the resource. An agent from an organisation the service has
never heard of has no obvious place in that model.

**Consent is a moment, not a record.** The consent screen is not an artifact
either side keeps. Nothing is signed and nothing is checkable later.

Extensions address parts of this. Rich Authorization Requests give a structured
way to say what is being asked for. DPoP binds tokens to keys. Token exchange
handles delegation between services. Each is useful and this profile uses ideas
from all of them — but none moves the authority to the owner's side, because
that is not what they were for.

## GNAP

GNAP is the more interesting comparison, because it was designed with the
limitations above in view. It has a real negotiation: a client makes a request,
the server can say what it still needs, and there are defined ways to involve a
party who is not in the request path.

That is the same shape as UMA's claims-gathering, and GNAP does it more cleanly.
Its interaction model is more general, key binding is native rather than an
extension, and its request format expresses "here is what I want" far better
than a scope string.

What GNAP does not decide is **whose policy the answer expresses**. It gives you
excellent machinery for a negotiation between a client and an authorization
server; it does not require that authorization server to belong to a different
party from the resource server, and in most deployments it will not.

That is the axis, and it is not a criticism of GNAP — it is a different
question. A GNAP-based binding of this profile would be a reasonable thing to
build, and probably a cleaner one than the OAuth-shaped binding here.

## What this profile adds on top of either

Whichever you carry it on:

- an authority on the **owner's** side that the resource server cannot overrule
- **terms** the owner states and the requester signs, with a receipt both keep
- a grant bound to **one operation**, so approving an act is not authorising a
  capability
- a defined answer for **what happens while she is asleep**

The four beats are deliberately binding-independent. They can be carried over
OAuth endpoints, over GNAP, or over a JSON-RPC envelope, which is exactly what
the [MCP binding](/docs/reference/mcp-binding/) does.

## If you already have OAuth

You are most of the way to the transport. What you are missing is the party
model: something that holds the owner's policy and is not operated by the
service holding the data. That is the piece to build or adopt, and everything
else here can be layered onto endpoints you already run.

Sources: [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749.html),
[GNAP](https://datatracker.ietf.org/doc/html/rfc9635).
