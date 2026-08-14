// Shared site chrome for u4a.ai.

export const repo = "https://github.com/nickgamb/uma4agents";

export const people = [
  { name: "Nick Gamb", linkedin: "https://www.linkedin.com/in/nickgamb/" },
  { name: "Eve Maler", linkedin: "https://www.linkedin.com/in/evemaler/" },
];

export const navLinks = [
  { label: "Blog", to: "/blog/" },
  { label: "Contact", to: "/contact/" },
];

// The site's call to action. Two doors rather than one: the lab can now be
// run in a browser without installing anything, and that is a stronger first
// step than reading source — but the source is what makes the claim checkable,
// so it stays one click away rather than behind a scroll.
export const ctaLabel = "Try the lab";

export const codespace =
  "https://codespaces.new/nickgamb/uma4agents?devcontainer_path=.devcontainer%2Fdevcontainer.json";

export const ctaActions = [
  {
    label: "Run it in Codespaces",
    hint: "The Kubernetes lab, in your browser",
    href: codespace,
  },
  {
    label: "View on GitHub",
    hint: "Clone it, read it, check the claims",
    href: repo,
  },
];

export const tagline = "She isn’t online. Her policy is.";

export const footerBlurb =
  "A working proof-of-concept carrying User-Managed Access into the agent era: the owner sets policy once, and other people’s agents negotiate against it while she is offline.";
