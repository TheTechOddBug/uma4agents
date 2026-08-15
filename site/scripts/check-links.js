#!/usr/bin/env node
/**
 * Fails the build on a documentation link that goes nowhere.
 *
 * Three checks, over what actually shipped in public/ rather than over what
 * the source intended to ship:
 *
 *   1. every page docs-nav.js lists was built
 *   2. every internal link in a docs page resolves to a built page
 *   3. every built docs page is reachable from docs-nav.js
 *
 * The third one is the reason this exists. A dead link is visible the first
 * time somebody clicks it; an orphaned page is invisible forever, because
 * nothing links to it and nobody finds out it is there.
 *
 * Runs from `postbuild`, after gatsby-node's onPostBuild has emitted the
 * sitemap and the Markdown twins.
 */
const fs = require("fs");
const path = require("path");
const { allPages } = require("../src/data/docs-nav");

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

if (problems.length > 0) {
  console.error(`\ncheck-links: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-links: ${pages.length} docs pages, every link resolves, no orphans`
);
