// One definition of what a tag, an author name or a heading looks like in a
// URL.
//
// Shared rather than duplicated because gatsby-node creates the pages and the
// templates write the links: two copies that agree today are two copies that
// can disagree later, and the symptom would be a tag chip linking to a 404.
//
// CommonJS so gatsby-node can require it and the templates can import it.
module.exports = function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

  // An id may legally start with a digit in HTML, but `#1-foo` is not a valid
  // CSS selector — so anything that later reaches querySelector throws rather
  // than returning nothing, which is a surprising way for a numbered heading
  // to take out a page. Prefix it.
  return /^\d/.test(slug) ? `s-${slug}` : slug;
};
