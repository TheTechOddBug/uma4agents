// CommonJS, like gatsby-node.js beside it. Gatsby refuses a plugin file that
// mixes `import` with `exports.`, and these two should agree anyway.
const React = require("react");

/**
 * Stamp the theme onto <html> before the page paints.
 *
 * Without this, a reader on the light theme gets a near-black flash on every
 * navigation: the stylesheet's default is dark, and React cannot run early
 * enough to change it. The script is tiny, synchronous and pre-body on
 * purpose — it has to finish before the first paint, which is exactly the case
 * where a blocking inline script is the right tool.
 *
 * It writes an explicit `data-theme` only when the reader has chosen one.
 * Left alone, the attribute is absent and the `prefers-color-scheme` block in
 * theme.generated.css decides — so someone who has never touched the toggle
 * follows their system, and someone who has does not.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("u4a-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {
    /* private mode, or storage disabled — fall through to the media query */
  }
})();
`;

exports.onRenderBody = ({ setPreBodyComponents, setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "en" });
  setPreBodyComponents([
    <script
      key="u4a-theme"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />,
  ]);
};
