const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

const slugify = require("./src/utils/slugify");

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemarkFrontmatter {
      templateKey: String
      title: String
      date: Date @dateformat
      author: String
      description: String
      featuredpost: Boolean
      featuredimage: String
      category: String
      tags: [String]
    }
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }
  `);
};

exports.createPages = async ({ actions, graphql }) => {
  const result = await graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
              tags
              author
            }
          }
        }
      }
    }
  `);
  if (result.errors) throw result.errors;

  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach(({ node }) => {
    const { templateKey } = node.frontmatter;
    if (!templateKey) return;
    actions.createPage({
      path: node.fields.slug,
      component: path.resolve(`src/templates/${templateKey}.js`),
      context: { id: node.id },
    });
  });

  // A page per tag. The query filters on the tag's own text, so the slug is
  // only ever the URL — which is why the templates and this share slugify()
  // rather than each having their own idea of what a tag looks like.
  const tags = [
    ...new Set(posts.flatMap(({ node }) => node.frontmatter.tags || [])),
  ];
  tags.forEach((tag) => {
    actions.createPage({
      path: `/tags/${slugify(tag)}/`,
      component: path.resolve("src/templates/tags.js"),
      context: { tag },
    });
  });

  // And a page per author, which is where the bio lives.
  const authors = [
    ...new Set(posts.map(({ node }) => node.frontmatter.author).filter(Boolean)),
  ];
  authors.forEach((author) => {
    actions.createPage({
      path: `/authors/${slugify(author)}/`,
      component: path.resolve("src/templates/author.js"),
      context: { author },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type === "MarkdownRemark") {
    actions.createNodeField({
      name: "slug",
      node,
      value: createFilePath({ node, getNode }),
    });
  }
};

/**
 * Write public/sitemap.xml from the pages that were actually emitted.
 *
 * The routes are read off the built output — every public/**\/index.html is a
 * page — rather than from `allSitePage`, which comes back empty in this
 * project by the time onPostBuild runs. That is also what made
 * gatsby-plugin-sitemap useless here: it queries for the same thing, gets
 * nothing, and writes a zero-byte sitemap *without failing the build*.
 *
 * Reading the filesystem has the additional virtue of describing what
 * shipped rather than what the build intended to ship.
 */
function writeSitemap({ fs, siteMeta }) {
  const publicDir = path.resolve("public");

  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name === "index.html" ? [path.dirname(full)] : [];
    });

  const paths = walk(publicDir)
    .map((d) => {
      const rel = path.relative(publicDir, d);
      return rel === "" ? "/" : `/${rel.split(path.sep).join("/")}/`;
    })
    .filter((p) => !p.startsWith("/404"))
    .sort();

  if (paths.length === 0) {
    throw new Error("sitemap: no pages found — refusing to write an empty one");
  }

  const urls = paths
    .map((p) => {
      const priority = p === "/" ? "1.0" : p.startsWith("/blog/") ? "0.8" : "0.6";
      return [
        "  <url>",
        `    <loc>${siteMeta.siteUrl}${p}</loc>`,
        `    <changefreq>weekly</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  fs.writeFileSync(
    path.resolve("public/sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.info(`Wrote sitemap.xml with ${paths.length} URLs`);
}

/**
 * Publish a plain-Markdown copy of every post beside its HTML page, e.g.
 * /blog/2026-08-06-let-them-a-developers-guide-to-u4a.md
 *
 * This is what the "View as Markdown" action reads, and it gives language
 * models a clean source to ingest without stripping page chrome — which
 * matters more than usual for a site whose subject is what agents are and
 * are not allowed to do with someone else's material.
 */
exports.onPostBuild = async () => {
  const fs = require("fs");
  const siteMeta = require("./site-meta");
  const srcDir = path.resolve("src/pages/blog");
  const outDir = path.resolve("public/blog");

  // Independent of the Markdown twins below, and written first so that the
  // early return when there are no posts cannot silently skip it.
  writeSitemap({ fs, siteMeta });

  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(srcDir, file), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const body = match ? match[2].trim() : raw.trim();

    const field = (key) => {
      const m = match && match[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
      return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
    };

    const slug = file.replace(/\.md$/, "");
    const header = [
      `# ${field("title")}`,
      "",
      `Author: ${field("author")}`,
      `Date: ${field("date").slice(0, 10)}`,
      `Source: ${siteMeta.siteUrl}/blog/${slug}/`,
      "",
      "---",
      "",
    ].join("\n");

    fs.writeFileSync(path.join(outDir, `${slug}.md`), header + body + "\n");
  }

  console.info(`Published ${files.length} Markdown copies to /blog/*.md`);
};
