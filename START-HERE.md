# Start here

You are in a Codespace with the whole lab ready to run. Nothing to install.

The premise: **Alice's money sits at a brokerage. Bob's AI agent wants at it.
Alice is asleep.** You will play both sides — the agent from this terminal,
Alice from her portal — and watch her policy decide without her.

The **k8s-topology** tab beside this one is what you are about to build:
one namespace per party, a mesh between them, and the authorization server
replicated behind a database. Worth thirty seconds now — the namespaces in
it are the ones `kubectl get pods -A` will show you.

## 1. Bring it up — about 13 minutes

```bash
make kind-up
```

A three-node Kubernetes cluster, one namespace per party, a service mesh
between them. Most of the time is image pulls.

Notice there is no `make init` and no certificate on your machine —
cert-manager issues the lab's CA inside the cluster.

## 2. Check it

```bash
make k8s-smoke-test
```

Expect **13 passed, 0 failed**. If you see fewer, something is still
settling — wait a minute and run it again.

```bash
make k8s-policy-test
```

Expect **11 passed, 0 failed** — and note that eight of them are *refusals*.
A policy suite that only proves the allows would pass on a cluster with no
policy at all.

## 3. Watch Alice's day

```bash
make k8s-demo-all SIM=1
```

Three acts. A holdings request that is granted automatically because her
terms already permit it. A transaction history request under stricter terms.
Then a trade — which her policy says she must approve personally, so it
*pends* until she taps. `SIM=1` taps for you.

```bash
make k8s-audit
```

The ledger: what the agent **promised**, what Alice **approved**, what it
actually **touched**.

## 4. Be Alice yourself

```bash
make codespaces-web
```

Then open it from the **PORTS** tab, beside the terminal: find
**Alice's portal** on 9010 and use its open-in-browser action. Sign in as
**alice / alice-demo**.

The URL is also printed by the command above, and is predictable —
`https://<codespace-name>-9010.app.github.dev`.

Now run the trade act *without* the simulator and approve it yourself:

```bash
make k8s-demo-all ACT=tier3 SIM=0
```

Watch the request arrive in her portal, approve it, and see the agent
receive a grant good for exactly that one trade.

> The forwarded ports stay **private**, which is what you want: this lab
> ships fixed development credentials, and a public port would put them on
> the internet behind nothing but an unguessable URL. Private ports open
> fine in your own browser because you are already signed in to GitHub.

## 5. Try to break it

```bash
make k8s-chaos
```

Puts a request in front of Alice, deletes the authorization server that
accepted it, kills the database primary, waits for failover, then has her
answer *that same request*. Not a fresh one.

## Where to read more

- **[docs/KUBERNETES.md](docs/KUBERNETES.md)** — the same walkthrough with
  what to notice at each step, plus the five traps this deployment hit
- **[docs/PROTOCOL.md](docs/PROTOCOL.md)** — the wire contract, and where
  this profile deviates from UMA 2.0 and why
- **[FINDINGS.md](FINDINGS.md)** — the recommendations to the spec authors,
  each backed by something in here that runs

## When you are done

**Closing the browser tab does not stop it.** The Codespace keeps running
until it idles out, and a stopped Codespace still bills storage. To actually
finish:

- **Stop it** (keeps your work, stops burning compute hours) —
  Command Palette (`F1`) → *Codespaces: Stop Current Codespace*
- **Delete it** (nothing here is worth keeping; the lab rebuilds from the
  repo in thirteen minutes) — <https://github.com/codespaces> → the `...`
  menu beside this Codespace → *Delete*

From your own machine, `gh codespace list` shows what you have running, and
`gh codespace delete -c <name>` removes one.

The machine this lab asks for is a 2× tier, so it spends the free monthly
allowance about twice as fast as the smallest one — roughly 60 hours a month
on a free account. Worth deleting rather than leaving idle.
