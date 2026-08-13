import React from "react";
import siteMetadata from "../../site-meta";
import { role } from "../style/theme";

/**
 * Meta tags for Gatsby's Head API.
 *
 * Must be rendered from a page or template's `Head` export, not from the page
 * body — Gatsby hoists whatever `Head` returns into <head>.
 */

/**
 * Link previews need a raster.
 *
 * LinkedIn, Slack and X will not render an SVG `og:image`. When the image
 * fails they fall back to scraping whatever else is on the page, which is how
 * a post's thumbnail ended up being the author's avatar. Every SVG used as a
 * social image therefore has a committed PNG twin beside it — see
 * `npm run social`.
 */
const raster = (p) => (p && p.endsWith(".svg") ? p.replace(/\.svg$/, ".png") : p);

const mimeFor = (p) =>
  p.endsWith(".jpg") || p.endsWith(".jpeg") ? "image/jpeg" : "image/png";

const SEO = ({
  title,
  description,
  pathname,
  image,
  article,
  author,
  datePublished,
  dateModified,
  tags,
  children,
}) => {
  const imagePath = raster(image) || siteMetadata.image;
  const seo = {
    title: title || siteMetadata.title,
    description: description || siteMetadata.description,
    url: `${siteMetadata.siteUrl}${pathname || ""}`,
    image: `${siteMetadata.siteUrl}${imagePath}`,
  };

  // Structured data. This is the part search engines and agents read to know
  // what the page *is* rather than guessing from the prose.
  const ld = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title ? title.replace(/ \| UMA for Agents$/, "") : seo.title,
        description: seo.description,
        image: [seo.image],
        datePublished: datePublished || undefined,
        dateModified: dateModified || datePublished || undefined,
        author: author
          ? {
              "@type": "Person",
              name: author.name,
              ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
              ...(author.title ? { jobTitle: author.title } : {}),
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: siteMetadata.title,
          url: siteMetadata.siteUrl,
          logo: {
            "@type": "ImageObject",
            url: `${siteMetadata.siteUrl}/brand/u4a-mark.svg`,
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": seo.url },
        keywords: (tags && tags.length ? tags : siteMetadata.keywords).join(", "),
        isAccessibleForFree: true,
        license: "https://www.apache.org/licenses/LICENSE-2.0",
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteMetadata.title,
        alternateName: "U4A",
        url: siteMetadata.siteUrl,
        description: siteMetadata.description,
        publisher: {
          "@type": "Organization",
          name: siteMetadata.title,
          url: siteMetadata.siteUrl,
          logo: {
            "@type": "ImageObject",
            url: `${siteMetadata.siteUrl}/brand/u4a-mark.svg`,
          },
        },
      };

  return (
    <>
      <html lang="en" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={(siteMetadata.keywords || []).join(", ")} />
      <meta name="theme-color" content={role.bg} />
      <link rel="canonical" href={seo.url} />
      {/* Crawlers are welcome, including the ones reading on behalf of an
          agent — this site exists to be found and quoted. */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1"
      />

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:type" content={mimeFor(imagePath)} />
      <meta property="og:image:alt" content={seo.title} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content="UMA for Agents" />
      <meta property="og:locale" content="en_US" />

      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {article && author && (
        <meta property="article:author" content={author.name} />
      )}
      {article &&
        (tags || []).map((t) => (
          <meta property="article:tag" content={t} key={t} />
        ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content={seo.title} />

      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <script type="application/ld+json">
        {JSON.stringify(ld, (_k, v) => (v === undefined ? undefined : v))}
      </script>
      {children}
    </>
  );
};

export default SEO;
