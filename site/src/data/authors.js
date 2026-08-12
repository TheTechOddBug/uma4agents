// Who writes here.
//
// Kept as a module rather than in each post's frontmatter so that a bio, a
// photo or a link is written once and every post picks it up — and so that
// an author archive has something to say beyond a list of titles.

const authors = {
  "Nick Gamb": {
    name: "Nick Gamb",
    slug: "nick-gamb",
    image: "/img/authors/nick-gamb.jpg",
    title: "Field Engineering, Strata Identity",
    bio: "Works on identity and agentic security. Co-author of UMA for Agents with Eve Maler — a working proof of concept carrying User-Managed Access into the agent era, and the lab this site documents.",
    linkedin: "https://www.linkedin.com/in/nickgamb/",
  },
  "Eve Maler": {
    name: "Eve Maler",
    slug: "eve-maler",
    image: null,
    title: "Co-author, User-Managed Access",
    bio: "Co-author of the UMA specifications at Kantara and a long-standing voice for putting the owner of a resource in charge of who may reach it. UMA for Agents is a collaboration exploring how that idea holds up in the agent era.",
    linkedin: "https://www.linkedin.com/in/evemaler/",
  },
};

/**
 * Look an author up by name.
 *
 * An unknown name gets a usable record rather than an exception: a post can
 * be written by someone who has not been added here yet, and the archive
 * should still build. It simply has no bio to show.
 */
export const getAuthor = (name) => {
  if (!name) return null;
  return (
    authors[name] ||
    Object.values(authors).find(
      (a) => a.slug === name.toLowerCase().replace(/\s+/g, "-"),
    ) || {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: null,
      title: "",
      bio: "",
      linkedin: "",
    }
  );
};

export default authors;
