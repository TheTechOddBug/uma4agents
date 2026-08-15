---
templateKey: doc
title: Single-use means indivisible
description: Once has to mean once across every replica, which makes it a property of how you write to the store rather than of the protocol.
next:
  - title: Make single-use indivisible
    to: /docs/guides/indivisible/
    blurb: The interface that makes this hard to get wrong.
  - title: Revocation and the ledger
    to: /docs/overview/revocation/
    blurb: The same lesson, applied to withdrawal.
---

Two things in this profile are spent exactly once: the permission ticket, and a
per-operation grant. UMA 2.0 requires the first; the profile adds the second.

Neither specification says *how* "once" is enforced, because in a single process
the question is invisible.

## The bug that hides in one process

Read the flag, decide, write the flag:

```python
claims, rec, err = _decode_rpt(token)   # read
if err:
    return {"consumed": False, "error": err}
rec["consumed"] = True                  # write
```

This is correct, and it stays correct for as long as there is exactly one
process. A single event loop never yields between those two lines, so nothing
can interleave.

That correctness is a property of the deployment, not of the design. Add a
second replica and two callers present the same approved trade to two different
servers. Both read `false`. Both write `true`. Both are told yes.

The trade executes twice and nothing logs an error, because from each server's
point of view nothing went wrong.

## What replaces it

One statement that decides and records together:

```sql
UPDATE rpts SET consumed = true
 WHERE jti = $1 AND consumed = false
RETURNING family;
```

Zero rows means you lost the race, which means you deny. The database is the
only thing that has to be right about ordering, and it already is.

## Design the interface, not the storage

The deeper lesson is about the shape of the store's API, and it generalises past
this protocol.

A first sketch is `get(key)` and `put(key, value)`. That is exactly wrong: it
preserves the check-then-act shape and merely moves the race onto the network.
Every method that guards a single-use thing should be an **intent** that decides
and records in one step, and reports whether the caller won.

`consume_ticket`. `consume_rpt`. Not `get` and `set`.

Once you have that lens, siblings appear. Revoking a resource server flipped a
status that every protection call reads. Revoking a connection burned live
grants in a second step that could fail independently — leaving the agent
holding exactly the authority the owner had just withdrawn.

## Proving it

Correctness under concurrency is not something to reason about and then believe.
The lab races callers at each single-use artifact — many at once, against both
storage backends — and asserts exactly one wins.

That suite is what tells you the property still holds after a refactor, which
matters because the broken version passes every functional test. Both
implementations answer identically when called once.

## Why it is in a specification's interest

A specification that says "single-use" without saying "indivisible" is read by
implementers who will write the correct-in-one-process version, ship it, and
scale it later. The failure surfaces as a duplicate transaction with no error
anywhere.

That is [recommendation 9](/docs/reference/findings/) in the findings, and it is
the one that came directly from watching it happen.
