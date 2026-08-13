import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { createRequire } from "module";

/**
 * u4a.ai as an MCP server.
 *
 * The site is about agents negotiating for access to things, so it should be
 * readable by one. Two tools: list what is here, and fetch a post in full.
 *
 * The index is generated at build time by scripts/build-blog-data.js and
 * bundled with the function — reading the Markdown from disk at request time
 * would not work, because the source tree is not deployed alongside the
 * function.
 *
 * Stateless on purpose: there is no session to keep, every call is a read,
 * and a stateless transport survives being run on whichever instance the
 * platform happens to pick.
 */

const require = createRequire(import.meta.url);
const blogData = require("./blog-data.json");

const SITE = "https://u4a.ai";
const NAME = "u4a";
const VERSION = "1.0.0";

function createServer() {
  const server = new McpServer({ name: NAME, version: VERSION });

  server.tool(
    "listBlogs",
    "List every post on u4a.ai with its title, date, author, category, " +
      "description, tags and URL. Call this first to find a slug for getBlog.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            blogData.map((post) => ({
              title: post.title,
              date: post.date,
              author: post.author,
              category: post.category,
              description: post.description,
              slug: post.slug,
              url: `${SITE}${post.url}`,
              markdown: `${SITE}${post.markdown}`,
              tags: post.tags,
              featuredpost: post.featuredpost,
            })),
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "getBlog",
    "Get the full Markdown of one post by slug. Use listBlogs first to find " +
      "available slugs.",
    {
      slug: z
        .string()
        .describe(
          "The post slug, e.g. '2026-08-12-deploying-u4a-at-scale'"
        ),
    },
    async ({ slug }) => {
      const post = blogData.find((p) => p.slug === slug);

      if (!post) {
        return {
          content: [
            {
              type: "text",
              text:
                `No post with slug "${slug}". Available: ` +
                blogData.map((p) => p.slug).join(", "),
            },
          ],
          isError: true,
        };
      }

      const header = [
        `# ${post.title}`,
        "",
        `**Author:** ${post.author}`,
        `**Date:** ${post.date}`,
        `**Category:** ${post.category}`,
        `**Tags:** ${(post.tags || []).join(", ")}`,
        `**URL:** ${SITE}${post.url}`,
        "",
        `> ${post.description}`,
        "",
        "---",
        "",
      ].join("\n");

      return { content: [{ type: "text", text: header + post.body }] };
    }
  );

  return server;
}

export default async (req) => {
  // A plain GET is someone checking the endpoint is real, not a protocol
  // call — answer with what this is rather than a transport error.
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        name: NAME,
        version: VERSION,
        description:
          "MCP server for u4a.ai. Tools: listBlogs, getBlog. " +
          "Every post is also plain Markdown at /blog/<slug>.md",
        tools: ["listBlogs", "getBlog"],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (req.method === "DELETE") return new Response(null, { status: 405 });

  try {
    const server = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: "/mcp" };
