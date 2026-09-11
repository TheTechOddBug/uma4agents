#!/usr/bin/env node
/**
 * Renders the PNG twins that link previews need.
 *
 * og:image has to be a raster. LinkedIn, Slack and X will not render an SVG,
 * and when the image fails they fall back to scraping the page — which is how
 * an author avatar ends up as the thumbnail for a post.
 *
 * This is a LOCAL step, not part of the build: it shells out to rsvg-convert,
 * which is not present on the deploy runner. The PNGs it writes are committed.
 * Re-run it after changing the palette or a featured diagram.
 *
 *   brew install librsvg && npm run social
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

/**
 * What needs a twin, worked out rather than listed.
 *
 * A hand-maintained list is a list somebody forgets to add to, and the cost
 * of forgetting is invisible: the tag points at a PNG that was never rendered,
 * the scrape falls back, and nobody notices until a link is shared. So the
 * jobs come from the only two places an og:image can come from — the
 * site-wide card, and a post's `featuredimage`.
 *
 * `check-links` fails the build if one of these is missing, so the two halves
 * cannot drift apart.
 */
const jobs = [];

// The site-wide card. site-meta names the raster; the SVG beside it is source.
if (fs.existsSync(path.join(root, "static/img/og.svg"))) {
  jobs.push({ svg: "static/img/og.svg", png: "static/img/og.png", width: 1200 });
}

// Every post's featured image. Only an SVG needs rendering — a post whose
// image is already a raster is served as it is.
const blog = path.join(root, "src/pages/blog");
for (const name of fs.readdirSync(blog).filter((f) => f.endsWith(".md"))) {
  const front = fs.readFileSync(path.join(blog, name), "utf8").split("---")[1] || "";
  const match = front.match(/^featuredimage:\s*(\S+)\s*$/m);
  if (!match) continue;
  const image = match[1].replace(/^['"]|['"]$/g, "");
  if (!image.endsWith(".svg")) continue;
  jobs.push({
    svg: `static${image}`,
    png: `static${image.replace(/\.svg$/, ".png")}`,
    width: 2000,
  });
}

try {
  execFileSync("rsvg-convert", ["--version"], { stdio: "ignore" });
} catch {
  console.error("rsvg-convert not found — install it with `brew install librsvg`.");
  console.error("The committed PNGs are still in place; nothing was changed.");
  process.exit(1);
}

for (const j of jobs) {
  const src = path.join(root, j.svg);
  if (!fs.existsSync(src)) {
    console.warn(`  skipped ${j.svg} (no such file)`);
    continue;
  }
  execFileSync("rsvg-convert", ["-w", String(j.width), src, "-o", path.join(root, j.png)]);
  console.log(`  ${j.svg} -> ${j.png} @${j.width}px`);
}
