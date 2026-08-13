// ===================================================================
// Brand mark geometry.
//
// Path data only — no colour. The React component in
// src/components/BrandMark.js renders these with tokens from theme.js, and
// scripts/gen-theme.js writes the same paths out as standalone SVG files
// in static/brand/. One definition, so the navbar icon and the downloadable
// asset cannot drift apart.
//
// Both marks are drawn as strokes on a 64-unit grid rather than as filled
// letterforms. That keeps them editable, keeps the files small, and means
// they stay legible at favicon size where a filled glyph would fill in.
//
// CommonJS, for the same reason as theme.js: a plain Node script reads it.
// ===================================================================

// --- 1b — the U4A monogram ----------------------------------------------
// A rounded-square chip carrying its own dark ground, so it sits on a light
// page as readily as on the dark site. The underscore under the letters is
// the "signed" line from the brand sheet.
const monogram = {
  viewBox: "0 0 64 64",
  // The chip. Drawn as a rect so the fill and the stroke are one object.
  frame: { x: 2.6, y: 2.6, w: 58.8, h: 58.8, rx: 15 },
  frameWidth: 2.8,
  // Letters, left to right. The "4" is the accented one.
  u: "M11 17 L11 33 A5.75 5.75 0 0 0 22.5 33 L22.5 17",
  four: "M34.5 17 L26.25 31 L37.75 31 M34.5 17 L34.5 39",
  a: "M41.5 39 L47.25 17 L53 39 M43.5 31.5 L51 31.5",
  strokeWidth: 3.2,
  // The signed line.
  bar: "M20 46.5 L44 46.5",
  barWidth: 3.2,
};

// --- 1a — the UMA disc ---------------------------------------------------
// The UMA 2.0 disc with the numeral swapped. The off-white face is part of
// the mark, not a background, which is what lets it sit on either theme.
const disc = {
  viewBox: "0 0 64 64",
  face: { cx: 32, cy: 32, r: 26.5 }, // the off-white ground
  ring: { cx: 32, cy: 32, r: 29 },
  ringWidth: 5,
  // The numeral sits behind the wordmark and breaks the cap height, the way
  // it does on the brand sheet.
  // The stem drops through the gap between M and A so the numeral stays
  // readable behind the wordmark rather than merging with the M.
  four: "M39 19 L29.5 34 L47 34 M39 19 L39 46",
  fourWidth: 4.6,
  // U-M-A across the face, drawn over the numeral.
  u: "M14 25 L14 34.5 A5 5 0 0 0 24 34.5 L24 25",
  m: "M27 39 L27 25 L32 32.5 L37 25 L37 39",
  a: "M40 39 L45 25 L50 39 M41.8 34.5 L48.2 34.5",
  strokeWidth: 2.4,
};

module.exports = { monogram, disc };
