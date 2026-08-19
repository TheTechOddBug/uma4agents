---
templateKey: doc
seoTitle: "How to implement decentralized agent authorization: the roles"
title: The roles you must fill
description: Six roles, what each one has to be able to do, and how to judge whether something in your stack can do it.
diagram: roles-map
diagramCaption: Step through to see each role and what it must be able to do. They light up and stay lit, because the last one only makes sense once the other five are there.
next:
  - title: Run the lab
    to: /docs/guides/run-the-lab/
    blurb: See all six filled, working, in about thirteen minutes.
  - title: Choose an enforcement point
    to: /docs/guides/enforcement-point/
    blurb: The role with the most candidates and the sharpest constraints.
---

Before any product names: six roles. Every one of them has to exist somewhere in
your architecture, and several may collapse into components you already run.

This page is the checklist. Each role lists what it must be able to do, how to
tell whether a candidate qualifies, and what the lab used — last, and only as
one example.

## 1. An authority on the owner's side

**Must be able to:** hold the owner's policy, issue and rotate permission
tickets, dictate terms, mint grants, record connections, and answer while the
owner is offline.

**Disqualifying:** anything the resource server operates or can reconfigure.
This is the role the whole design turns on. If the party holding the data can
change the policy, you have built a different system.

**Judge a candidate by:** who can change the rules. Not where it runs — an
authorization server can be hosted anywhere — but whose change control it sits
under.

*In the lab:* a small FastAPI service, because the interesting part is the
protocol rather than the implementation. A production version would put a real
policy engine inside it.

## 2. An enforcement point

**Must be able to:** refuse a call before it reaches the resource, return a
challenge carrying a ticket, verify a request signature, check that a grant
covers the operation being attempted, and burn a single-use grant.

**Disqualifying:** anything that can only make allow/deny decisions and cannot
return structured data with a refusal. The challenge is the whole first beat;
a plain 403 is not enough.

**Judge a candidate by:** whether it can call out to an external authorization
service *before* forwarding, and whether that service can control the response
body, not just the verdict.

*In the lab:* [agentgateway](https://agentgateway.dev) hosting an external
authorization callout. Any gateway with an ext-authz mechanism works, and
[the same core runs embedded](/docs/guides/enforcement-point/) with no gateway
at all.

## 3. A resource that publishes what it is

**Must be able to:** serve a metadata document describing its tool surfaces,
scopes, and which authorization servers are authoritative for it.

**Judge a candidate by:** whether you can put a static document in front of it.
This role is usually the cheapest to fill, because the resource itself does not
have to change.

*In the lab:* an MCP server with no authorization code in it at all, and the
metadata served by the enforcement point in front.

## 4. Somewhere to store single-use state

**Must be able to:** decide and record in one indivisible operation, and tell
the caller whether it won.

**Disqualifying:** anything where you would implement this as read-then-write.
That is correct in one process and wrong in two, and it fails silently.

**Judge a candidate by:** whether a conditional update returning affected rows
is a single round trip. Most relational databases: yes. A cache: possible, with
scripting, and one more stateful thing to explain to whoever is on call.

*In the lab:* Postgres. Every requirement is one statement you can read aloud.

## 5. A way to reach the owner

**Must be able to:** notify her that something is waiting, show her what is
being asked and on what terms, take a decision, and release the held
negotiation.

**Judge a candidate by:** latency tolerance. This path can be slow — she may be
asleep for hours — so anything requiring a synchronous response is the wrong
shape.

*In the lab:* a portal with a live event stream, plus an owner API her token
authorises.

## 6. An identity for the agent

**Must be able to:** give the agent a stable name the owner's authority can
recognise across sessions.

**Judge a candidate by:** whether the name survives key rotation. If it does
not, every rotation looks to the owner like a new agent asking for the first
time.

*In the lab:* both — a pseudonymous agent named by its key's thumbprint, and an
identified one via [AAuth](https://github.com/dickhardt/AAuth).

## What can collapse

Roles 3 and 2 often live in the same deployment. Roles 1 and 5 usually share a
database. What must not collapse is 1 with 2 — the authority and the
enforcement point belong to different parties, and
[keeping them apart](/docs/guides/at-scale/) is the property worth testing.
