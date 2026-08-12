import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { contact, repo } from "../data/site";

const expectations = [
  "A reply from the people who built the lab, not a sequence.",
  "If you are implementing: a straight answer about what is specified, what is a finding, and what is still parked.",
  "If you are reviewing for the working group: the evidence behind any verdict, including the negative results.",
];

const topics = [
  "A question about the protocol",
  "Running the lab",
  "Implementing U4A",
  "Kantara / UMA working group",
  "MCP or AAuth binding",
  "Speaking or a walkthrough",
  "Something else",
];

const ContactPage = () => {
  // Netlify redirects back to the form's action URL after a successful POST.
  // Read it after mount so the server-rendered markup and the first client
  // render agree — reading window during render would mismatch and warn.
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setSubmitted(
      new URLSearchParams(window.location.search).get("submitted") === "true",
    );
  }, []);

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1 className="page-hero__title">Ask us something.</h1>
          <p className="lede">
            This is a research lab with running code behind it. If you are
            implementing against it, reviewing it for the working group, or you
            think a verdict here is wrong, that is exactly the mail we want.
          </p>
        </div>
      </section>

      <section className="section section--flush">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-grid__aside">
              <p className="eyebrow eyebrow--plain">Direct</p>
              <a className="contact-email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <p className="body-copy">
                Issues and pull requests are welcome too, and are usually the
                faster route for anything about the code:{" "}
                <a href={repo} target="_blank" rel="noopener noreferrer">
                  the repository
                </a>
                .
              </p>

              <div className="expect-card">
                <h2 className="expect-card__title">What to expect</h2>
                <ul className="check-list">
                  {expectations.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="form-panel">
              {submitted && (
                <div className="form-success" role="status">
                  <h2 className="form-success__title">Message sent.</h2>
                  <p>
                    Thanks — that reached us. We will reply directly, usually
                    within a couple of days.
                  </p>
                  <p>
                    If it is urgent, email{" "}
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>.
                  </p>
                  <div className="btn-row">
                    <Link className="btn btn--outline" to="/">
                      Back to the story
                    </Link>
                  </div>
                </div>
              )}

              {/* Netlify Forms: the hidden form-name field is what wires this
                  up at deploy time, and the honeypot is what keeps the inbox
                  usable without putting a CAPTCHA in front of a research
                  audience. */}
              <form
                hidden={submitted}
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="website"
                action="/contact/?submitted=true"
              >
                <input type="hidden" name="form-name" value="contact" />

                <div className="visually-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">
                      Name <span className="field__req">*</span>
                    </label>
                    <input id="name" name="name" type="text" required />
                  </div>

                  <div className="field">
                    <label htmlFor="org">Organization</label>
                    <input id="org" name="org" type="text" />
                  </div>

                  <div className="field">
                    <label htmlFor="email">
                      Email <span className="field__req">*</span>
                    </label>
                    <input id="email" name="email" type="email" required />
                  </div>

                  <div className="field">
                    <label htmlFor="role">Role</label>
                    <input id="role" name="role" type="text" />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="topic">Topic</label>
                  <select id="topic" name="topic" defaultValue={topics[0]}>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">
                    What would you like to ask?{" "}
                    <span className="field__req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="If it is about a specific behaviour, a link to the file or the make target is the fastest way in."
                  />
                </div>

                <button className="btn btn--primary btn--pill" type="submit">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const Head = () => (
  <SEO
    title="Contact | UMA for Agents"
    description="Questions about the protocol, the lab, or a verdict you think is wrong."
    pathname="/contact/"
  />
);

export default ContactPage;
