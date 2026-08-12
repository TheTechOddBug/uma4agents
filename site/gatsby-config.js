const siteMetadata = require("./site-meta");

module.exports = {
  siteMetadata,
  plugins: [
    {
      resolve: "gatsby-plugin-sass",
      options: {
        sassOptions: {
          indentedSyntax: true,
        },
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/pages`,
        name: "pages",
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-copy-linked-files",
            options: { destinationDir: "static" },
          },
          "gatsby-remark-prismjs",
        ],
      },
    },
    // No gatsby-plugin-netlify here: @netlify/plugin-gatsby installs
    // gatsby-adapter-netlify, which supersedes it and disables it anyway.
  ],
};
