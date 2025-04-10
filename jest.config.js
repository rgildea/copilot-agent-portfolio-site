module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  moduleFileExtensions: ["js", "json", "jsx", "node"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/admin/**",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "./coverage",
  setupFilesAfterEnv: ["./jest.setup.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.11ty/",
    "/dist/",
    "/tests/visual/", // Exclude visual tests from Jest
  ],
};
