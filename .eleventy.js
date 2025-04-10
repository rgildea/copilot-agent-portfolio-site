const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Markdown library setup
  const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  // Add markdown filter
  eleventyConfig.addFilter("markdown", function (value) {
    return md.render(value);
  });

  // Add date filter
  eleventyConfig.addFilter("date", function (date, format) {
    const jsDate = new Date(date);
    if (format === "yyyy") {
      return jsDate.getFullYear();
    }
    return jsDate.toLocaleDateString();
  });

  // Pass through copy for assets
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("src/js"); // Copy JavaScript files
  eleventyConfig.addPassthroughCopy("src/css"); // Copy CSS files
  eleventyConfig.addPassthroughCopy("src/fonts"); // Copy font files

  // Pass through copy for admin files
  eleventyConfig.addPassthroughCopy({
    "src/admin/config.yml": "admin/config.yml",
  });
  eleventyConfig.addPassthroughCopy({
    "src/admin/config.local.yml": "admin/config.local.yml",
  });

  // Collections
  eleventyConfig.addCollection("services", function (collection) {
    return collection.getFilteredByGlob("src/services/*.md");
  });

  eleventyConfig.addCollection("portfolio", function (collection) {
    return collection.getFilteredByGlob("src/portfolio/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
