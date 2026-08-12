import React from "react";
import { Link } from "gatsby";

/**
 * The card grid, shared by every listing.
 *
 * The blog index, a tag archive and an author archive all show the same
 * thing, and had three copies of it in the site this was adapted from. One
 * copy means a change to a card is a change to all of them.
 */
const PostGrid = ({ posts }) => (
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

export default PostGrid;
