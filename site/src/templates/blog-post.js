import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { HTMLContentWithCodeCopy } from "../components/Content";
import TableOfContents from "../components/TableOfContents";
import PageActions from "../components/PageActions";
import { repo } from "../data/site";
import { getAuthor } from "../data/authors";
import slugify from "../utils/slugify";


const BlogPost = ({ data }) => {
  const post = data.markdownRemark;
  const { title, date, author: authorName, featuredimage, tags } = post.frontmatter;
  const author = getAuthor(authorName);
  const markdownPath = `${post.fields.slug.replace(/\/$/, "")}.md`;

  return (
    <Layout>
      <section className="blog-hero">
        <div className="blog-hero-content">
          <div className="blog-hero-text">
            <h1 className="blog-hero-title">{title}</h1>
            <div className="blog-hero-meta">
              {author && (
                <Link className="author-byline" to={`/authors/${slugify(author.name)}/`}>
                  {author.image ? (
                    <img className="author-avatar" src={author.image} alt="" />
                  ) : (
                    <span className="author-avatar author-avatar--initial">
                      {author.name.charAt(0)}
                    </span>
                  )}
                  <span className="author-name">{author.name}</span>
                </Link>
              )}
              <span className="publish-date">{date}</span>
            </div>
            <div className="blog-hero-actions">
              {/* The same words, without the page around them — for anyone
                  reading this with a language model rather than with eyes. */}
              <PageActions markdownPath={markdownPath} />
            </div>
          </div>
          {featuredimage && (
            <div className="blog-hero-image">
              <img src={featuredimage} alt="" />
            </div>
          )}
        </div>
      </section>

      <div className="blog-content-area">
        <div className="blog-content-wrapper">
          {/* The article is rendered first in the DOM order that matters:
              TableOfContents reads the live headings, so it has to run after
              they exist. CSS puts it back on the left. */}
          <div className="blog-body">
            <HTMLContentWithCodeCopy content={post.html} />
          </div>
          <TableOfContents />
        </div>
      </div>

      {tags && tags.length > 0 && (
        <section className="blog-tags-band">
          <div className="blog-tags-inner">
            <h4>Tags</h4>
            <div className="blog-tags-list">
              {tags.map((tag) => (
                <Link key={tag} className="blog-tag" to={`/tags/${slugify(tag)}/`}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="blog-cta-section">
        <h2>The lab is the evidence.</h2>
        <p>
          Everything argued here runs. Clone it, bring your own agent, and watch
          the owner’s terms be dictated, signed, and enforced while she is
          nowhere near the keyboard.
        </p>
        <div className="btn-row">
          <a
            className="btn btn--primary"
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Run it yourself
          </a>
          <Link className="btn btn--outline" to="/contact/">
            Ask us something
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export const Head = ({ data, location }) => {
  const post = data.markdownRemark;
  return (
    <SEO
      title={`${post.frontmatter.title} | UMA for Agents`}
      description={post.frontmatter.description}
      image={post.frontmatter.featuredimage}
      pathname={location.pathname}
      author={getAuthor(post.frontmatter.author)}
      datePublished={post.frontmatter.isoDate}
      tags={post.frontmatter.tags}
      article
    />
  );
};

export default BlogPost;

export const pageQuery = graphql`
  query BlogPostByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      fields {
        slug
      }
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        # Structured data and article:published_time need ISO 8601, not the
        # human form rendered in the byline.
        isoDate: date
        title
        author
        description
        category
        tags
        featuredimage
      }
    }
  }
`;
