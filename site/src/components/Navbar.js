import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import { navLinks, ctaLabel, ctaActions, codespace } from "../data/site";
import ThemeToggle from "./ThemeToggle";
import { GitHubIcon } from "./Icons";
import { U4AMark } from "./BrandMark";

/**
 * The call to action, as a menu.
 *
 * There are two ways in now — run the Kubernetes lab in a browser, or read
 * the source — and picking one for the visitor would be picking wrong for
 * half of them. Built on the same `page-actions` styles as the "Copy page"
 * menu on a post, so the two read as one system rather than two menus that
 * happen to live on the same site.
 */
const CtaMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="page-actions site-nav__cta" ref={ref}>
      <button
        className="btn btn--primary site-nav__cta-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {ctaLabel}
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="page-actions__menu page-actions__menu--right" role="menu">
          {ctaActions.map((action) => (
            <a
              key={action.href}
              className="page-actions__item"
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="page-actions__icon" aria-hidden="true">
                {action.href === codespace ? "▶" : <GitHubIcon />}
              </span>
              <span>
                <span className="page-actions__label">{action.label}</span>
                <span className="page-actions__hint">{action.hint}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-nav">
      <nav className="site-nav__inner" aria-label="Main navigation">
        <Link to="/" className="site-nav__brand" aria-label="UMA for Agents home">
          <U4AMark className="site-nav__mark" size={30} title="" />
          <span className="site-nav__tagline">UMA for Agents</span>
        </Link>

        <ul className="site-nav__links">
          {navLinks.map((item) => (
            <li key={item.to}>
              <Link
                className="site-nav__link"
                activeClassName="site-nav__link--active"
                partiallyActive={item.to !== "/"}
                to={item.to}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ThemeToggle />

        <CtaMenu />

        <button
          className={`site-nav__burger${mobileOpen ? " is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {mobileOpen && (
        <div className="site-nav__mobile">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          {/* No menu on mobile: the drawer is already a list, so the two
              destinations are shown outright rather than hidden behind a
              second tap. */}
          {ctaActions.map((action, i) => (
            <a
              key={action.href}
              className={`btn ${i === 0 ? "btn--primary" : "btn--outline"}`}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
            >
              {action.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
