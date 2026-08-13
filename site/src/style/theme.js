// ===================================================================
// u4a.ai theme — THE single source of truth for colour.
//
// Every colour on this site comes from this file. Nothing else defines a
// hex value: the sass tokens map to CSS custom properties, the animation
// imports these objects directly, and `scripts/gen-theme.js` turns the
// `cssVars` map below into src/style/theme.generated.css at build time.
//
// To retheme the site, edit `palette` and nothing else.
//
// Derived from brand direction 1b (the U4A monogram): a near-black ground,
// white letterforms, a lime numeral, and a soft teal frame.
// ===================================================================

// CommonJS on purpose. This file is read two ways — bundled by webpack for
// the app, and `require`d by scripts/gen-theme.js under plain Node — and the
// build pins Node 20, which cannot `require` an ES module.

// --- The palette ---------------------------------------------------------
// Raw values. These are the only hex codes in the project.
const palette = {
  // Ground — 1b's card is essentially neutral black, very slightly cool.
  black: "#0a0b0d",
  black2: "#121317",
  black3: "#1a1c21",
  blackSunken: "#0e0f12",
  line: "#24262c",

  // Ink — 1b sets "U" and "A" in pure white.
  white: "#ffffff",
  grey: "#a9aeb6",
  greyDim: "#6c727a",

  // The two brand marks from 1b.
  lime: "#bcdb2c", // the "4" — the thing your eye lands on
  limeHi: "#cde84f", // hover / raised
  teal: "#8cc2d4", // the rounded frame and the underscore bar
  tealHi: "#a8d5e3",
  tealDeep: "#5e8fa3", // recessive member of the same family

  // Functional state colours. 1b is a two-colour mark and cannot express
  // "waiting" or "refused", so these two are carried for meaning only —
  // they never appear as brand chrome.
  amber: "#f2b955", // pending on the owner
  coral: "#e8836b", // refused

  // The signed terms document in the animation — the one light surface in
  // the story, and the same off-white as the disc in brand direction 1a.
  paper: "#f0f0ea",
  paperInk: "#8a8477",
  onAmber: "#5a4318", // ruling on an amber ticket
};

// --- Semantic roles ------------------------------------------------------
// What each colour *means*. Components and the animation reference these,
// never `palette` directly, so a role can be repointed in one line.
const role = {
  bg: palette.black,
  card: palette.black2,
  cardRaised: palette.black3,
  sunken: palette.blackSunken,
  edge: palette.line,
  edgeStrong: "rgba(255, 255, 255, 0.16)",

  ink: palette.white,
  inkMuted: palette.grey,
  inkDim: palette.greyDim,

  // Teal is structure and the resting state; lime is the payoff. Keeping
  // them distinct is what lets the animation show a shield turning from
  // "normal" to "granted" — if both roles were lime the beat would vanish.
  accent: palette.teal,
  accentHi: palette.tealHi,
  agent: palette.tealDeep,

  primary: palette.lime, // calls to action, links, the active thing
  primaryHi: palette.limeHi,
  onPrimary: palette.black, // lime is a light surface: ink on it must be dark

  granted: palette.lime,
  pending: palette.amber,
  denied: palette.coral,

  paper: palette.paper,
  paperLine: palette.paperInk,
  onAmber: palette.onAmber,

  // Long-form reading ink — a touch brighter than `inkMuted`, which is for
  // labels rather than paragraphs.
  inkBody: "#d5d8dc",
  inkCode: "#dfe3e8",

  // The one deliberately light surface in the UI: the QR code needs a bright
  // quiet zone to stay scannable, so it does not follow the dark theme.
  surfaceInvert: palette.white,

  // Translucent fills. Written out rather than derived because sass cannot
  // run rgba() over a var(), so any tint the stylesheet needs is defined here.
  // Keep these in step with the solid colours above by hand — they are the
  // one place this file repeats itself.
  tintAccent: "rgba(140, 194, 212, 0.35)", // teal
  tintCard: "rgba(18, 19, 23, 0.55)",
  tintSelect: "rgba(188, 219, 44, 0.30)", // lime
  tintGranted: "rgba(188, 219, 44, 0.10)",
  tintGrantedEdge: "rgba(188, 219, 44, 0.40)",
  bgBlur: "rgba(10, 11, 13, 0.86)", // sticky nav over content
  bgBlurSoft: "rgba(10, 11, 13, 0.82)",
};

// --- Type ----------------------------------------------------------------
const type = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// --- CSS custom properties ----------------------------------------------
// The names here are the contract with the stylesheets. `--card`, `--ink-2`
// and friends predate this file and are kept so the sass and the animation
// stylesheet did not have to be rewritten to adopt a single source.
const cssVars = {
  "--bg": role.bg,
  "--card": role.card,
  "--card-2": role.cardRaised,
  "--sunken": role.sunken,
  "--edge": role.edge,
  "--edge-strong": role.edgeStrong,

  "--ink": role.ink,
  "--ink-2": role.inkMuted,
  "--ink-3": role.inkDim,

  "--accent": role.accent,
  "--accent-hi": role.accentHi,
  "--agent": role.agent,

  "--primary": role.primary,
  "--primary-hi": role.primaryHi,
  "--on-primary": role.onPrimary,

  "--green": role.granted,
  "--amber": role.pending,
  "--red": role.denied,

  "--ink-body": role.inkBody,
  "--ink-code": role.inkCode,
  "--surface-invert": role.surfaceInvert,

  "--paper": role.paper,
  "--paper-line": role.paperLine,
  "--on-amber": role.onAmber,

  "--tint-accent": role.tintAccent,
  "--tint-card": role.tintCard,
  "--tint-select": role.tintSelect,
  "--tint-granted": role.tintGranted,
  "--tint-granted-edge": role.tintGrantedEdge,
  "--bg-blur": role.bgBlur,
  "--bg-blur-soft": role.bgBlurSoft,

  "--ui": type.sans,
  "--mono": type.mono,
};

// Emitted into the document by scripts/gen-theme.js.
function toCss() {
  const body = Object.entries(cssVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${body}\n}\n`;
}

module.exports = { palette, role, type, cssVars, toCss };
