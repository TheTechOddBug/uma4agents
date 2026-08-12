import React from "react";
import { Link, graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import PostGrid from "../components/PostGrid";
import { getAuthor } from "../data/authors";
import { LinkedInIcon } from "../components/Icons";

const AuthorRoute = ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges;
  const { totalCount } = data.allMarkdownRemark;
  const author = getAuthor(pageContext.author);

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Author</p>

          <div className="author-header">
            {author.image ? (
              <img className="author-avatar author-avatar--lg" src={author.image} alt="" />
            ) : (
              <div className="author-avatar author-avatar--lg author-avatar--initial">
                {author.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="page-hero__title author-header__name">{author.name}</h1>
              {author.title && <p className="author-header__title">{author.title}</p>}
            </div>
          </div>

          {author.bio && <p className="lede author-header__bio">{author.bio}</p>}

          <div className="btn-row">
            {author.linkedin && (
              <a
                className="btn btn--ghost"
                href={author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon className="icon-li" />
                Connect on LinkedIn
              </a>
            )}
            <Link className="btn btn--outline" to="/blog/">
              &larr; All posts
            </Link>
          </div>

          <p className="author-header__count">
            {totalCount} post{totalCount === 1 ? "" : "s"}
          </p>
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

export const Head = ({ pageContext, location }) => {
  const author = getAuthor(pageContext.author);
  return (
    <SEO
      title={`${author.name} | UMA for Agents`}
      description={author.bio || `Posts by ${author.name}.`}
      pathname={location.pathname}
    />
  );
};

export default AuthorRoute;

export const authorPageQuery = graphql`
  query AuthorPage($author: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { author: { eq: $author } } }
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
