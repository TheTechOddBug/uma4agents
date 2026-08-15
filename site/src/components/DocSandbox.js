import React, { useState } from "react";

/**
 * The pend rule, as something you operate rather than read.
 *
 * Three inputs decide whether a call grants straight away, waits for Alice, or
 * is refused: whether this agent already has a standing connection with her,
 * which tier the tool sits in, and whether the terms it signed match what she
 * proffered. That is four sentences of prose and about thirty seconds of
 * clicking, and the clicking is what makes the first-contact rule stick — the
 * reader discovers for themselves that an open tier still pends for an agent
 * she has never met.
 *
 * The outcomes here are the ones services/uma-as implements, not a
 * simplification: known connection on a non-ask-me tier grants; a new agent
 * pends as a connection request whatever the tier; an ask-me tier pends per
 * operation; a weakened echo is refused outright.
 */

const TIERS = [
  { id: "tier1", label: "Holdings summary", note: "open tier" },
  { id: "tier2", label: "Transaction history", note: "open tier" },
  { id: "tier3", label: "Execute a trade", note: "ask-me tier" },
];

const decide = ({ known, tier, honest }) => {
  if (!honest)
    return {
      key: "denied",
      verdict: "Refused",
      tone: "denied",
      because:
        "The signed echo does not match what she proffered. A valid signature over weaker terms is the attack, so the negotiation ends here — and her ledger records the refusal.",
      event: "contract.rejected",
    };
  if (!known)
    return {
      key: "connection",
      verdict: "Waits for Alice",
      tone: "pending",
      because:
        "First contact pends whatever the tier. Her policy might permit this call, but she has no standing relationship with this agent yet, and approving one is how the relationship starts.",
      event: "ticket.awaiting_owner · kind=connection",
    };
  if (tier === "tier3")
    return {
      key: "operation",
      verdict: "Waits for Alice",
      tone: "pending",
      because:
        "She marked this tier ask-me, so it pends every time — and what she approves is this operation, not the capability. The grant that follows is bound to these exact parameters.",
      event: "ticket.awaiting_owner · kind=operation",
    };
  return {
    key: "granted",
    verdict: "Granted, without asking her",
    tone: "granted",
    because:
      "A standing connection on a tier she left open. This is the case that has to work while she is asleep, and it is the whole reason her policy lives on her own side.",
    event: "rpt.issued",
  };
};

const Toggle = ({ label, options, value, onChange }) => (
  <div className="doc-sandbox__control">
    <span className="doc-sandbox__label">{label}</span>
    <div className="doc-sandbox__options" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={`doc-sandbox__option${
            o.value === value ? " doc-sandbox__option--on" : ""
          }`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

const DocSandbox = ({ caption }) => {
  const [known, setKnown] = useState(false);
  const [tier, setTier] = useState("tier1");
  const [honest, setHonest] = useState(true);

  const outcome = decide({ known, tier, honest });
  const tierMeta = TIERS.find((t) => t.id === tier);

  return (
    <figure className="doc-diagram doc-sandbox">
      <div className="doc-sandbox__controls">
        <Toggle
          label="This agent"
          value={known}
          onChange={setKnown}
          options={[
            { value: false, label: "She has never seen it" },
            { value: true, label: "Already connected" },
          ]}
        />
        <Toggle
          label="What it is asking for"
          value={tier}
          onChange={setTier}
          options={TIERS.map((t) => ({ value: t.id, label: t.label }))}
        />
        <Toggle
          label="The terms it signed back"
          value={honest}
          onChange={setHonest}
          options={[
            { value: true, label: "Match hers" },
            { value: false, label: "Weakened" },
          ]}
        />
      </div>

      <div className={`doc-sandbox__result doc-sandbox__result--${outcome.tone}`}>
        <p className="doc-sandbox__verdict">{outcome.verdict}</p>
        <p className="doc-sandbox__because">{outcome.because}</p>
        <p className="doc-sandbox__event">
          <span>{tierMeta.note}</span>
          <code>{outcome.event}</code>
        </p>
      </div>

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default DocSandbox;
