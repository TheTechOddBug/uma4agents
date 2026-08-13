import React from "react";

/**
 * Act two: the same story, deployed.
 *
 * Act one draws the protocol as four beats between three places. This draws
 * the machine those beats actually run on — the parties as separated
 * namespaces, the mesh between them, and the same four beats crossing the
 * boundary that keeps them apart.
 *
 * Same visual language throughout: one blue-to-violet accent, green for
 * granted, amber for waiting, and the same dark ground. Ids are the handles
 * the scene machine animates; nothing here positions itself.
 */
const ArchitectureStage = () => (
  <g id="arch" opacity="0">
    {/* ── the parties, as boundaries ───────────────────────────────── */}
    <g id="ns-bob">
      <rect x="40" y="250" width="270" height="310" rx="12" className="ns-box" />
      <text x="175" y="278" className="ns-label">STERLING &amp; VANCE</text>
      <text x="175" y="296" className="ns-sub">the requesting party</text>
    </g>

    <g id="ns-edge">
      <rect x="336" y="250" width="96" height="310" rx="12" className="ns-box" />
      <text x="384" y="278" className="ns-label">EDGE</text>
    </g>

    <g id="ns-meridian">
      <rect x="458" y="250" width="316" height="310" rx="12" className="ns-box" />
      <text x="616" y="278" className="ns-label">MERIDIAN WEALTH</text>
      <text x="616" y="296" className="ns-sub">the resource server</text>
    </g>

    <g id="ns-alice">
      <rect x="800" y="250" width="360" height="310" rx="12" className="ns-box" />
      <text x="980" y="278" className="ns-label">ALICE</text>
      <text x="980" y="296" className="ns-sub">the resource owner</text>
    </g>

    {/* ── what runs in each ────────────────────────────────────────── */}

    {/* Bob's side */}
    <g id="arch-agent" opacity="0">
      <rect x="80" y="330" width="190" height="72" rx="9" className="node node--agent" />
      <circle className="eye" cx="112" cy="358" r="4" />
      <circle className="eye" cx="126" cy="358" r="4" />
      <rect x="100" y="342" width="38" height="30" rx="8" className="bot-head" />
      <text x="156" y="360" className="node-title">his agent</text>
      <text x="156" y="378" className="node-sub">signs every request</text>
    </g>
    <g id="arch-operator" opacity="0">
      <rect x="80" y="430" width="190" height="62" rx="9" className="node" />
      <text x="96" y="456" className="node-title">agent-operator</text>
      <text x="96" y="474" className="node-sub">who runs it · its keys</text>
    </g>

    {/* The edge */}
    <g id="arch-edge" opacity="0">
      <rect x="352" y="330" width="64" height="162" rx="9" className="node node--accent" />
      <path d="M384 356 v112" className="edge-slot" />
      <text x="384" y="512" className="node-sub">kgateway</text>
      <text x="384" y="528" className="node-sub">TLS *.uma.lab</text>
    </g>

    {/* Meridian */}
    <g id="arch-agw" opacity="0">
      <rect x="478" y="330" width="132" height="72" rx="9" className="node node--agent" />
      <text x="494" y="356" className="node-title">agentgateway</text>
      <text x="494" y="374" className="node-sub">hosts the PEP</text>
      <text x="494" y="391" className="node-sub">MCP · A2A</text>
    </g>
    <g id="arch-pep" opacity="0">
      <rect x="626" y="330" width="132" height="72" rx="9" className="node" />
      <path id="pep-shield" d="M692 340 l22 9 v16 q0 19 -22 27 q-22 -8 -22 -27 v-16 z" className="shield-sm" />
      <text x="692" y="392" className="node-sub">uma-pep ×2</text>
    </g>
    <g id="arch-vault" opacity="0">
      <rect x="478" y="430" width="280" height="86" rx="9" className="node" />
      <text x="494" y="454" className="node-title">alice-vault</text>
      <text x="494" y="471" className="node-sub">an MCPServer · no auth code in it</text>
      <rect x="494" y="482" width="248" height="10" rx="3" className="row-dim" />
      <rect x="494" y="496" width="248" height="10" rx="3" className="row-own" />
    </g>

    {/* Alice */}
    <g id="arch-as" opacity="0">
      <rect x="838" y="336" width="164" height="66" rx="9" className="node node--accent as-card-3" />
      <rect x="830" y="330" width="164" height="66" rx="9" className="node node--accent as-card-2" />
      <rect x="822" y="324" width="164" height="66" rx="9" className="node node--accent" />
      <text x="838" y="350" className="node-title">uma-as ×3</text>
      <text x="838" y="368" className="node-sub">her policy · her terms</text>
      <text x="838" y="384" className="node-sub">tickets · grants · ledger</text>
    </g>
    <g id="arch-db" opacity="0">
      <rect x="1022" y="324" width="120" height="72" rx="9" className="node" />
      <path d="M1042 344 a22 7 0 0 0 44 0 a22 7 0 0 0 -44 0 v32 a22 7 0 0 0 44 0 v-32"
            className="db-glyph" />
      <text x="1082" y="390" className="node-sub">Postgres ×3</text>
    </g>
    <g id="arch-keycloak" opacity="0">
      <rect x="822" y="440" width="164" height="62" rx="9" className="node" />
      <text x="838" y="466" className="node-title">keycloak</text>
      <text x="838" y="484" className="node-sub">is this Alice?</text>
    </g>
    <g id="arch-portal" opacity="0">
      <rect x="1006" y="440" width="136" height="62" rx="9" className="node" />
      <text x="1022" y="466" className="node-title">her portal</text>
      <text x="1022" y="484" className="node-sub">where she taps</text>
    </g>

    {/* ── the mesh ─────────────────────────────────────────────────── */}
    <g id="arch-mesh" opacity="0">
      <path d="M310 380 H352" className="mesh-line" />
      <path d="M416 380 H478" className="mesh-line" />
      <path d="M758 366 H822" className="mesh-line" />
      <path d="M986 360 H1022" className="mesh-line" />
      <path d="M904 402 V440" className="mesh-line" />
      <path d="M610 366 H626" className="mesh-line" />
      <path d="M616 402 V430" className="mesh-line" />
      <text x="600" y="596" className="mesh-label">
        every line is mTLS · every box has a cryptographic name
      </text>
    </g>

    {/* ── the beats, traced across the machine ─────────────────────── */}
    <g id="beat-1" opacity="0">
      <path d="M270 350 H352 M416 350 H478" className="flow flow--amber" markerEnd="url(#mWarn)" />
      <text x="330" y="326" className="flow-label flow-label--amber">1 · challenged</text>
    </g>
    <g id="beat-2" opacity="0">
      <path d="M270 372 H352 M416 372 H478 M610 372 H626 M758 372 H822"
            className="flow flow--accent" markerEnd="url(#mAccent)" />
      <text x="700" y="326" className="flow-label flow-label--accent">2 · her terms</text>
    </g>
    <g id="beat-4" opacity="0">
      <path d="M822 412 H616 M616 412 V430" className="flow flow--green" markerEnd="url(#mGreen)" />
      <text x="700" y="428" className="flow-label flow-label--green">4 · granted</text>
    </g>

    {/* ── the refusal ──────────────────────────────────────────────── */}
    <g id="arch-denied" opacity="0">
      <path d="M270 540 H800" className="flow flow--deny" />
      <g transform="translate(535 540)">
        <circle r="24" className="deny-ring" />
        <path d="M-10 -10 L10 10 M10 -10 L-10 10" className="deny-cross" />
      </g>
      <text x="535" y="588" className="flow-label flow-label--deny">
        no direct path — the mesh refuses it
      </text>
    </g>

    {/* ── the scale note ───────────────────────────────────────────── */}
    <g id="arch-scale" opacity="0">
      <rect x="822" y="228" width="320" height="30" rx="8" className="scale-chip" />
      <text x="982" y="248" className="scale-text">
        one grant, spent once — across all three
      </text>
    </g>
  </g>
);

export default ArchitectureStage;
