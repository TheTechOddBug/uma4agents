---
templateKey: doc
seoTitle: "How do you authorize an AI agent that belongs to someone else?"
title: Someone else's agent is asking
description: A third-party AI agent is asking your resource server for a customer's data on behalf of a person who does not work for you. Why enterprise SSO, API keys and CIBA do not cover this case, and what does.
next:
  - title: Why the owner decides
    to: /docs/overview/why/
    blurb: The argument for putting the authority on her side.
  - title: The four beats
    to: /docs/overview/four-beats/
    blurb: What the negotiation actually looks like on the wire.
---

An agent arrives at your API. It is well-behaved, it holds a credential, and
it is asking for a specific customer's data. It belongs to a company you have
never contracted with, acting for a person who is not your user.

What do you do?

## Why your current answer does not cover it

Every mature answer to "should this caller be allowed in" assumes the caller
and the data's owner are inside one trust domain. In classic enterprise SSO
they are: the employee asking for the file and the employer who owns the file
share an identity provider, so one federation decision covers both.

An agent economy is not shaped like that. In UMA's vocabulary, the
**requesting party is not the resource owner** — and once those come apart,
each of the usual moves stops working:

| Approach | Why it does not reach |
|---|---|
| Federate the caller | You can federate the *firm*. You cannot federate their client, who does not work there and has never heard of your identity provider. |
| Issue them an API key | A key says who is calling. It says nothing about whether the person whose data it is agreed to this. |
| Allow-list the agents you trust | Someone maintains that list forever, for parties they have no relationship with — and it is an access-control list, which is the thing that does not scale. |
| Delegate through the enterprise | An admin can consent for data the enterprise owns. Nobody at Bob's firm, and nobody at yours, has standing to consent on Alice's behalf. |

The gap is not authentication. You can establish perfectly well *who* is
calling. The gap is **authorization on behalf of someone who is not present
and is not yours**.

## "We already push approvals to the customer"

This is the serious objection, and it deserves more than a table row. Backchannel
authentication — CIBA, and the asynchronous-authorization and human-in-the-loop
features built on it — genuinely solves the absent-human problem. The agent
asks, your identity provider pushes to Alice's phone, she taps, the agent
proceeds. That is real, it ships today, and for a great many agent workflows it
is the right answer.

What it does not move is **whose policy is being expressed**.

- **You decide when she is asked.** The rule that says a trade needs her tap and
  a balance check does not is your rule, in your policy store, changed by your
  change-control process. She cannot write it, read it, or tighten it.
- **You decide what she is asked.** She gets approve or deny. She does not get
  to state a purpose the agent must accept, a retention prohibition, or an
  expiry — because there is no artifact in the flow for her to author.
- **Nothing survives the tap.** An approval is an event. There is no standing
  relationship with Bob's agent that she can see listed, and no revoke button
  next to it, because from your system's point of view no relationship was ever
  created — only a series of prompts.
- **She is a dependency, not an authority.** If your rule does not fire, she is
  never asked, and she has no way to know that.

Put plainly: with a backchannel approval she has a button. What she does not
have is authority. Those look identical in a demo and diverge the first time
somebody asks who decided.

The two also compose rather than compete. A backchannel push is a perfectly good
*transport* for reaching an owner whose authority has decided to ask her — it is
one implementation of the surface described in
[wire the owner's approval path](/docs/guides/approval/). The question this
profile answers is the one underneath it: who wrote the rule that reached for
the phone.

## What actually closes it

Give the owner an authorization server of her own, and make your resource
server the place her terms are enforced rather than the place policy lives.

Concretely, the refusal carries the route to a yes:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: UMA realm="alice-vault",
  as_uri="https://alice-as.example",
  ticket="<ticket>",
  resource_metadata="https://api.example/.well-known/oauth-protected-resource/mcp",
  scope="positions:read"
```

`as_uri` names **her** authorization server, not yours and not the agent's.
`ticket` is a handle to a negotiation that has already started on her side. An
agent that has never met her now knows exactly where to go and what it is
holding, which is the cold-start problem gone.

`resource_metadata` is the check that keeps it from being a redirect
primitive. It points at what your resource server
[publishes about itself](/docs/overview/discovery/), which independently names
the authorization servers it will accept. A client corroborates the two before
it trusts either — otherwise anything that can return a `401` can send an agent
off to negotiate with a server of its own choosing.

The header is one encoding, not the contract. A resource enforcing in-process
has no status line to decorate and returns the same three parameters in a
JSON-RPC error instead; one client understands both. That distinction is
[recommendation 7](/docs/reference/findings/).

From there the agent presents the ticket, her authority dictates the terms she
requires, the agent signs them or walks away, and a grant is issued that is
bound to a key and often to a single operation. That sequence is
[the four beats](/docs/overview/four-beats/).

## What this changes for you

Your resource server stops holding policy. It holds no allow-list, keeps no
per-customer rules about third-party agents, and needs to know nothing about
whoever is asking — because the decision was never yours to make. What it
gains is a defensible record: what the agent promised, what the owner
personally approved, and what was actually touched, correlated by negotiation.

What the *owner* gains is the ability to say yes to an agent she has never
heard of, on terms she wrote before it arrived.

## Where to go next

- [Why the owner decides](/docs/overview/why/) — the argument, at length
- [The three parties](/docs/overview/parties/) — owner, requesting party, requesting agent, and why the distinction matters
- [Agents you cannot pre-register](/docs/overview/agents-you-cannot-pre-register/) — the scaling half of the same problem
