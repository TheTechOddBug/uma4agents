import React, { useEffect, useState } from "react";
import slugify from "../utils/slugify";

// Where the contents stops being a column and becomes a disclosure. Shared
// with `$bp-lg` in the stylesheet; the two have to agree or the list closes
// itself on a screen where it is not closable.
const COLLAPSE_AT = 1080;

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
const TableOfContents = ({ containerSelector = ".blog-body", collapsible = false }) => {
  const [headings, setHeadings] = useState([]);
  const detailsRef = React.useRef(null);

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

  // Jump to a heading, at every width, rather than leaving it to the
  // browser's own fragment navigation.
  //
  // That navigation is not reliable here — the page sets
  // `scroll-behavior: smooth`, and a fragment jump under it lands nowhere
  // often enough to be worth not depending on. Scrolling explicitly is
  // deterministic, and instant is the right answer anyway for a control
  // whose purpose is to skip four thousand pixels.
  //
  // Where the list is a disclosure it is closed first, and the reflow is
  // forced before the scroll: collapsing several hundred pixels from above
  // the target after computing where to go lands somewhere else, usually
  // back at the top.
  //
  // Modified clicks are left alone, so "open in a new tab" still does.
  const jump = (e, id) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const el = detailsRef.current;
    if (el && window.matchMedia(`(max-width: ${COLLAPSE_AT}px)`).matches) {
      el.open = false;
      void document.body.offsetHeight;
    }
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "instant", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  // Open on a wide screen, closed on a narrow one — set as the attribute
  // rather than faked with CSS.
  //
  // Forcing the list visible with `display` while `details` stays closed
  // looks right and is not: the element is still a closed disclosure, and
  // its links do not navigate. So the attribute is what changes, and the
  // stylesheet only hides the summary where there is nothing to disclose.
  useEffect(() => {
    if (!collapsible) return undefined;
    const mq = window.matchMedia(`(max-width: ${COLLAPSE_AT}px)`);
    const sync = () => {
      if (detailsRef.current) detailsRef.current.open = !mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [collapsible, headings]);

  if (headings.length === 0) return null;

  const list = (
    <ul>
      {headings.map((h) => (
        <li key={h.id} className={h.level === "h3" ? "is-sub" : undefined}>
          <a href={`#${h.id}`} onClick={(e) => jump(e, h.id)}>
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );

  // `collapsible` renders the same list as a disclosure, so a long contents
  // can fold away on a phone instead of standing between the reader and the
  // page. It is one element at both sizes rather than two rendered
  // conditionally: a component that swapped its markup at a breakpoint would
  // lose the open state on rotation, and would need JavaScript to know the
  // viewport before it could render at all.
  //
  // CSS forces it open and hides the summary above the breakpoint, so on a
  // wide screen this is the plain list it always was.
  if (collapsible) {
    return (
      <details className="blog-toc blog-toc--collapsible" ref={detailsRef}>
        <summary>
          <span>On this page</span>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
               fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        {list}
      </details>
    );
  }

  return (
    <nav className="blog-toc" aria-label="On this page">
      <h4>On this page</h4>
      {list}
    </nav>
  );
};

export default TableOfContents;
