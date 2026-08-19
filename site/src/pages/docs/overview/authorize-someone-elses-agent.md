---
templateKey: doc
seoTitle: "How do you authorize an AI agent that belongs to someone else?"
title: Someone else's agent is asking
description: Your resource server is being asked for a customer's data by an AI agent from a company you have no relationship with. Why enterprise SSO does not cover this case, and what does.
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
| Ask the owner in the moment | She is asleep. The request still has to be decided, and decided her way. |

The gap is not authentication. You can establish perfectly well *who* is
calling. The gap is **authorization on behalf of someone who is not present
and is not yours**.

## What actually closes it

Give the owner an authorization server of her own, and make your resource
server the place her terms are enforced rather than the place policy lives.

Concretely, the refusal carries the route to a yes:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: UMA realm="alice-vault",
  as_uri="https://alice-as.example",
  ticket="<ticket>",
  scope="positions:read"
```

`as_uri` names **her** authorization server, not yours and not the agent's.
`ticket` is a handle to a negotiation that has already started on her side. An
agent that has never met her now knows exactly where to go and what it is
holding — which is the cold-start problem solved in two parameters.

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
