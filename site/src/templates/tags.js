import React from "react";
import { Link, graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import PostGrid from "../components/PostGrid";

const TagRoute = ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges;
  const { totalCount } = data.allMarkdownRemark;
  const { tag } = pageContext;

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Tag</p>
          <h1 className="page-hero__title">{tag}</h1>
          <p className="lede">
            {totalCount} post{totalCount === 1 ? "" : "s"} tagged &ldquo;{tag}
            &rdquo;.
          </p>
          <div className="btn-row">
            <Link className="btn btn--outline" to="/blog/">
              &larr; All posts
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--flush">
        <div className="container">
          <PostGrid posts={posts} />
        </div>
      </section>
    </Layout>
  );
};

export const Head = ({ pageContext, location }) => (
  <SEO
    title={`${pageContext.tag} | UMA for Agents`}
    description={`Posts tagged ${pageContext.tag}.`}
    pathname={location.pathname}
  />
);

export default TagRoute;

export const tagPageQuery = graphql`
  query TagPage($tag: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          id
          excerpt(pruneLength: 190)
          fields { slug }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            category
            featuredimage
          }
        }
      }
    }
  }
`;
