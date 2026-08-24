import React from "react";
import siteMetadata from "../../site-meta";
import { role, lightRole } from "../style/theme";

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
  // What a link preview shows, when that should differ from the <title>.
  // Search wants the words people type; a card wants the words people
  // remember. Defaults to `title`, so only pages that care set it.
  socialTitle,
  description,
  pathname,
  image,
  article,
  author,
  datePublished,
  dateModified,
  tags,
  docPage,
  breadcrumb,
  children,
}) => {
  const imagePath = raster(image) || siteMetadata.image;
  const seo = {
    title: title || siteMetadata.title,
    social: socialTitle || title || siteMetadata.title,
    description: description || siteMetadata.description,
    url: `${siteMetadata.siteUrl}${pathname || ""}`,
    image: `${siteMetadata.siteUrl}${imagePath}`,
  };

  // Structured data. This is the part search engines and agents read to know
  // what the page *is* rather than guessing from the prose.
  const ld = docPage
    ? {
        // Documentation is reference material, not a dated post. TechArticle
        // is what search engines use to treat it that way.
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: title ? title.replace(/ \| UMA for Agents docs$/, "") : seo.title,
        description: seo.description,
        url: seo.url,
        isAccessibleForFree: true,
        license: "https://www.apache.org/licenses/LICENSE-2.0",
        inLanguage: "en",
        articleSection: breadcrumb ? breadcrumb.section : undefined,
        publisher: {
          "@type": "Organization",
          name: siteMetadata.title,
          url: siteMetadata.siteUrl,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": seo.url },
      }
    : article
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
      {/* The plain author tag, separate from `article:author` below. This is
          the one LinkedIn's Post Inspector reads — without it, it reports the
          author as not found even though the Open Graph property is present. */}
      <meta name="author" content={author ? author.name : "UMA for Agents"} />
      {/* Two, so the browser chrome matches the theme the reader lands on.
          ThemeToggle rewrites both when they choose explicitly, which forces
          the colour regardless of what the system prefers. */}
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content={role.bg}
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content={lightRole.bg}
      />
      <link rel="canonical" href={seo.url} />
      {/* Crawlers are welcome, including the ones reading on behalf of an
          agent — this site exists to be found and quoted. */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1"
      />

      <meta property="og:title" content={seo.social} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      {/* `property=` alone, which is the form LinkedIn documents.
          A `name="image"` attribute was tried here alongside it, following the
          Post Inspector's generic suggestion text, and LinkedIn went back to
          scraping the page body for a thumbnail — parsers that bucket meta
          tags by `name` when it is present stop seeing the og: property at
          all. The suggestion is boilerplate; the spec is the spec. */}
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:type" content={mimeFor(imagePath)} />
      <meta property="og:image:alt" content={seo.social} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content="UMA for Agents" />
      <meta property="og:locale" content="en_US" />

      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {/* Open Graph wants a profile URL here, not a name — the human-readable
          form is the `author` tag above. */}
      {article && author && (
        <meta
          property="article:author"
          content={author.linkedin || author.name}
        />
      )}
      {article &&
        (tags || []).map((t) => (
          <meta property="article:tag" content={t} key={t} />
        ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.social} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content={seo.title} />

      {/* Two icons on purpose. Browsers that understand SVG take the second
          and get a mark that stays sharp at any size; Google's search results
          take the first. Google looks for a raster it can resize to 48px and
          will not use an SVG-only declaration, which is why the result row
          showed a generic globe while the site had a perfectly good icon.
          The .ico carries 16/32/48/64/128/256 so both needs are met from one
          file. Order matters: the SVG comes last so it wins where supported. */}
      <link rel="icon" href="/favicon.ico" sizes="48x48" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <script type="application/ld+json">
        {JSON.stringify(ld, (_k, v) => (v === undefined ? undefined : v))}
      </script>
      {/* A second graph rather than a nested property, which is what Google's
          own examples do — it lets the crawler read the trail without having
          to understand the article type wrapping it. This is what turns a
          result's URL line into Docs › Overview › The four beats. */}
      {breadcrumb && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { name: "Docs", item: `${siteMetadata.siteUrl}/docs/overview/` },
              { name: breadcrumb.section, item: `${siteMetadata.siteUrl}${breadcrumb.sectionUrl}` },
              { name: breadcrumb.group },
              { name: breadcrumb.title, item: seo.url },
            ].map((entry, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: entry.name,
              ...(entry.item ? { item: entry.item } : {}),
            })),
          })}
        </script>
      )}
      {children}
    </>
  );
};

export default SEO;
