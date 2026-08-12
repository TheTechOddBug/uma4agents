import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { repo } from "../data/site";

const expectations = [
  "A reply within 48 hours, from one of us rather than from a sequence.",
  "A real answer, including “we do not know yet” where that is the honest one.",
];

const topics = [
  "A use case I have in mind",
  "A problem I am trying to solve",
  "An idea for where this should go",
  "Implementing against it",
  "Running the lab",
  "Kantara / UMA working group",
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
          <h1 className="page-hero__title">Tell us what you are trying to do.</h1>
          <p className="lede">
            The problem you are stuck on, the case this does not cover yet, the
            thing you would build with it — that is what shapes where this goes
            next. Rough is fine.
          </p>
        </div>
      </section>

      <section className="section section--flush">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-grid__aside">
              <p className="eyebrow eyebrow--plain">What we would like to hear</p>
              <ul className="check-list">
                <li>The use case you have in mind, however rough.</li>
                <li>What is getting in your way today.</li>
                <li>Where you think this should go — including what it is missing.</li>
                <li>What drew you to it in the first place.</li>
              </ul>
              <p className="body-copy">
                For anything about the code itself, an issue or a pull request
                on{" "}
                <a href={repo} target="_blank" rel="noopener noreferrer">
                  the repository
                </a>{" "}
                is usually faster.
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
                    Thanks — that reached us. One of us will reply within 48
                    hours.
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
                    What are you working on?{" "}
                    <span className="field__req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="What you are trying to build, what is in the way, or what you think is missing here. Half-formed is useful — it is easier to answer a real problem than a polished question."
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
    description="Tell us your use case, the problem you are solving, or where you think UMA for Agents should go next."
    pathname="/contact/"
  />
);

export default ContactPage;
