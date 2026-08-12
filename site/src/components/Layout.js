import * as React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../style/custom-style.sass";

// The native system sans stack throughout, so no webfont is fetched.
const Layout = ({ children }) => (
  <>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <Navbar />
    <main id="main">{children}</main>
    <Footer />
  </>
);

export default Layout;
