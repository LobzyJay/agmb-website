// Eleventy config for the AGMB static site.
// Strategy: keep every page file as-is in the project root (`agmb-*.html`).
// Each page declares front matter that flips the active nav link, sets the
// page title, and points the apply CTA at the right route. Nav + footer are
// rendered via `{% include %}` from `_includes/`.
//
// Build: `npx eleventy`             → outputs to `_site/`
// Dev:   `npx eleventy --serve`     → live-reload at http://localhost:8080
//
// All other static assets (images, svgs, the partners/ folder) get copied
// verbatim via passthrough copy.

module.exports = function (eleventyConfig) {
  // Static assets — images now live in assets/images/, logos in partners/
  eleventyConfig.addPassthroughCopy("partners/**/*");
  eleventyConfig.addPassthroughCopy("assets");

  // Preserve flat URLs — every .html input writes to the same .html filename
  // in _site/ (no per-page subfolder). Internal links still resolve.
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (data.page && data.page.inputPath && data.page.inputPath.endsWith(".html")) {
        const slug = data.page.fileSlug;
        // index.html has an empty fileSlug in Eleventy — preserve it as index.html
        return slug ? `${slug}.html` : "index.html";
      }
      return data.permalink;
    },
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    // Treat .html files as Nunjucks templates so {% include %} works
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk"],
  };
};
