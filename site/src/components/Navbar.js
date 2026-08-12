import React, { useState } from "react";
import { Link } from "gatsby";
import { navLinks, repo, ctaLabel } from "../data/site";
import { GitHubIcon } from "./Icons";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-nav">
      <nav className="site-nav__inner" aria-label="Main navigation">
        <Link to="/" className="site-nav__brand" aria-label="UMA for Agents home">
          <span className="site-nav__mark">U4A</span>
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

        <a
          className="btn btn--primary site-nav__cta"
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon className="icon-gh" />
          {ctaLabel}
        </a>

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
          <a
            className="btn btn--primary"
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
