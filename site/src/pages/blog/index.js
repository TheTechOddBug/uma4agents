import React from "react";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import BlogRoll from "../../components/BlogRoll";
import PageActions from "../../components/PageActions";

const BlogIndexPage = () => (
  <Layout>
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">Blog</p>
        <h1 className="page-hero__title">Notes from the lab.</h1>
        <p className="lede">
          Working notes on carrying User-Managed Access into the agent era —
          what translated cleanly, what needed reshaping, and what the agent
          era demands that the 2018 specification has no slot for.
        </p>
        {/* No single document to copy here, so this renders the menu alone:
            connect to the MCP server and read the whole blog from it. */}
        <div className="page-hero__actions">
          <PageActions pagePath="/blog/" />
        </div>
      </div>
    </section>

    <section className="section section--flush">
      <div className="container">
        <BlogRoll />
      </div>
    </section>
  </Layout>
);

export const Head = () => (
  <SEO
    title="Blog | UMA for Agents"
    description="Working notes on agent authorization, owner-dictated terms, and what UMA needed in order to survive the agent era."
    pathname="/blog/"
  />
);

export default BlogIndexPage;
