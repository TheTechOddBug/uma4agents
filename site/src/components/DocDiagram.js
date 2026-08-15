import React from "react";

/**
 * The documentation's diagrams.
 *
 * Inline SVG rather than files under static/, for one reason: colour. Every
 * other surface on this site takes its colour from src/style/theme.js through
 * CSS custom properties, and an <img src="…svg"> is a separate document that
 * cannot see them. Inline, `var(--accent)` resolves against the page, so a
 * retheme moves the diagrams with everything else and none of these files
 * carries a hex value.
 *
 * A page names one of these in its frontmatter (`diagram: four-beats`). One per
 * page at most, and only where the picture shows a mechanism the prose cannot —
 * a diagram restating the paragraph above it is decoration with a download
 * cost.
 *
 * Drawn at a viewBox width of 600 with 15–19px type, so the labels survive
 * being scaled into a phone-width column. Anything that needs more room than
 * that needs to be two diagrams.
 */

const MONO = "var(--mono)";
const UI = "var(--ui)";

const Frame = ({ title, viewBox, children }) => (
  <svg
    className="doc-diagram__svg"
    viewBox={viewBox}
    role="img"
    aria-label={title}
    fontFamily={UI}
  >
    <title>{title}</title>
    {children}
  </svg>
);

/** A rounded panel with a label. */
const Box = ({ x, y, w, h, stroke = "var(--edge)", fill = "var(--card)" }) => (
  <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} />
);

const Arrow = ({ from, to, y, colour = "var(--accent)", dash }) => (
  <line
    x1={from}
    y1={y}
    x2={to}
    y2={y}
    stroke={colour}
    strokeWidth="1.6"
    strokeDasharray={dash}
    markerEnd={`url(#arrow-${colour === "var(--green)" ? "green" : colour === "var(--red)" ? "red" : "accent"})`}
  />
);

