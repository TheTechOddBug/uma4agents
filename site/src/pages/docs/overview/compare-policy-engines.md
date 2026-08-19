---
templateKey: doc
title: Compared to policy engines
seoTitle: "OPA, Cedar and AuthZEN vs UMA for Agents: whose policy decides"
description: OPA, Cedar and AuthZEN decide well. They do not decide whose policy is being expressed, and the two compose.
next:
  - title: Compared to agent identity work
    to: /docs/overview/compare-agent-identity/
    blurb: The other thing this is often confused with.
  - title: The roles you must fill
    to: /docs/guides/roles/
    blurb: Where an engine fits in what you build.
---

This is the comparison most people want first, because a policy engine is
usually already in the stack. The short answer is that they solve different
problems and belong together.

## What each one actually does

[Open Policy Agent](https://www.openpolicyagent.org) and
[Cedar](https://www.cedarpolicy.com) decentralise **where a decision is
computed**. Policy travels to the enforcement point instead of every call
travelling to a central service. That is a latency and blast-radius win, and it
is why they are deployed as widely as they are.

[AuthZEN](https://openid.net/wg/authzen/) standardises **how a decision is asked
for**, so a PEP and a PDP from different vendors can talk. That is an
interoperability win, and it is overdue.

Neither changes **whose policy the decision expresses**.

## Why that is not a criticism

In the workloads those tools were built for, the operator of the service *is*
the party with authority to decide. A company deciding which employees may read
which records is correctly modelled by an engine loaded with the company's
policy. There is no missing party.

The case this profile is about is the one where the operator is not the
deciding party — where a brokerage holds Alice's money and cannot answer for
Alice. The engine is still the right way to evaluate her rules. What is missing
is a place for her rules to live that the brokerage does not control.

## How they compose

Concretely, in the architecture here:

- the owner's **authorization server** is the PDP for her resources
- her **tiers** are the policy that PDP evaluates
- the **enforcement point** on the resource server's side is the PEP

An engine slots in as the evaluation core of that authorization server. Her
tiers become the policy the engine loads; the profile handles everything around
the decision — how the requester is challenged, how terms are stated and signed,
what happens when the answer is "ask me", and how the result binds to a key and
an operation.

You would use an engine here for exactly the reasons you use one anywhere: a
real policy language, testable rules, and decisions you can explain.

## What an engine cannot supply on its own

Three things, and they are the parts this profile is about:

**A negotiation.** An engine answers a question. It has no notion of telling the
caller what it would need in order to say yes, waiting while a human is asked,
and resuming. The lab's ask-me path is a negotiation that survives the
authorization server being deleted mid-request.

**Terms.** An engine produces a decision, not a signed statement of what the
requester undertook. Nothing to counter-sign, nothing to keep.

**A party boundary.** Loading Alice's policy into the brokerage's engine gives
the brokerage her policy. The interesting property is that it cannot read it —
which is a deployment and topology question that no engine addresses, and which
the [at-scale guide](/docs/guides/at-scale/) is largely about.

## AuthZEN's Access Request and Approval Profile

The [Access Request and Approval
Profile](https://openid.github.io/authzen/authzen-access-request-approval-profile-1_0.html)
(ARAP) deserves its own treatment, because it is the closest thing to the
ask-me path in this profile and the mechanisms rhyme closely.

Its flow: the PDP denies but marks the denial **requestable**, returning a
context that says where to ask. The PEP submits an access request and gets back
an opaque task handle. It polls, or waits for a callback. When an approver
decides, the PEP re-evaluates against the PDP, which reads the approval as an
input attribute rather than treating it as a token.

Three of those choices match decisions made here independently, which is worth
noticing. A refusal that carries where-to-negotiate is our
[challenge and ticket](/docs/overview/four-beats/). An opaque handle that
survives polling is our permission ticket and its stable family id. And
re-evaluating rather than trusting the approval is the same instinct as
[spending the grant last](/docs/overview/proof-of-possession/) — an approval
that works like a bearer token is an approval anyone who intercepts it can use.

Two differences matter.

**Who approves.** ARAP deliberately does not define the approver's workflow, and
the deployments it anticipates are governance systems — IGA platforms, ITSM
tools, an approver inbox. The approver is an administrator acting for the
organisation that runs the PDP. Here the approver is the **resource owner**, and
the whole design turns on her not being an administrator of anything.

**What is agreed.** ARAP's approval is an attribute the PDP considers. There is
no artifact stating what the requester undertook, and nothing signed. This
profile's [terms](/docs/overview/terms/) exist because when the approving party
is a person consenting about her own data rather than an admin granting an
entitlement, "she approved" needs to be checkable afterwards.

Neither is a flaw in ARAP. It is solving access governance inside an
organisation, and doing it in a way that composes cleanly with the engine you
already run. If your approver is an admin, it is very likely the right answer,
and a deployment could reasonably use ARAP for the enterprise half and something
owner-side for the rest.

## The honest summary

If you have an engine and you are asking "what does this add", the answer is a
party model and a negotiation. If you are building this profile and asking
"should I use an engine", the answer is almost certainly yes, inside the
authorization server.
