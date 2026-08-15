---
templateKey: doc
title: Make single-use indivisible
description: Why the burn has to be one statement, how to write it in a relational store, and how to test something that only fails under concurrency.
next:
  - title: Wire the owner's approval path
    to: /docs/guides/approval/
    blurb: The other half of an ask-me grant.
  - title: Single-use means indivisible
    to: /docs/overview/single-use/
    blurb: The concept, if you want the shorter version.
---

A single-use grant is a promise the owner is relying on: she approved one trade,
and the credential she authorized will buy exactly one. Everything else in the
design is worth less if that promise is probabilistic.

This is a short guide about one operation, because the operation is where it
goes wrong.

## Prerequisites

- A store where a conditional update can report whether it changed anything
- The [enforcement order](/docs/guides/grant/) already in place, with consume
  last

## The failure this prevents

The obvious implementation:

```python
rec = store.get(jti)          # is it spent?
if rec.consumed:
    deny()
store.set(jti, consumed=True) # spend it
allow()
```

Correct in one process with one thread. Wrong the moment two enforcement point
replicas handle two copies of the same call, which is what happens when an agent
retries on a timeout, or when a load balancer duplicates under pressure, or when
someone is deliberately looking for this.

Both read `consumed = false`. Both proceed. The owner approved one trade and two
were placed.

Nothing logs an error. Both requests passed every check. The only evidence is in
the resource's own records, discovered later by whoever reconciles them.

## Write it as one statement

The whole fix is that the decision and the record are the same operation:

```sql
UPDATE rpts SET consumed = true
 WHERE jti = $1 AND consumed = false
RETURNING family;
```

Whether a row came back **is** the verdict. One caller gets a row and proceeds;
every other caller gets nothing and denies. The database is doing what it is for.

Notice what is not here: no transaction block, no advisory lock, no
select-for-update, no retry loop. A single conditional update is already atomic,
and adding ceremony around it obscures that.

## Return the outcome honestly

The consume endpoint answers with whether it won:

```json
{ "consumed": true,  "family": "fam_8f3a…" }
{ "consumed": false, "error": "already_consumed" }
```

The enforcement point must treat `consumed: false` as a denial, without
exception. This sounds obvious and is exactly the branch that gets written as a
warning log during a debugging session and never changed back.

## Apply the same shape to tickets

The ticket rotation in beat three has the same requirement and the same answer:

```sql
DELETE FROM tickets WHERE id = $1 RETURNING family;
```

Every presentation consumes the ticket. One caller gets the row and receives a
rotated ticket; a concurrent replay gets nothing.

The same goes for bulk revocation — marking every live grant behind a revoked
connection consumed is one statement with a `RETURNING` clause, not a loop over
a list you fetched a moment ago.

## Choosing a store for this

Any store where the conditional update is a single round trip that reports
affected rows will do. Most relational databases: yes, straightforwardly.

A key-value cache can do it, through scripting or a watch-and-retry loop, and
then you own the retry semantics and have a second stateful component to explain
to whoever is on call. Nothing in this workload is hot enough to need one.

If your store cannot express "change this only if it is still in that state, and
tell me whether you did", it is the wrong store for this role.

## Test it under concurrency

A test that spends a grant once and replays it once will pass against the broken
implementation. Sequential replay is not the failure mode.

Fire the same grant from N callers at once and assert exactly one success:

```python
results = await asyncio.gather(*[call_with(rpt) for _ in range(20)])
assert sum(r.status == 200 for r in results) == 1
```

Run it against a store with more than one replica, and run it more than once —
races that fail one time in fifty are the ones that reach production.

Add a chaos check too. Put a request in front of the owner, delete the
authorization server instance holding it, kill the database primary, wait for
failover, then have her answer *that same request*. Starting a fresh negotiation
afterwards would prove the system still works, which is not the question. The
lab does this in `make k8s-chaos`.

## Troubleshooting

**Replays succeed occasionally under load.** The consume is read-then-write, or
it is being called before the signature check and something is retrying between
the two.

**Every call is denied as already consumed.** Consume is running more than once
per request — commonly a retry wrapper around the store call, which spends the
grant and then reports the second attempt's failure.

**Approvals are lost when a pod restarts.** Held tickets are in process memory.
They belong in the same store as everything else that has to survive an instance
disappearing.