const Markers = () => (
  <defs>
    {[
      ["accent", "var(--accent)"],
      ["green", "var(--green)"],
      ["red", "var(--red)"],
    ].map(([id, fill]) => (
      <marker
        key={id}
        id={`arrow-${id}`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={fill} />
      </marker>
    ))}
  </defs>
);

// ---------------------------------------------------------------------------

/**
 * The four beats as a sequence. Three lanes, because the fourth party — Alice
 * herself — only appears in beat 3, and giving her a full lane would imply she
 * is on the connection. She is not; that is the whole point of the pend.
 */
const FourBeats = () => {
  const lanes = [
    { x: 78, label: "Bob's agent" },
    { x: 300, label: "Enforcement point" },
    { x: 522, label: "Alice's authority" },
  ];
  const steps = [
    { y: 112, from: 0, to: 1, text: "call execute_trade", beat: "1" },
    { y: 146, from: 1, to: 2, text: "register the attempt", dash: "3 3" },
    { y: 180, from: 1, to: 0, text: "401 · ticket · as_uri", colour: "var(--red)" },
    { y: 236, from: 0, to: 2, text: "present the ticket", beat: "2" },
    { y: 270, from: 2, to: 0, text: "need_info · her terms", colour: "var(--amber)" },
    { y: 326, from: 0, to: 2, text: "signed agreement", beat: "3" },
    { y: 396, from: 2, to: 0, text: "grant · bound to this order", colour: "var(--green)", beat: "4" },
    { y: 440, from: 0, to: 1, text: "retry, signed", colour: "var(--green)" },
  ];

  return (
    <Frame title="The four beats of a grant" viewBox="0 0 600 480">
      <Markers />

      {lanes.map((l) => (
        <g key={l.label}>
          <text
            x={l.x}
            y="26"
            textAnchor="middle"
            fill="var(--ink)"
            fontSize="14"
            fontWeight="600"
          >
            {l.label}
          </text>
          <line
            x1={l.x}
            y1="40"
            x2={l.x}
            y2="460"
            stroke="var(--edge)"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Beat 3 is where she is asked, and it is the only beat that can wait. */}
      <rect
        x="470"
        y="344"
        width="104"
        height="34"
        rx="6"
        fill="var(--tint-granted)"
        stroke="var(--amber)"
      />
      <text
        x="522"
        y="365"
        textAnchor="middle"
        fill="var(--amber)"
        fontSize="12.5"
      >
        Alice decides
      </text>

      {steps.map((s, i) => {
        const x1 = lanes[s.from].x;
        const x2 = lanes[s.to].x;
        const forward = x2 > x1;
        return (
          <g key={i}>
            {s.beat && (
              <text
                x="12"
                y={s.y + 4}
                fill="var(--primary)"
                fontSize="15"
                fontWeight="700"
                fontFamily={MONO}
              >
                {s.beat}
              </text>
            )}
            <Arrow
              from={forward ? x1 + 4 : x1 - 4}
              to={forward ? x2 - 6 : x2 + 6}
              y={s.y}
              colour={s.colour}
              dash={s.dash}
            />
            <text
              x={(x1 + x2) / 2}
              y={s.y - 8}
              textAnchor="middle"
              fill="var(--ink-2)"
              fontSize="12.5"
            >
              {s.text}
            </text>
          </g>
        );
      })}
    </Frame>
  );
};

// ---------------------------------------------------------------------------

/**
 * The seam. Everything else in the profile is machinery for keeping this line
 * where it is: the party holding the assets enforces a policy it cannot read.
 */
const TrustBoundary = () => (
  <Frame
    title="The trust boundary between the owner and the resource server"
    viewBox="0 0 600 330"
  >
    <Markers />

    <line
      x1="300"
      y1="14"
      x2="300"
      y2="316"
      stroke="var(--edge-strong)"
      strokeWidth="1.4"
      strokeDasharray="6 5"
    />

    {/* Owner's side */}
    <text x="24" y="28" fill="var(--accent)" fontSize="12" fontFamily={MONO} letterSpacing="1.4">
      ALICE — THE OWNER
    </text>
    <Box x={24} y={44} w={244} h={106} stroke="var(--accent)" />
    <text x="40" y="70" fill="var(--ink)" fontSize="14" fontWeight="600">
      Her authorization server
    </text>
    {["her policy and tiers", "her terms roster", "her connections and ledger"].map(
      (t, i) => (
        <text key={t} x="40" y={92 + i * 19} fill="var(--ink-2)" fontSize="12.5">
          · {t}
        </text>
      )
    )}
    <Box x={24} y={166} w={244} h={52} stroke="var(--accent)" />
    <text x="40" y={197} fill="var(--ink)" fontSize="13.5">
      Her portal — where she is asked
    </text>

    {/* Resource server's side */}
    <text x="332" y="28" fill="var(--ink-3)" fontSize="12" fontFamily={MONO} letterSpacing="1.4">
      MERIDIAN — THE RESOURCE SERVER
    </text>
    <Box x={332} y={44} w={244} h={70} />
    <text x="348" y="70" fill="var(--ink)" fontSize="14" fontWeight="600">
      Enforcement point
    </text>
    <text x="348" y="92" fill="var(--ink-2)" fontSize="12.5">
      refuses, verifies, spends
    </text>
    <Box x={332} y={130} w={244} h={62} />
    <text x="348" y="156" fill="var(--ink)" fontSize="14" fontWeight="600">
      The vault
    </text>
    <text x="348" y="177" fill="var(--ink-2)" fontSize="12.5">
      holds the assets
    </text>

    {/* What crosses, and what does not */}
    <Arrow from={330} to={272} y={244} colour="var(--green)" />
    <text x="332" y={239} fill="var(--green)" fontSize="12.5">
      ticket · introspect · consume
    </text>

    <line
      x1="330"
      y1="282"
      x2="272"
      y2="282"
      stroke="var(--red)"
      strokeWidth="1.6"
      strokeDasharray="4 4"
    />
    <g stroke="var(--red)" strokeWidth="2">
      <line x1="294" y1="276" x2="306" y2="288" />
      <line x1="306" y1="276" x2="294" y2="288" />
    </g>
    <text x="332" y={277} fill="var(--red)" fontSize="12.5">
      read her policy
    </text>
    <text x="332" y={296} fill="var(--ink-3)" fontSize="11.5">
      403 — same port, same workload
    </text>
  </Frame>
);

// ---------------------------------------------------------------------------

/** Two discovery layers, split by who is allowed to ask. */
const DiscoveryLayers = () => (
  <Frame title="Public and protected discovery" viewBox="0 0 600 300">
    <Markers />

    <Box x={20} y={30} w={560} h={104} />
    <text x="40" y="56" fill="var(--ink)" fontSize="14" fontWeight="600">
      Public — structure
    </text>
    <text x="560" y="56" textAnchor="end" fill="var(--green)" fontSize="12.5">
      anyone may ask
    </text>
    {[
      "which tools exist, and the scopes they need",
      "which authorization servers are authoritative",
      "the resource's keys, and metadata signed under them",
    ].map((t, i) => (
      <text key={t} x="40" y={80 + i * 19} fill="var(--ink-2)" fontSize="12.5">
        · {t}
      </text>
    ))}

    <Box x={20} y={158} w={560} h={104} stroke="var(--accent)" />
    <text x="40" y="184" fill="var(--ink)" fontSize="14" fontWeight="600">
      Protected — instances
    </text>
    <text x="560" y="184" textAnchor="end" fill="var(--accent)" fontSize="12.5">
      only the owner's authority
    </text>
    {[
      "whose vault sits behind this resource",
      "the ids, names and scopes of her instances",
      "served only to an RFC 9421-signed query",
    ].map((t, i) => (
      <text key={t} x="40" y={208 + i * 19} fill="var(--ink-2)" fontSize="12.5">
        · {t}
      </text>
    ))}

    <text x="20" y="288" fill="var(--ink-3)" fontSize="11.5">
      Publishing the lower band openly would say which resources Alice owns to anyone who asks.
    </text>
  </Frame>
);

// ---------------------------------------------------------------------------

/** The enforcement order, and the placement that looks right and is not. */
const EnforcementOrder = () => {
  const steps = [
    ["1", "Introspect", "live? connection standing?"],
    ["2", "Scope", "does this grant cover this tool?"],
    ["3", "Signature", "does the caller hold the key?"],
    ["4", "Operation", "is this the approved order?"],
    ["5", "Consume", "spend it — atomically"],
  ];

  return (
    <Frame title="The order enforcement runs in" viewBox="0 0 600 320">
      <Markers />
      {steps.map(([n, name, note], i) => {
        const y = 20 + i * 56;
        const last = i === steps.length - 1;
        return (
          <g key={n}>
            <Box
              x={20}
              y={y}
              w={420}
              h={44}
              stroke={last ? "var(--primary)" : "var(--edge)"}
              fill={last ? "var(--tint-granted)" : "var(--card)"}
            />
            <text
              x={40}
              y={y + 28}
              fill={last ? "var(--primary)" : "var(--ink-3)"}
              fontSize="15"
              fontWeight="700"
              fontFamily={MONO}
            >
              {n}
            </text>
            <text x={64} y={y + 28} fill="var(--ink)" fontSize="14" fontWeight="600">
              {name}
            </text>
            <text x={168} y={y + 28} fill="var(--ink-2)" fontSize="12.5">
              {note}
            </text>
            {i < steps.length - 1 && (
              <line
                x1="30"
                y1={y + 44}
                x2="30"
                y2={y + 56}
                stroke="var(--edge-strong)"
                strokeWidth="1.4"
              />
            )}
          </g>
        );
      })}

      <line
        x1="452"
        y1="42"
        x2="452"
        y2="278"
        stroke="var(--edge)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text x="466" y="34" fill="var(--red)" fontSize="12.5" fontWeight="600">
        Spending here
      </text>
      <text x="466" y="52" fill="var(--ink-2)" fontSize="12">
        instead lets an
      </text>
      <text x="466" y="68" fill="var(--ink-2)" fontSize="12">
        unsigned replay
      </text>
      <text x="466" y="84" fill="var(--ink-2)" fontSize="12">
        destroy an approval
      </text>
      <text x="466" y="100" fill="var(--ink-2)" fontSize="12">
        Alice just gave.
      </text>
      <g stroke="var(--red)" strokeWidth="1.8">
        <line x1="446" y1="14" x2="458" y2="26" />
        <line x1="458" y1="14" x2="446" y2="26" />
      </g>
    </Frame>
  );
};

// ---------------------------------------------------------------------------

const diagrams = {
  "four-beats": FourBeats,
  "trust-boundary": TrustBoundary,
  "discovery-layers": DiscoveryLayers,
  "enforcement-order": EnforcementOrder,
};

const DocDiagram = ({ name, caption }) => {
  const Chosen = diagrams[name];
  if (!Chosen) return null;
  return (
    <figure className="doc-diagram">
      <Chosen />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default DocDiagram;
