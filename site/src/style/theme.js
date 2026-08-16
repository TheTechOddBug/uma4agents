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
// white letterforms, a lime numeral, and a soft teal frame. That is the
// default. `lightRole` below is the same brand on paper — the palette is
// untouched, because lime and teal *are* the identity; only the grounds, the
// inks and the translucent films move.
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
  // Lifted a shade from #6c727a. Measuring the light theme's contrast turned
  // up that the dark theme's dimmest ink was 4.06:1 on the ground, and it is
  // used for captions and labels at body size. This clears 4.5:1.
  greyDim: "#757b83",

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
  // On the dark stage the document is the one light surface and needs no
  // outline. On a light ground it would be paper on paper, so it grows one.
  paperEdge: "transparent",
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
  //
  // These are also the values that do not survive an inversion: a white film
  // lifts a dark surface and washes out a light one. The light role map below
  // repoints every one of them rather than reusing any.
  tintAccent: "rgba(140, 194, 212, 0.35)", // teal
  tintCard: "rgba(18, 19, 23, 0.55)",
  tintSelect: "rgba(188, 219, 44, 0.30)", // lime
  tintGranted: "rgba(188, 219, 44, 0.10)",
  tintGrantedEdge: "rgba(188, 219, 44, 0.40)",
  bgBlur: "rgba(10, 11, 13, 0.86)", // sticky nav over content
  bgBlurSoft: "rgba(10, 11, 13, 0.82)",

  // Films the stylesheet lays over a surface. Named here rather than written
  // as rgba() literals in the sass, because a white film is exactly the kind
  // of value that survives a theme switch unchanged and then looks wrong: it
  // lifts a dark surface and washes out a light one.
  // The stage's two radial washes. They read as light spilling onto a night
  // set; over paper the same wash is just a grey smudge, so the light theme
  // turns them off rather than tinting them.
  stageGlow: palette.teal,

  hover: "rgba(255, 255, 255, 0.05)",
  hoverStrong: "rgba(255, 255, 255, 0.08)",
  shadow: "rgba(0, 0, 0, 0.55)",
  shadowDeep: "rgba(0, 0, 0, 0.6)",
  scrim: "rgba(0, 0, 0, 0.6)",
};

// --- The light theme -----------------------------------------------------
// The same brand, on paper. `palette` is untouched — lime and teal *are* the
// identity — so this map only repoints what a background change forces:
// the grounds, the inks, and every translucent film.
//
// Two colours need real adjustment rather than a swap. Lime at #bcdb2c is a
// light value: it is legible on near-black and nearly invisible on white, so
// links and small text take a deepened lime, while the brand lime is kept for
// fills where dark ink sits on top of it. Teal moves the same way.
const lightRole = {
  ...role,

  bg: "#fbfbf9",
  card: "#ffffff",
  cardRaised: "#f4f5f2",
  sunken: "#f2f3ef",
  edge: "#d7d9d2",
  edgeStrong: "rgba(10, 11, 13, 0.18)",

  ink: "#16181c",
  inkMuted: "#4a4f57",
  inkDim: "#6c727a",
  inkBody: "#2b2f36",
  inkCode: "#23262b",

  // Deepened until they carry on paper. These are not eyeballed: each was
  // solved against the light background for at least 4.5:1, because links and
  // eyebrows are body-sized text and lime is a light value — #bcdb2c on white
  // is 1.6:1, which is a decoration rather than a word.
  accent: "#3b7990", //  4.68:1 on --bg
  accentHi: "#2f6a80",
  agent: "#3b7990",

  primary: "#627a0e", //  4.69:1 on --bg, and 4.87:1 under white
  primaryHi: "#516309",
  onPrimary: "#ffffff",

  granted: "#556b08",
  pending: "#8a5a00",
  denied: "#b04a2f",
  onAmber: "#ffffff",

  paper: "#ffffff",
  paperLine: "#9a958a",
  paperEdge: "#d8d6cd",

  surfaceInvert: palette.white,

  tintAccent: "rgba(61, 125, 148, 0.28)",
  tintCard: "rgba(255, 255, 255, 0.72)",
  tintSelect: "rgba(188, 219, 44, 0.45)",
  tintGranted: "rgba(111, 138, 16, 0.10)",
  tintGrantedEdge: "rgba(111, 138, 16, 0.38)",
  bgBlur: "rgba(251, 251, 249, 0.88)",
  bgBlurSoft: "rgba(251, 251, 249, 0.84)",

  stageGlow: "transparent",

  // Films over a light surface have to darken, not lighten.
  hover: "rgba(10, 11, 13, 0.05)",
  hoverStrong: "rgba(10, 11, 13, 0.08)",
  shadow: "rgba(10, 11, 13, 0.14)",
  shadowDeep: "rgba(10, 11, 13, 0.18)",
  scrim: "rgba(20, 22, 26, 0.42)",
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
const varsFor = (r) => ({
  "--bg": r.bg,
  "--card": r.card,
  "--card-2": r.cardRaised,
  "--sunken": r.sunken,
  "--edge": r.edge,
  "--edge-strong": r.edgeStrong,
  "--stage-glow": r.stageGlow,

  "--ink": r.ink,
  "--ink-2": r.inkMuted,
  "--ink-3": r.inkDim,

  "--accent": r.accent,
  "--accent-hi": r.accentHi,
  "--agent": r.agent,

  "--primary": r.primary,
  "--primary-hi": r.primaryHi,
  "--on-primary": r.onPrimary,

  "--green": r.granted,
  "--amber": r.pending,
  "--red": r.denied,

  "--ink-body": r.inkBody,
  "--ink-code": r.inkCode,
  "--surface-invert": r.surfaceInvert,

  "--paper": r.paper,
  "--paper-line": r.paperLine,
  "--paper-edge": r.paperEdge,
  "--on-amber": r.onAmber,

  "--tint-accent": r.tintAccent,
  "--tint-card": r.tintCard,
  "--tint-select": r.tintSelect,
  "--tint-granted": r.tintGranted,
  "--tint-granted-edge": r.tintGrantedEdge,
  "--bg-blur": r.bgBlur,
  "--bg-blur-soft": r.bgBlurSoft,

  "--hover": r.hover,
  "--hover-strong": r.hoverStrong,
  "--shadow": r.shadow,
  "--shadow-deep": r.shadowDeep,
  "--scrim": r.scrim,


  "--ui": type.sans,
  "--mono": type.mono,
});

const cssVars = varsFor(role);
const cssVarsLight = varsFor(lightRole);

const declarations = (vars) =>
  Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

/**
 * Emitted into the document by scripts/gen-theme.js.
 *
 * Dark is the default, so it lands on plain `:root` and a browser that never
 * runs the theme script still gets the site as designed. Light arrives two
 * ways: the reader asked for it (`[data-theme="light"]`), or their system
 * prefers it and they have not overridden it (`:not([data-theme])`). The
 * explicit attribute has to beat the media query in both directions, which is
 * why the dark block is repeated under `[data-theme="dark"]`.
 */
function toCss() {
  return [
    `:root {\n${declarations(cssVars)}\n}`,
    ``,
    `:root[data-theme="light"] {\n${declarations(cssVarsLight)}\n}`,
    ``,
    `@media (prefers-color-scheme: light) {`,
    `  :root:not([data-theme]) {\n${declarations(cssVarsLight)
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n")}\n  }`,
    `}`,
    ``,
  ].join("\n");
}

module.exports = { palette, role, lightRole, type, cssVars, cssVarsLight, toCss };
