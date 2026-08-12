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
