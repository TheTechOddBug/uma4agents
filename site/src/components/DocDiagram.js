import React from "react";
import DocFigure from "./DocFigure";

/**
 * The documentation's diagrams, still and moving.
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
 * Some of them move. Motion is for the two things a still picture genuinely
 * cannot carry: *ordering* (what happens if you do these in a different
 * sequence) and *interleaving* (two things happening at once). The trust
 * boundary and the discovery split are structure, so they stay still.
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

const Box = ({ x, y, w, h, stroke = "var(--edge)", fill = "var(--card)", ...rest }) => (
  <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} {...rest} />
);

const Markers = () => (
  <defs>
    {[
      ["accent", "var(--accent)"],
      ["green", "var(--green)"],
      ["red", "var(--red)"],
      ["amber", "var(--amber)"],
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

const markerFor = (colour) =>
  ({
    "var(--green)": "url(#arrow-green)",
    "var(--red)": "url(#arrow-red)",
    "var(--amber)": "url(#arrow-amber)",
  }[colour] || "url(#arrow-accent)");

const Arrow = ({ from, to, y, colour = "var(--accent)", dash }) => (
  <line
    x1={from}
    y1={y}
    x2={to}
    y2={y}
    stroke={colour}
    strokeWidth="1.6"
    strokeDasharray={dash}
    markerEnd={markerFor(colour)}
  />
);

// ---------------------------------------------------------------------------
// The four beats
// ---------------------------------------------------------------------------

const LANES = [
  { x: 78, label: "Bob's agent" },
  { x: 300, label: "Enforcement point" },
  { x: 522, label: "Alice's authority" },
];

const STEPS = [
  { y: 112, from: 0, to: 1, text: "call execute_trade", beat: "1" },
  { y: 146, from: 1, to: 2, text: "register the attempt", dash: "3 3" },
  { y: 180, from: 1, to: 0, text: "401 · ticket · as_uri", colour: "var(--red)" },
  { y: 236, from: 0, to: 2, text: "present the ticket", beat: "2" },
  { y: 270, from: 2, to: 0, text: "need_info · her terms", colour: "var(--amber)" },
  { y: 326, from: 0, to: 2, text: "signed agreement", beat: "3" },
  {
    y: 396,
    from: 2,
    to: 0,
    text: "grant · bound to this order",
    colour: "var(--green)",
    beat: "4",
  },
  { y: 440, from: 0, to: 1, text: "retry, signed", colour: "var(--green)" },
];

const FourBeats = () => (
  <Frame title="The four beats of a grant" viewBox="0 0 600 480">
    <Markers />

    {LANES.map((l) => (
      <g key={l.label}>
        <text x={l.x} y="26" textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="600">
          {l.label}
        </text>
        <line x1={l.x} y1="40" x2={l.x} y2="460" stroke="var(--edge)" strokeWidth="1" />
      </g>
    ))}

    {/* Beat 3 is where she is asked, and the only beat that can wait. */}
    <g className="fb-wait">
      <rect
        x="470"
        y="344"
        width="104"
        height="34"
        rx="6"
        fill="var(--tint-granted)"
        stroke="var(--amber)"
      />
      <text x="522" y="365" textAnchor="middle" fill="var(--amber)" fontSize="12.5">
        Alice decides
      </text>
    </g>

    {STEPS.map((s, i) => {
      const x1 = LANES[s.from].x;
      const x2 = LANES[s.to].x;
      const forward = x2 > x1;
      return (
        <g key={i} className={`fb-step fb-step-${i}`}>
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

/** Which arrows belong to which beat. */
const BEAT_STEPS = [[0], [1, 2], [3, 4], [5], [6, 7]];

const dimAll = { ".fb-step": { opacity: 0.12 }, ".fb-wait": { opacity: 0.12 } };
const litThrough = (n) => {
  const state = { ...dimAll };
  BEAT_STEPS.slice(0, n + 1)
    .flat()
    .forEach((i) => {
      state[`.fb-step-${i}`] = { opacity: 1 };
    });
  return state;
};

const fourBeatScenes = [
  {
    text: "Bob's agent calls a protected tool. It holds no grant, so nothing about the call is allowed yet.",
    reset: dimAll,
    end: litThrough(0),
    play: (animate, $$) => animate($$(".fb-step-0"), { opacity: [0.12, 1], duration: 500 }),
  },
  {
    text: "The enforcement point registers the attempt with Alice's authority, then refuses — handing back a ticket and the address of the authority that could grant it.",
    end: litThrough(1),
    play: (animate, $$) =>
      animate($$(".fb-step-1, .fb-step-2"), {
        opacity: [0.12, 1],
        duration: 500,
        delay: (el, i) => i * 320,
      }),
  },
  {
    text: "The agent presents the ticket. Instead of a grant it gets Alice's terms, and a fresh ticket — every presentation rotates it.",
    end: litThrough(2),
    play: (animate, $$) =>
      animate($$(".fb-step-3, .fb-step-4"), {
        opacity: [0.12, 1],
        duration: 500,
        delay: (el, i) => i * 320,
      }),
  },
  {
    text: "It signs the terms and presents again. Alice is asleep, so the negotiation waits on her — the agent holds a ticket rather than a call.",
    hold: 3600,
    end: { ...litThrough(3), ".fb-wait": { opacity: 1 } },
    play: (animate, $$) => {
      animate($$(".fb-step-5"), { opacity: [0.12, 1], duration: 500 });
      animate($$(".fb-wait"), {
        opacity: [0.12, 1],
        duration: 700,
        delay: 500,
      });
      animate($$(".fb-wait rect"), {
        strokeWidth: [1, 2.4, 1],
        duration: 1200,
        loop: 2,
        delay: 900,
      });
    },
  },
  {
    text: "She approves. The grant is bound to that one order, and the agent retries the original call with its signature over it.",
    end: { ...litThrough(4), ".fb-wait": { opacity: 1 } },
    play: (animate, $$) =>
      animate($$(".fb-step-6, .fb-step-7"), {
        opacity: [0.12, 1],
        duration: 500,
        delay: (el, i) => i * 380,
      }),
  },
];

// ---------------------------------------------------------------------------
// The trust boundary — structure, so it does not move
// ---------------------------------------------------------------------------

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

    <text x="24" y="28" fill="var(--accent)" fontSize="12" fontFamily={MONO} letterSpacing="1.4">
      ALICE — THE OWNER
    </text>
    <Box x={24} y={44} w={244} h={106} stroke="var(--accent)" />
    <text x="40" y="70" fill="var(--ink)" fontSize="14" fontWeight="600">
      Her authorization server
    </text>
    {["her policy and tiers", "her terms roster", "her connections and ledger"].map((t, i) => (
      <text key={t} x="40" y={92 + i * 19} fill="var(--ink-2)" fontSize="12.5">
        · {t}
      </text>
    ))}
    <Box x={24} y={166} w={244} h={52} stroke="var(--accent)" />
    <text x="40" y={197} fill="var(--ink)" fontSize="13.5">
      Her portal — where she is asked
    </text>

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

    <g className="tb-allowed">
      <Arrow from={330} to={272} y={244} colour="var(--green)" />
      <text x="332" y={239} fill="var(--green)" fontSize="12.5">
        ticket · introspect · consume
      </text>
    </g>

    <g className="tb-refused">
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
    </g>
  </Frame>
);

const trustBoundaryScenes = [
  {
    text: "Two parties, and a line between them. Alice's side holds the policy, the terms and the record; Meridian's side holds the assets and the component that refuses.",
    reset: { ".tb-allowed": { opacity: 0 }, ".tb-refused": { opacity: 0 } },
    end: {},
    play: () => {},
  },
  {
    text: "Meridian's enforcement point is allowed across the line for exactly three things: take a ticket, ask whether a grant is live, and spend it.",
    end: { ".tb-allowed": { opacity: 1 } },
    play: (animate, $$) => animate($$(".tb-allowed"), { opacity: [0, 1], duration: 600 }),
  },
  {
    text: "Reading her policy is refused — on the same port, from the same workload, as the call that was just permitted. That pair is the whole cross-principal argument, and it is something CI can fail on.",
    hold: 4400,
    end: { ".tb-allowed": { opacity: 1 }, ".tb-refused": { opacity: 1 } },
    play: (animate, $$) => animate($$(".tb-refused"), { opacity: [0, 1], duration: 600 }),
  },
];

// ---------------------------------------------------------------------------
// Discovery — structure, so it does not move
// ---------------------------------------------------------------------------

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

    <g className="dl-protected">
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
    </g>

    <text className="dl-note" x="20" y="288" fill="var(--ink-3)" fontSize="11.5">
      Publishing the lower band openly would say which resources Alice owns to anyone who asks.
    </text>
  </Frame>
);

const discoveryScenes = [
  {
    text: "The public document is structural: what tools exist, what scopes they need, which authorization servers speak for this resource, and the keys its metadata is signed under. Anyone may fetch it.",
    reset: { ".dl-protected": { opacity: 0.12 }, ".dl-note": { opacity: 0 } },
    end: {},
    play: () => {},
  },
  {
    text: "Whose instances sit behind the resource is a different kind of fact, and it is served only to a caller that proves possession of the owner's authorization server key.",
    end: { ".dl-protected": { opacity: 1 } },
    play: (animate, $$) => animate($$(".dl-protected"), { opacity: [0.12, 1], duration: 600 }),
  },
  {
    text: "Publishing that lower band openly would tell anyone who asks which resources Alice owns — a leak the older push-registration model never had.",
    hold: 4200,
    end: { ".dl-protected": { opacity: 1 }, ".dl-note": { opacity: 1 } },
    play: (animate, $$) => animate($$(".dl-note"), { opacity: [0, 1], duration: 600 }),
  },
];

// ---------------------------------------------------------------------------
// The enforcement order
// ---------------------------------------------------------------------------

const EO_STEPS = [
  ["1", "Introspect", "live? connection standing?"],
  ["2", "Scope", "does this grant cover this tool?"],
  ["3", "Signature", "does the caller hold the key?"],
  ["4", "Operation", "is this the approved order?"],
  ["5", "Consume", "spend it — atomically"],
];

const EnforcementOrder = () => (
  <Frame title="The order enforcement runs in" viewBox="0 0 600 320">
    <Markers />
    {EO_STEPS.map(([n, name, note], i) => {
      const y = 20 + i * 56;
      const last = i === EO_STEPS.length - 1;
      return (
        <g key={n} className={`eo-step eo-step-${i}`}>
          <Box
            className="eo-box"
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
          {i < EO_STEPS.length - 1 && (
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

    <g className="eo-wrong">
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
    </g>
  </Frame>
);

const eoDim = { ".eo-step": { opacity: 0.16 }, ".eo-wrong": { opacity: 0 } };
const eoLit = (n) => {
  const state = { ...eoDim };
  for (let i = 0; i <= n; i += 1) state[`.eo-step-${i}`] = { opacity: 1 };
  return state;
};

const enforcementScenes = [
  ...EO_STEPS.map(([n, name], i) => ({
    text: [
      "Introspect, without consuming. Is the token live, and does the connection behind it still stand?",
      "Scope. Does the tool being called map to a permission this grant actually carries?",
      "Signature. Does the request verify against the key named in the grant? This is the step that makes it proof-of-possession rather than bearer.",
      "Operation. For a single-use grant, do the parameters hash to exactly what Alice approved?",
      "Consume. Only now is the grant spent — atomically, and a caller that loses the race denies.",
    ][i],
    reset: eoDim,
    end: eoLit(i),
    play: (animate, $$) => animate($$(`.eo-step-${i}`), { opacity: [0.16, 1], duration: 420 }),
  })),
  {
    text: "Move the burn to the top and it runs before any check does. Anyone who observes the token can replay it unsigned and destroy an approval Alice personally gave.",
    hold: 4200,
    end: { ...eoLit(4), ".eo-wrong": { opacity: 1 } },
    play: (animate, $$) => {
      animate($$(".eo-wrong"), { opacity: [0, 1], duration: 600 });
      animate($$(".eo-step-4 .eo-box"), {
        stroke: ["var(--primary)", "var(--red)", "var(--primary)"],
        duration: 1400,
        loop: 2,
        delay: 400,
      });
    },
  },
];

// ---------------------------------------------------------------------------
// The single-use race
// ---------------------------------------------------------------------------

const SingleUseRace = () => (
  <Frame title="Two replicas spending one single-use grant" viewBox="0 0 600 268">
    <Markers />

    <text x="20" y="24" fill="var(--ink-3)" fontSize="11.5" fontFamily={MONO} letterSpacing="1.2">
      ONE APPROVED TRADE · TWO COPIES OF THE CALL
    </text>

    {/* The two replicas */}
    {[0, 1].map((i) => (
      <g key={i} className={`su-replica su-replica-${i}`}>
        <Box x={20} y={44 + i * 62} w={168} h={48} />
        <text x={36} y={72 + i * 62} fill="var(--ink)" fontSize="13.5" fontWeight="600">
          Replica {String.fromCharCode(65 + i)}
        </text>
        <text x={36} y={88 + i * 62} fill="var(--ink-2)" fontSize="11.5" fontFamily={MONO}>
          jti rpt_8f3a
        </text>
      </g>
    ))}

    {/* The store */}
    <Box className="su-store" x={396} y={44} w={184} h={110} stroke="var(--accent)" />
    <text x={412} y={70} fill="var(--ink)" fontSize="13.5" fontWeight="600">
      The store
    </text>
    <text x={412} y={94} fill="var(--ink-2)" fontSize="12" fontFamily={MONO}>
      consumed =
    </text>
    <text
      className="su-flag"
      x={504}
      y={94}
      fill="var(--red)"
      fontSize="12"
      fontWeight="700"
      fontFamily={MONO}
    >
      false
    </text>
    {/* Under the box rather than inside it: the atomic form is a statement,
        and a statement does not fit in a 184-wide panel at a readable size. */}
    <text className="su-mode" x={396} y={172} fill="var(--ink-3)" fontSize="11.5" fontFamily={MONO}>
      read → decide → write
    </text>
    <text
      className="su-mode-atomic"
      x={396}
      y={172}
      fill="var(--primary)"
      fontSize="11.5"
      fontFamily={MONO}
      opacity="0"
    >
      UPDATE … WHERE NOT consumed
    </text>

    {/* Reads */}
    <g className="su-read-0">
      <Arrow from={192} to={392} y={68} colour="var(--amber)" />
      <text x={292} y={60} textAnchor="middle" fill="var(--amber)" fontSize="11.5">
        read → false
      </text>
    </g>
    <g className="su-read-1">
      <Arrow from={192} to={392} y={130} colour="var(--amber)" />
      <text x={292} y={122} textAnchor="middle" fill="var(--amber)" fontSize="11.5">
        read → false
      </text>
    </g>

    {/* Outcomes, as a verdict on each replica rather than a return arrow.
        Arrows back along the same lanes as the reads put four labels within
        twenty pixels of each other and none of them stayed readable. */}
    <g className="su-out-0">
      <text x={172} y={72} textAnchor="end" fill="var(--red)" fontSize="12" fontWeight="700">
        allowed
      </text>
    </g>
    <g className="su-out-1">
      <text x={172} y={134} textAnchor="end" fill="var(--red)" fontSize="12" fontWeight="700">
        allowed
      </text>
    </g>

    <g className="su-verdict-bad">
      <rect x={20} y={182} width={560} height={40} rx="8" fill="var(--card)" stroke="var(--red)" />
      <text x={300} y={207} textAnchor="middle" fill="var(--red)" fontSize="13">
        The trade executes twice, and nothing logs an error.
      </text>
    </g>

    {/* The atomic pass */}
    <g className="su-win">
      <Arrow from={392} to={196} y={68} colour="var(--green)" />
      <text x={292} y={60} textAnchor="middle" fill="var(--green)" fontSize="11.5">
        1 row
      </text>
      <text x={172} y={72} textAnchor="end" fill="var(--green)" fontSize="12" fontWeight="700">
        allowed
      </text>
    </g>
    <g className="su-lose">
      <Arrow from={392} to={196} y={130} colour="var(--red)" />
      <text x={292} y={122} textAnchor="middle" fill="var(--red)" fontSize="11.5">
        0 rows
      </text>
      <text x={172} y={134} textAnchor="end" fill="var(--red)" fontSize="12" fontWeight="700">
        denied
      </text>
    </g>

    <g className="su-verdict-good">
      <rect x={20} y={182} width={560} height={40} rx="8" fill="var(--card)" stroke="var(--primary)" />
      <text x={300} y={207} textAnchor="middle" fill="var(--primary)" fontSize="13">
        One caller wins. The decision and the record are the same operation.
      </text>
    </g>

    <text className="su-foot" x={20} y={252} fill="var(--ink-3)" fontSize="11.5">
      Nothing here is slower. The difference is where the decision is made.
    </text>
  </Frame>
);

const suHide = {
  ".su-read-0": { opacity: 0 },
  ".su-read-1": { opacity: 0 },
  ".su-out-0": { opacity: 0 },
  ".su-out-1": { opacity: 0 },
  ".su-win": { opacity: 0 },
  ".su-lose": { opacity: 0 },
  ".su-verdict-bad": { opacity: 0 },
  ".su-verdict-good": { opacity: 0 },
  ".su-mode-atomic": { opacity: 0 },
  ".su-mode": { opacity: 1 },
  ".su-foot": { opacity: 0 },
  ".su-flag": { opacity: 1 },
};

const singleUseScenes = [
  {
    text: "Alice approved one trade. Under load, two copies of the same call reach two replicas of the authorization server.",
    reset: suHide,
    end: {},
    play: (animate, $$) =>
      animate($$(".su-replica"), {
        opacity: [0.3, 1],
        duration: 500,
        delay: (el, i) => i * 200,
      }),
  },
  {
    text: "Read, then decide, then write. Both replicas read the flag, and both of them read false.",
    end: { ".su-read-0": { opacity: 1 }, ".su-read-1": { opacity: 1 } },
    play: (animate, $$) =>
      animate($$(".su-read-0, .su-read-1"), {
        opacity: [0, 1],
        duration: 500,
        delay: (el, i) => i * 260,
      }),
  },
  {
    text: "Both write true. Both are told yes. From each replica's point of view nothing went wrong, so nothing is logged.",
    hold: 4000,
    end: {
      ".su-read-0": { opacity: 1 },
      ".su-read-1": { opacity: 1 },
      ".su-out-0": { opacity: 1 },
      ".su-out-1": { opacity: 1 },
      ".su-verdict-bad": { opacity: 1 },
    },
    play: (animate, $$) => {
      animate($$(".su-out-0, .su-out-1"), {
        opacity: [0, 1],
        duration: 420,
        delay: (el, i) => i * 200,
      });
      animate($$(".su-verdict-bad"), { opacity: [0, 1], duration: 600, delay: 600 });
    },
  },
  {
    text: "One statement instead: update the row only if it is still unspent, and return what changed.",
    // The failed pass has to be cleared, not merely covered — its arrows and
    // its verdict occupy the same coordinates as the ones that replace them.
    end: {
      ".su-mode": { opacity: 0 },
      ".su-mode-atomic": { opacity: 1 },
      ".su-read-0": { opacity: 0 },
      ".su-read-1": { opacity: 0 },
      ".su-out-0": { opacity: 0 },
      ".su-out-1": { opacity: 0 },
      ".su-verdict-bad": { opacity: 0 },
    },
    play: (animate, $$) => {
      animate($$(".su-read-0, .su-read-1, .su-out-0, .su-out-1, .su-verdict-bad"), {
        opacity: [1, 0],
        duration: 400,
      });
      animate($$(".su-mode"), { opacity: [1, 0], duration: 300 });
      animate($$(".su-mode-atomic"), { opacity: [0, 1], duration: 500, delay: 300 });
      animate($$(".su-store"), { stroke: ["var(--accent)", "var(--primary)"], duration: 600 });
    },
  },
  {
    text: "One caller gets a row back and proceeds. The other gets nothing, and a caller that gets nothing denies.",
    hold: 4000,
    end: {
      ".su-mode": { opacity: 0 },
      ".su-mode-atomic": { opacity: 1 },
      ".su-read-0": { opacity: 0 },
      ".su-read-1": { opacity: 0 },
      ".su-out-0": { opacity: 0 },
      ".su-out-1": { opacity: 0 },
      ".su-verdict-bad": { opacity: 0 },
      ".su-win": { opacity: 1 },
      ".su-lose": { opacity: 1 },
      ".su-verdict-good": { opacity: 1 },
      ".su-foot": { opacity: 1 },
    },
    play: (animate, $$) => {
      animate($$(".su-win, .su-lose"), {
        opacity: [0, 1],
        duration: 420,
        delay: (el, i) => i * 240,
      });
      animate($$(".su-verdict-good"), { opacity: [0, 1], duration: 600, delay: 600 });
      animate($$(".su-foot"), { opacity: [0, 1], duration: 600, delay: 900 });
    },
  },
];

// ---------------------------------------------------------------------------
// Who can answer — the cast from the home page, asking one question
// ---------------------------------------------------------------------------

const FIG = {
  fill: "none",
  stroke: "var(--ink)",
  strokeWidth: 2.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/** Alice and Bob are the same figure with different hair; the agent is a bot. */
const Person = ({ x, hair, tie, label, sub, className }) => (
  <g className={className} transform={`translate(${x} 210)`}>
    <circle cx="0" cy="-62" r="10" {...FIG} />
    <path d={hair} {...FIG} strokeWidth="2.2" />
    <path d="M0 -52 V-24" {...FIG} />
    {tie && <path d="M0 -50 l-3.5 3.5 l3.5 12 l3.5 -12 z" fill="var(--accent)" stroke="none" />}
    <path d="M0 -45 L-15 -33" {...FIG} />
    <path d="M0 -45 L15 -33" {...FIG} />
    <path d="M0 -24 L-11 0" {...FIG} />
    <path d="M0 -24 L11 0" {...FIG} />
    <text x="0" y="22" textAnchor="middle" fill="var(--ink)" fontSize="12.5" fontWeight="600">
      {label}
    </text>
    <text x="0" y="38" textAnchor="middle" fill="var(--ink-3)" fontSize="11">
      {sub}
    </text>
  </g>
);

const WhoAnswers = () => (
  // Cropped rather than redrawn: the cast stands on a ground line at y=210 and
  // nothing uses the top of the canvas, so the window starts below it.
  <Frame title="Who has standing to answer for Alice" viewBox="0 60 600 212">
    <Markers />
    <line x1="20" y1="210" x2="580" y2="210" stroke="var(--edge)" strokeWidth="2" />

    <Person
      className="wa-bob"
      x={90}
      hair="M-10 -67q10 -6 20 0"
      tie
      label="Bob"
      sub="the requesting party"
    />

    {/* Bob's agent. Not a villain — simply not Alice. */}
    <g className="wa-agent" transform="translate(212 210)">
      <path d="M0 -72 V-66" {...FIG} />
      <circle cx="0" cy="-74" r="3" fill="var(--agent)" />
      <rect x="-14" y="-66" width="28" height="22" rx="7" fill="var(--card-2)" stroke="var(--agent)" strokeWidth="2.2" />
      <circle cx="-5" cy="-55" r="2.6" fill="var(--accent)" />
      <circle cx="5" cy="-55" r="2.6" fill="var(--accent)" />
      <rect x="-11" y="-40" width="22" height="22" rx="6" fill="var(--card-2)" stroke="var(--agent)" strokeWidth="2.2" />
      <path d="M-11 -33 L-20 -26" {...FIG} />
      <path d="M11 -33 L20 -26" {...FIG} />
      <path d="M-5 -18 V0" {...FIG} />
      <path d="M5 -18 V0" {...FIG} />
      <text x="0" y="22" textAnchor="middle" fill="var(--ink)" fontSize="12.5" fontWeight="600">
        His agent
      </text>
      <text x="0" y="38" textAnchor="middle" fill="var(--ink-3)" fontSize="11">
        holds its own key
      </text>
    </g>

    {/* Meridian — many owners, one server. */}
    <g className="wa-vault" transform="translate(390 210)">
      <rect x="-56" y="-104" width="112" height="104" rx="9" fill="var(--card)" stroke="var(--edge)" strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="-44"
          y={-92 + i * 30}
          width="88"
          height="22"
          rx="4"
          fill="var(--card-2)"
          stroke="var(--edge)"
          strokeWidth="1.4"
          opacity={i === 1 ? 1 : 0.5}
        />
      ))}
      <rect x="-44" y="-62" width="88" height="22" rx="4" fill="var(--sunken)" stroke="var(--accent)" strokeWidth="1.6" />
      <text x="0" y="22" textAnchor="middle" fill="var(--ink)" fontSize="12.5" fontWeight="600">
        Meridian
      </text>
      <text x="0" y="38" textAnchor="middle" fill="var(--ink-3)" fontSize="11">
        many owners, one server
      </text>
    </g>

    {/* Alice's authority. */}
    <g className="wa-as" transform="translate(530 210)">
      <rect x="-44" y="-90" width="88" height="90" rx="9" fill="var(--card)" stroke="var(--accent)" strokeWidth="2" />
      <path d="M-44 -90 L0 -116 L44 -90 Z" fill="var(--card-2)" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <path
        className="wa-shield"
        d="M0 -76 l18 7 v14 q0 16 -18 23 q-18 -7 -18 -23 v-14 z"
        fill="var(--sunken)"
        stroke="var(--accent)"
        strokeWidth="2.2"
      />
      <path className="wa-tick" d="M-7 -52 l5 6 l10 -11" fill="none" stroke="var(--green)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
      <text x="0" y="22" textAnchor="middle" fill="var(--ink)" fontSize="12.5" fontWeight="600">
        Her authority
      </text>
      <text x="0" y="38" textAnchor="middle" fill="var(--ink-3)" fontSize="11">
        her policy, her side
      </text>
    </g>

    {/* The ask, and the two parties who cannot answer it. */}
    <g className="wa-ask">
      <Arrow from={238} to={328} y={150} colour="var(--agent)" />
      <text x={283} y={142} textAnchor="middle" fill="var(--ink-2)" fontSize="11.5">
        may I?
      </text>
    </g>

    <g className="wa-no-bob" opacity="0">
      <circle cx="90" cy="120" r="17" fill="var(--sunken)" stroke="var(--red)" strokeWidth="2" />
      <path d="M83 113 L97 127 M97 113 L83 127" stroke="var(--red)" strokeWidth="2.4" strokeLinecap="round" />
      <text x="90" y="96" textAnchor="middle" fill="var(--red)" fontSize="11">
        not his to give
      </text>
    </g>

    <g className="wa-no-vault" opacity="0">
      <circle cx="390" cy="128" r="17" fill="var(--sunken)" stroke="var(--red)" strokeWidth="2" />
      <path d="M383 121 L397 135 M397 121 L383 135" stroke="var(--red)" strokeWidth="2.4" strokeLinecap="round" />
      <text x="390" y="104" textAnchor="middle" fill="var(--red)" fontSize="11">
        holds it, cannot decide
      </text>
    </g>

    {/* The payoff line goes above the cast rather than beside the building,
        which is the only part of the canvas nothing else occupies. */}
    <g className="wa-yes" opacity="0">
      <Arrow from={452} to={486} y={150} colour="var(--green)" />
      <text
        x="300"
        y="82"
        textAnchor="middle"
        fill="var(--primary)"
        fontSize="15"
        fontWeight="650"
      >
        She isn’t online. Her policy is.
      </text>
    </g>
  </Frame>
);

const waHide = {
  ".wa-ask": { opacity: 0 },
  ".wa-no-bob": { opacity: 0 },
  ".wa-no-vault": { opacity: 0 },
  ".wa-yes": { opacity: 0 },
  ".wa-tick": { opacity: 0 },
};

const whoAnswersScenes = [
  {
    text: "Bob's advisor sends an agent to Alice's holdings. The agent is not a villain — it is simply not Alice, and that is enough to need a negotiation.",
    reset: waHide,
    end: { ".wa-ask": { opacity: 1 } },
    play: (animate, $$) => {
      // Opacity only. These groups carry a `transform` attribute for their
      // position, and anime composes its own transform from x/y/scale — which
      // replaces the attribute and drops the actor at the origin.
      animate($$(".wa-agent"), { opacity: [0.25, 1], duration: 700, ease: "outQuad" });
      animate($$(".wa-ask"), { opacity: [0, 1], duration: 500, delay: 400 });
    },
  },
  {
    text: "Bob can answer for Bob. He has no standing to answer for Alice — he is her advisor, not her.",
    end: { ".wa-ask": { opacity: 1 }, ".wa-no-bob": { opacity: 1 } },
    play: (animate, $$) => animate($$(".wa-no-bob"), { opacity: [0, 1], duration: 500 }),
  },
  {
    text: "Meridian holds the assets and can refuse the call. It cannot decide, because the policy is not its to read — and it answers to a thousand other owners too.",
    end: { ".wa-ask": { opacity: 1 }, ".wa-no-bob": { opacity: 1 }, ".wa-no-vault": { opacity: 1 } },
    play: (animate, $$) => animate($$(".wa-no-vault"), { opacity: [0, 1], duration: 500 }),
  },
  {
    text: "Only the authority on Alice's side can answer, and it can answer at three in the morning, because what it holds is her policy rather than her attention.",
    hold: 4600,
    end: {
      ".wa-ask": { opacity: 1 },
      ".wa-no-bob": { opacity: 1 },
      ".wa-no-vault": { opacity: 1 },
      ".wa-yes": { opacity: 1 },
      ".wa-tick": { opacity: 1 },
    },
    play: (animate, $$) => {
      animate($$(".wa-yes"), { opacity: [0, 1], duration: 600 });
      animate($$(".wa-tick"), { opacity: [0, 1], duration: 500, delay: 400 });
      animate($$(".wa-shield"), {
        stroke: ["var(--accent)", "var(--green)", "var(--accent)"],
        duration: 1400,
        loop: 2,
        delay: 400,
      });
    },
  },
];

// ---------------------------------------------------------------------------

const diagrams = {
  "four-beats": { Draw: FourBeats, scenes: fourBeatScenes, title: "The four beats" },
  "trust-boundary": { Draw: TrustBoundary },
  "discovery-layers": { Draw: DiscoveryLayers },
  "enforcement-order": {
    Draw: EnforcementOrder,
    scenes: enforcementScenes,
    title: "The enforcement order",
  },
  "single-use-race": {
    Draw: SingleUseRace,
    scenes: singleUseScenes,
    title: "Two replicas, one grant",
  },
  "who-answers": {
    Draw: WhoAnswers,
    scenes: whoAnswersScenes,
    title: "Who has standing to answer",
  },
};

const DocDiagram = ({ name, caption }) => {
  const chosen = diagrams[name];
  if (!chosen) return null;
  const { Draw, scenes, title } = chosen;
  return (
    <DocFigure title={title || name} scenes={scenes} caption={caption}>
      <Draw />
    </DocFigure>
  );
};

export default DocDiagram;
