import React from "react";
import { Link } from "gatsby";

/**
 * The card grid a page ends on.
 *
 * Every documentation page should answer "where do I go now", and leaving that
 * to the sidebar makes the reader work it out from a list of titles. The cards
 * are the author saying which two or three pages actually follow from this one.
 *
 * Fed from `next` in the page's frontmatter; an external `to` opens in a new
 * tab, so links out to a spec or another project do not lose the reader's
 * place in the manual.
 */
const DocsCards = ({ items = [] }) => (
  <div className="doc-cards">
    {items.map((item) => {
      const external = /^https?:\/\//.test(item.to);
      const body = (
        <>
          <span className="doc-card__title">{item.title}</span>
          {item.blurb && <span className="doc-card__blurb">{item.blurb}</span>}
        </>
      );
      return external ? (
        <a
          className="doc-card"
          key={item.to}
          href={item.to}
          target="_blank"
          rel="noopener noreferrer"
        >
          {body}
        </a>
      ) : (
        <Link className="doc-card" key={item.to} to={item.to}>
          {body}
        </Link>
      );
    })}
  </div>
);

export default DocsCards;
