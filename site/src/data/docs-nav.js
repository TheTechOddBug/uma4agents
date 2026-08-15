// The documentation, as an ordered structure.
//
// Authored, never derived from the filesystem. Reading order is an editorial
// decision — a concept page has to come before the guide that assumes it —
// and alphabetical filenames cannot express that. The build checks this file
// against the pages that actually exist, so a page added without a home here
// fails the build rather than becoming unreachable.
//
// `to` is the page's URL. The markdown lives at the matching path under
// src/pages/, so /docs/understand/four-beats/ is
// src/pages/docs/understand/four-beats.md.

export const tabs = [
  { id: "introduction", label: "Introduction" },
  { id: "understand", label: "Understand" },
  { id: "guides", label: "Guides" },
  { id: "reference", label: "Reference" },
  { id: "compare", label: "Compare" },
];

export const nav = {
  introduction: [
    {
      group: "Start here",
      pages: [
        { title: "Overview", to: "/docs/introduction/overview/" },
        { title: "Why the owner decides", to: "/docs/introduction/why/" },
        { title: "Architecture", to: "/docs/introduction/architecture/" },
        { title: "Concepts", to: "/docs/introduction/concepts/" },
      ],
    },
    {
      group: "Resources",
      pages: [
        { title: "Glossary", to: "/docs/introduction/glossary/" },
        { title: "FAQ", to: "/docs/introduction/faq/" },
      ],
    },
  ],

  understand: [
    {
      group: "The grant",
      pages: [
        { title: "The four beats", to: "/docs/understand/four-beats/" },
        { title: "The three parties", to: "/docs/understand/parties/" },
        { title: "Terms as first-class", to: "/docs/understand/terms/" },
      ],
    },
    {
      group: "What holds it together",
      pages: [
        { title: "Identity is not authorization", to: "/docs/understand/identity/" },
        { title: "Discovery, public and protected", to: "/docs/understand/discovery/" },
        { title: "Proof-of-possession", to: "/docs/understand/proof-of-possession/" },
        { title: "Single-use means indivisible", to: "/docs/understand/single-use/" },
        { title: "Revocation and the ledger", to: "/docs/understand/revocation/" },
      ],
    },
  ],

  guides: [
    {
      group: "Getting started",
      pages: [
        { title: "The roles you must fill", to: "/docs/guides/roles/" },
        { title: "Run the lab", to: "/docs/guides/run-the-lab/" },
      ],
    },
    {
      group: "Build the grant",
      pages: [
        { title: "Choose an enforcement point", to: "/docs/guides/enforcement-point/" },
        { title: "Issue the challenge", to: "/docs/guides/challenge/" },
        { title: "Dictate terms, take an agreement", to: "/docs/guides/terms/" },
        { title: "Mint an operation-bound grant", to: "/docs/guides/grant/" },
      ],
    },
    {
      group: "Make it hold up",
      pages: [
        { title: "Make single-use indivisible", to: "/docs/guides/indivisible/" },
        { title: "Wire the owner's approval path", to: "/docs/guides/approval/" },
        { title: "Deploy it at scale", to: "/docs/guides/at-scale/" },
      ],
    },
  ],

  reference: [
    {
      group: "The wire",
      pages: [
        { title: "Wire contract", to: "/docs/reference/wire-contract/" },
        { title: "Endpoints", to: "/docs/reference/endpoints/" },
        { title: "Events", to: "/docs/reference/events/" },
        { title: "MCP binding", to: "/docs/reference/mcp-binding/" },
      ],
    },
    {
      group: "Running it",
      pages: [
        { title: "Configuration", to: "/docs/reference/configuration/" },
      ],
    },
    {
      group: "For spec authors",
      pages: [
        { title: "Deviations from UMA 2.0", to: "/docs/reference/deviations/" },
        { title: "Findings", to: "/docs/reference/findings/" },
      ],
    },
  ],

  compare: [
    {
      group: "Standards",
      pages: [
        { title: "UMA 2.0", to: "/docs/compare/uma/" },
        { title: "OAuth 2.0 and GNAP", to: "/docs/compare/oauth-gnap/" },
      ],
    },
    {
      group: "Adjacent work",
      pages: [
        { title: "Policy engines", to: "/docs/compare/policy-engines/" },
        { title: "Agent identity", to: "/docs/compare/agent-identity/" },
      ],
    },
  ],
};

/** Every page, flat and in reading order. */
export const allPages = () =>
  tabs.flatMap((t) =>
    (nav[t.id] || []).flatMap((g) =>
      g.pages.map((p) => ({ ...p, tab: t.id, tabLabel: t.label, group: g.group }))
    )
  );

/** Which tab a URL belongs to, for highlighting the tab bar. */
export const tabForPath = (pathname) => {
  const hit = allPages().find((p) => p.to === pathname);
  return hit ? hit.tab : (pathname.split("/")[2] || "introduction");
};

/** The page before and after this one, in reading order, for the footer. */
export const neighbours = (pathname) => {
  const flat = allPages();
  const i = flat.findIndex((p) => p.to === pathname);
  return i === -1
    ? { prev: null, next: null }
    : { prev: flat[i - 1] || null, next: flat[i + 1] || null };
};

export default nav;
