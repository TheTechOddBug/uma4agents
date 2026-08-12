import React from "react";
import { Link } from "gatsby";
import { repo, people, footerBlurb, tagline } from "../data/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="site-footer__top">
        <div className="site-footer__about">
          <div className="site-footer__mark">U4A</div>
          <p className="site-footer__blurb">{footerBlurb}</p>

          <a
            className="site-footer__repo"
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon className="icon-gh" />
            <span>github.com/nickgamb/uma4agents</span>
          </a>

          <p className="site-footer__label">The people behind it</p>
          <div className="site-footer__people">
            {people.map((p) => (
              <a
                key={p.name}
                href={p.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.name} on LinkedIn`}
              >
                <LinkedInIcon className="icon-li" />
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* The code you can scan from a slide. */}
        <div className="site-footer__qr">
          <a href={repo} aria-label="QR code to the repository">
            <img
              src="/qr.svg"
              alt="QR code linking to the UMA for Agents repository"
              width="118"
              height="118"
            />
          </a>
          <p>Scan for the lab</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>&copy; {new Date().getFullYear()} UMA for Agents</span>
        <span className="site-footer__tagline">{tagline}</span>
        <Link className="link-arrow" to="/contact/">
          Get in touch &rarr;
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
