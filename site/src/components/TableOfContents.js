import React, { useEffect, useState } from "react";

/**
 * Contents for a rendered article.
 *
 * It reads the headings out of the live DOM and gives each one an id as it
 * goes, rather than parsing the HTML string into a detached document and
 * hoping the ids line up. They did not: Markdown headings arrive without ids
 * unless a plugin adds them, so a table of contents built from a parsed copy
 * links to anchors that exist nowhere on the page — every entry silently
 * dead, and nothing to see in the console.
 *
 * Setting the id on the same node the link points at makes the two
 * impossible to disagree about.
 */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

const TableOfContents = ({ containerSelector = ".blog-body" }) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const seen = new Map();
    const items = Array.from(container.querySelectorAll("h2, h3")).map((el) => {
      if (!el.id) {
        const base = slugify(el.textContent) || "section";
        const n = seen.get(base) || 0;
        seen.set(base, n + 1);
        el.id = n ? `${base}-${n}` : base;
      }
      // Clear the sticky header when jumped to.
      el.style.scrollMarginTop = "96px";
      return { id: el.id, text: el.textContent, level: el.tagName.toLowerCase() };
    });

    setHeadings(items);
  }, [containerSelector]);

  if (headings.length === 0) return null;

  return (
    <nav className="blog-toc" aria-label="On this page">
      <h4>On this page</h4>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={h.level === "h3" ? "is-sub" : undefined}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
