import React from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

const NotFoundPage = () => (
  <Layout>
    <section className="notfound">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="page-hero__title">No grant for that one.</h1>
        <p className="lede">
          There is nothing at this address. Which is, at least, the correct
          default.
        </p>
        <div className="btn-row">
          <Link className="btn btn--primary" to="/">
            Back to the story
          </Link>
          <Link className="btn btn--outline" to="/blog/">
            Read the notes
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export const Head = () => <SEO title="Not found | UMA for Agents" pathname="/404/" />;

export default NotFoundPage;
