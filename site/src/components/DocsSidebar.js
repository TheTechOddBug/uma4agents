import React from "react";
import { Link } from "gatsby";
import { tabs, nav, tabForPath } from "../data/docs-nav";

/**
 * The documentation's two navigations.
 *
 * `DocsTabs` picks a section; `DocsSidebar` shows only that section's pages.
 * Splitting them keeps the sidebar short enough to scan — one list of five
 * tabs and one list of eight pages, rather than a single tree of thirty-three
 * that has to be collapsed to be usable.
 */

export const DocsTabs = ({ pathname }) => {
  const active = tabForPath(pathname);
  return (
    <nav className="docs-tabs" aria-label="Documentation sections">
      <div className="docs-tabs__inner">
        {tabs.map((t) => {
          const first = (nav[t.id] || [])[0]?.pages[0];
          if (!first) return null;
          return (
            <Link
              key={t.id}
              to={first.to}
              className={`docs-tabs__tab${
                t.id === active ? " docs-tabs__tab--active" : ""
              }`}
              aria-current={t.id === active ? "page" : undefined}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const DocsSidebar = ({ pathname, onNavigate }) => {
  const active = tabForPath(pathname);
  const groups = nav[active] || [];

  return (
    <nav className="docs-sidebar" aria-label="Pages in this section">
      {groups.map((g) => (
        <div className="docs-sidebar__group" key={g.group}>
          <p className="docs-sidebar__heading">{g.group}</p>
          <ul>
            {g.pages.map((p) => {
              const current = p.to === pathname;
              return (
                <li key={p.to}>
                  <Link
                    to={p.to}
                    onClick={onNavigate}
                    className={`docs-sidebar__link${
                      current ? " docs-sidebar__link--active" : ""
                    }`}
                    aria-current={current ? "page" : undefined}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default DocsSidebar;
