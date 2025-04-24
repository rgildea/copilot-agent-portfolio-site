/**
 * Test suite for date formatting filter
 */

// Mock Eleventy config to capture the filter function
let dateFilter;

// Mock the Eleventy config object
const mockEleventyConfig = {
  addFilter: (name, filterFn) => {
    if (name === "date") {
      dateFilter = filterFn;
    }
  },
  addPassthroughCopy: jest.fn(),
  addCollection: jest.fn(),
  addLayoutAlias: jest.fn(),
};

// Import and run the Eleventy configuration
require("../../.eleventy.cjs")(mockEleventyConfig);

describe("Date filter tests", () => {
  test('should return the current year when used with "now" and "yyyy" format', () => {
    const result = dateFilter("now", "yyyy");
    const currentYear = new Date().getFullYear();
    expect(result).toBe(currentYear);
  });

  test('should return a valid year when used with a date string and "yyyy" format', () => {
    const result = dateFilter("2025-04-10", "yyyy");
    expect(result).toBe(2025);
  });

  test("should return a formatted date string for other formats", () => {
    const result = dateFilter("2025-04-10", "MM-dd");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle invalid dates gracefully", () => {
    const result = dateFilter("invalid-date", "yyyy");
    const currentYear = new Date().getFullYear();
    expect(result).toBe(currentYear);
  });
});
