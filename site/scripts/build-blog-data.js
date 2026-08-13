#!/usr/bin/env node
/**
 * Reads the blog Markdown and writes the two indexes that are not pages:
 *
 *   netlify/functions/blog-data.json   what the MCP server answers from
 *   static/llms.txt                    the guided index for language models
 *
 * Both are generated rather than maintained, because either one going stale
 * is invisible — a missing post does not break a build, it just quietly stops
 * being findable.
 *
 * Runs from `prebuild` / `predevelop`.
 */
const fs = require("fs");
const path = require("path");
const siteMetadata = require("../site-meta");

const root = path.join(__dirname, "..");
const BLOG_DIR = path.join(root, "src", "pages", "blog");
const DATA_OUT = path.join(root, "netlify", "functions", "blog-data.json");
const LLMS_OUT = path.join(root, "static", "llms.txt");
const SITE = siteMetadata.siteUrl;

/**
 * A deliberately small frontmatter reader.
 *
 * It handles exactly the shapes these posts use — `key: value` and a block
 * list of `- item` — rather than pulling in a YAML parser for two files.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  let currentKey = null;
  let listItems = [];

  for (const line of match[1].split("\n")) {
    const listMatch = line.match(/^\s+-\s+(.+)/);
    if (listMatch && currentKey) {
      listItems.push(listMatch[1].replace(/^["']|["']$/g, ""));
      continue;
    }
    if (currentKey && listItems.length > 0) {
      frontmatter[currentKey] = listItems;
      listItems = [];
      currentKey = null;
    }
    const kv = line.match(/^(\w+):\s*(.*)/);
    if (kv) {
      const key = kv[1];
      let value = kv[2].trim().replace(/^["']|["']$/g, "");
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (value === "") {
        currentKey = key;
        listItems = [];
        continue;
      }
      frontmatter[key] = value;
      currentKey = null;
    }
  }
  if (currentKey && listItems.length > 0) frontmatter[currentKey] = listItems;

  return { frontmatter, body: match[2].trim() };
}

const posts = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((filename) => {
    const { frontmatter, body } = parseFrontmatter(
      fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8")
    );
    const slug = filename.replace(/\.md$/, "");
    return {
      slug,
      url: `/blog/${slug}/`,
      markdown: `/blog/${slug}.md`,
      title: frontmatter.title || slug,
      date: frontmatter.date || null,
      author: frontmatter.author || null,
      description: frontmatter.description || null,
      category: frontmatter.category || null,
      tags: frontmatter.tags || [],
      featuredpost: frontmatter.featuredpost || false,
      featuredimage: frontmatter.featuredimage || null,
      body,
    };
  })
  .sort((a, b) => (a.date && b.date ? new Date(b.date) - new Date(a.date) : 0));

fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true });
fs.writeFileSync(DATA_OUT, JSON.stringify(posts, null, 2));

// --- llms.txt (https://llmstxt.org) --------------------------------------
const llms = [
  `# ${siteMetadata.title}`,
  "",
  `> ${siteMetadata.description}`,
  "",
  "A working proof-of-concept, with Eve Maler, carrying User-Managed Access",
  "(UMA) 2.0 into the agent era: the resource owner sets policy once, and other",
  "people's AI agents negotiate access against it while she is offline. The lab",
  "runs locally with one command and also deploys to Kubernetes.",
  "",
  "Every post below is available as plain Markdown by appending `.md` to its",
  "URL. The site also speaks MCP at " + `${SITE}/mcp` + " with two tools,",
  "`listBlogs` and `getBlog`, if you would rather read it that way.",
  "",
  "## Posts",
  "",
  ...posts.map(
    (p) => `- [${p.title}](${SITE}${p.markdown}): ${p.description || ""}`.trimEnd()
  ),
  "",
  "## Pages",
  "",
  `- [Home](${SITE}/): The four-beat grant as an animated walkthrough — challenge, terms, commit, grant.`,
  `- [Blog](${SITE}/blog/): Working notes on carrying UMA into the agent era.`,
  `- [Contact](${SITE}/contact/): Use cases, problems and ideas are what shape where this goes next.`,
  "",
  "## Source",
  "",
  "- [Repository](https://github.com/nickgamb/uma4agents): Apache-2.0. The lab, the reference architecture, and the specs it profiles.",
  "- [FINDINGS.md](https://github.com/nickgamb/uma4agents/blob/main/FINDINGS.md): Recommendations to the spec authors, each backed by running code.",
  "- [docs/PROTOCOL.md](https://github.com/nickgamb/uma4agents/blob/main/docs/PROTOCOL.md): The wire contract, including where this profile deviates from UMA 2.0 and why.",
  "- [docs/KUBERNETES.md](https://github.com/nickgamb/uma4agents/blob/main/docs/KUBERNETES.md): The deployed reference architecture and a fifteen-minute demo guide.",
  "",
].join("\n");

fs.writeFileSync(LLMS_OUT, llms);

const rel = (p) => path.relative(process.cwd(), p);
console.log(`blog index: ${posts.length} posts\n  ${rel(DATA_OUT)}\n  ${rel(LLMS_OUT)}`);
