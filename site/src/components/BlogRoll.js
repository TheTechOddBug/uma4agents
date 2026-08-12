import React from "react";
import { Link, graphql, useStaticQuery } from "gatsby";

const BlogRoll = () => {
  const data = useStaticQuery(graphql`
    query BlogRollQuery {
      allMarkdownRemark(
        sort: { frontmatter: { date: DESC } }
        filter: { frontmatter: { templateKey: { eq: "blog-post" } } }
      ) {
        edges {
          node {
            excerpt(pruneLength: 190)
            id
            fields {
              slug
            }
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
  `);

  const posts = data.allMarkdownRemark.edges;

  return (
    <div className="blog-grid">
      {posts.map(({ node: post }) => (
        <Link key={post.id} className="blog-card" to={post.fields.slug}>
          <div className="blog-card-image">
            {post.frontmatter.featuredimage ? (
              <img src={post.frontmatter.featuredimage} alt="" />
            ) : (
              <div className="blog-card-image__fallback" />
            )}
            <span className="blog-card-category">
              {post.frontmatter.category || "Agentic authorization"}
            </span>
          </div>
          <div className="blog-card-content">
            <h2 className="blog-card-title">{post.frontmatter.title}</h2>
            <p className="blog-card-excerpt">{post.excerpt}</p>
            <span className="blog-card-date">{post.frontmatter.date}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BlogRoll;
