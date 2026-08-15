import React, { useState } from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { HTMLContentWithCodeCopy } from "../components/Content";
import TableOfContents from "../components/TableOfContents";
import PageActions from "../components/PageActions";
import DocsSidebar, { DocsTabs } from "../components/DocsSidebar";
import DocsCards from "../components/DocsCards";
import VideoEmbed from "../components/VideoEmbed";
import { allPages, neighbours, tabForPath } from "../data/docs-nav";

/**
 * A documentation page.
 *
 * Three columns: which section you are in, this page, and where you are within
 * it. The middle column is the only one that scrolls with the article; the
 * other two stay put, because losing your place in a thirty-page manual is the
 * failure mode a docs layout exists to prevent.
 */
const Doc = ({ data, location }) => {
  const page = data.markdownRemark;
  const { title, description, next, video, videoTitle, videoPoster } =
    page.frontmatter;
  const pathname = location.pathname;
  const markdownPath = `${pathname.replace(/\/$/, "")}.md`;
  const [menuOpen, setMenuOpen] = useState(false);

  const here = allPages().find((p) => p.to === pathname);
  const { prev, next: after } = neighbours(pathname);

  return (
    <Layout>
      <DocsTabs pathname={pathname} />

      <div className="docs-shell">
        <button
          className={`docs-menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Browse"} this section
        </button>

        <aside className={`docs-shell__nav${menuOpen ? " is-open" : ""}`}>
          <DocsSidebar pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </aside>

        <main className="docs-shell__main">
          <article className="doc">
            <div className="doc__head">
              {here && <p className="doc__breadcrumb">{here.group}</p>}
              <div className="doc__title-row">
                <h1>{title}</h1>
                <PageActions markdownPath={markdownPath} align="right" />
              </div>
              {description && <p className="doc__lede">{description}</p>}
            </div>

            {video && (
              <VideoEmbed
                id={video}
                title={videoTitle || title}
                poster={videoPoster}
              />
            )}

            {/* Rendered before the contents list on purpose: TableOfContents
                reads the headings out of the live DOM, so they have to exist
                by the time it runs. CSS puts it back on the right. */}
            <div className="doc__body blog-body">
              <HTMLContentWithCodeCopy content={page.html} />
            </div>

            {next && next.length > 0 && (
              <section className="doc__next">
                <h2>What's next</h2>
                <DocsCards items={next} />
              </section>
            )}

            <nav className="doc__pager" aria-label="Previous and next page">
              {prev ? (
                <Link className="doc__pager-link" to={prev.to}>
                  <span>Previous</span>
                  {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {after && (
                <Link
                  className="doc__pager-link doc__pager-link--next"
                  to={after.to}
                >
                  <span>Next</span>
                  {after.title}
                </Link>
              )}
            </nav>
          </article>
        </main>

        <aside className="docs-shell__toc">
          <TableOfContents containerSelector=".doc__body" />
        </aside>
      </div>
    </Layout>
  );
};

export const Head = ({ data, location }) => {
  const page = data.markdownRemark;
  return (
    <SEO
      title={`${page.frontmatter.title} | UMA for Agents docs`}
      description={page.frontmatter.description}
      pathname={location.pathname}
      docPage
    />
  );
};

export default Doc;

export const pageQuery = graphql`
  query DocByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      fields {
        slug
      }
      frontmatter {
        title
        description
        video
        videoTitle
        videoPoster
        next {
          title
          to
          blurb
        }
      }
    }
  }
`;
