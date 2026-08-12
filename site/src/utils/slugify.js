// One definition of what a tag or an author name looks like in a URL.
//
// Shared rather than duplicated because gatsby-node creates the pages and the
// templates write the links: two copies that agree today are two copies that
// can disagree later, and the symptom would be a tag chip linking to a 404.
//
// CommonJS so gatsby-node can require it and the templates can import it.
module.exports = function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
