#!/usr/bin/env node
/**
 * Fails the build on a documentation link that goes nowhere.
 *
 * Four checks, over what actually shipped in public/ rather than over what
 * the source intended to ship:
 *
 *   1. every page docs-nav.js lists was built
 *   2. every internal link in a docs page resolves to a built page
 *   3. every built docs page is reachable from docs-nav.js
 *   4. every og:image and twitter:image on any built page was published
 *
 * The third one is the reason this exists. A dead link is visible the first
 * time somebody clicks it; an orphaned page is invisible forever, because
 * nothing links to it and nobody finds out it is there.
 *
 * The fourth has the same shape. SEO.js rewrites an SVG social image to its
 * PNG twin, because the scrapers will not render an SVG — and when that PNG
 * is missing they fall back to scraping the page, so the card silently
 * becomes the author's avatar instead of the diagram. Nothing about the page
 * looks wrong; you find out when somebody shares it. `npm run social`
 * renders the twins, and this makes forgetting to run it fail the build.
 *
 * Runs from `postbuild`, after gatsby-node's onPostBuild has emitted the
 * sitemap and the Markdown twins.
 */
const fs = require("fs");
const path = require("path");
const { allPages } = require("../src/data/docs-nav");
const siteMetadata = require("../site-meta");

const PUBLIC = path.join(__dirname, "..", "public");
const problems = [];

const built = (url) => fs.existsSync(path.join(PUBLIC, url, "index.html"));

// 1 — every declared page exists
const declared = new Set();
for (const page of allPages()) {
  declared.add(page.to);
  if (!built(page.to)) {
    problems.push(`docs-nav.js lists ${page.to}, which did not build`);
  }
}

// 2 — every internal link resolves
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name === "index.html" ? [full] : [];
  });

const docsDir = path.join(PUBLIC, "docs");
if (!fs.existsSync(docsDir)) {
  console.error("check-links: public/docs does not exist — nothing to check");
  process.exit(1);
}

const pages = walk(docsDir);

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const from = `/${path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/")}/`;

  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1];
    // Only internal page links. Assets, Markdown twins and the generated
    // JSON are files rather than pages, so index.html is the wrong test.
    if (/\.[a-z0-9]{2,5}$/i.test(href)) {
      if (!fs.existsSync(path.join(PUBLIC, href))) {
        problems.push(`${from} links to ${href}, which was not published`);
      }
      continue;
    }
    if (!built(href)) {
      problems.push(`${from} links to ${href}, which does not exist`);
    }
  }
}

// 3 — no orphans
for (const file of pages) {
  const url = `/${path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/")}/`;
  if (!declared.has(url)) {
    problems.push(`${url} was built but no entry in docs-nav.js points at it`);
  }
}

// 4 — every social image was published
//
// Across every built page rather than only the docs, because any page type
// may set one and the failure is invisible on all of them.
const everyPage = walk(PUBLIC);
let socialImages = 0;
for (const file of everyPage) {
  const html = fs.readFileSync(file, "utf8");
  const from = `/${path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/")}/`;
  const seen = new Set();

  for (const match of html.matchAll(
    /<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)"/g
  )) {
    const url = match[1];
    if (!url.startsWith(siteMetadata.siteUrl)) continue; // somebody else's host
    const asset = url.slice(siteMetadata.siteUrl.length);
    if (seen.has(asset)) continue;
    seen.add(asset);
    socialImages += 1;
    if (!fs.existsSync(path.join(PUBLIC, asset))) {
      problems.push(
        `${from} declares a social image at ${asset}, which was not published` +
          (asset.endsWith(".png") ? " — run `npm run social`" : "")
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`\ncheck-links: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-links: ${pages.length} docs pages, every link resolves, no orphans; ` +
    `${socialImages} social images published`
);
