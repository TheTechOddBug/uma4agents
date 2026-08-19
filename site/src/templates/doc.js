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
import DocDiagram from "../components/DocDiagram";
import { allPages, neighbours, tabForPath } from "../data/docs-nav";

const FIGURE_MARKER = /<!--\s*figure:([a-z0-9-]+)\s*-->/g;

/**
 * Split rendered HTML at `<!--figure:name-->` markers.
 *
 * Returns an ordered list of `{ html }` and `{ figure }` parts, so a page can
 * place a diagram inside a section instead of only at the top. Pages with no
 * marker come back as a single html part and render exactly as before.
 */
const splitOnFigures = (html) => {
  const parts = [];
  let last = 0;
  for (const match of html.matchAll(FIGURE_MARKER)) {
    if (match.index > last) parts.push({ html: html.slice(last, match.index) });
    parts.push({ figure: match[1] });
    last = match.index + match[0].length;
  }
  if (last < html.length) parts.push({ html: html.slice(last) });
  return parts;
};

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
  const { title, description, next, video, videoTitle, videoPoster, diagram, diagramCaption } =
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

            {diagram && (
              <DocDiagram name={diagram} caption={diagramCaption} />
            )}

            {/* Rendered before the contents list on purpose: TableOfContents
                reads the headings out of the live DOM, so they have to exist
                by the time it runs. CSS puts it back on the right.

                A page can also drop a figure into the middle of itself with an
                HTML comment — `<!--figure:ticket-lifecycle-->` — which remark
                passes through untouched. The frontmatter `diagram` is the
                page's opening figure; this is for a diagram that belongs to
                one section rather than to the page, like a state machine that
                would otherwise have to be ASCII art. */}
            <div className="doc__body blog-body">
              {splitOnFigures(page.html).map((part, i) =>
                part.figure ? (
                  <DocDiagram key={`fig-${part.figure}`} name={part.figure} />
                ) : (
                  <HTMLContentWithCodeCopy key={`html-${i}`} content={part.html} />
                )
              )}
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
  const here = allPages().find((p) => p.to === location.pathname);
  const sectionStart = here && allPages().find((p) => p.tab === here.tab);
  return (
    <SEO
      // `seoTitle` lets a page keep a short, voiced heading in the nav and
      // still say what it is to someone searching. "The four beats" is a good
      // heading and a hopeless search target.
      title={`${page.frontmatter.seoTitle || page.frontmatter.title} | UMA for Agents docs`}
      description={page.frontmatter.description}
      pathname={location.pathname}
      docPage
      breadcrumb={
        here && {
          section: here.tabLabel,
          sectionUrl: sectionStart ? sectionStart.to : here.to,
          group: here.group,
          title: page.frontmatter.title,
        }
      }
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
        seoTitle
        description
        video
        videoTitle
        videoPoster
        diagram
        diagramCaption
        next {
          title
          to
          blurb
        }
      }
    }
  }
`;
