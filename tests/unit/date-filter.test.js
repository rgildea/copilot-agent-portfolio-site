/**
 * @jest-environment jsdom
 */

const eleventyConfig = require("../../.eleventy.js");

describe("Date filter tests", () => {
  // Mock Eleventy config
  const mockConfig = {
    addFilter: jest.fn(),
    addPassthroughCopy: jest.fn(),
    addCollection: jest.fn(),
  };

  // Call the module function and capture the filter function
  eleventyConfig(mockConfig);

  // Extract the date filter function from the mock
  const dateFilter = mockConfig.addFilter.mock.calls.find(
    (call) => call[0] === "date"
  )[1];

  test('should return the current year when used with "now" and "yyyy" format', () => {
    const result = dateFilter("now", "yyyy");
    const currentYear = new Date().getFullYear();

    expect(result).toBe(currentYear);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(2000); // Sanity check
    expect(result).toBeLessThan(3000); // Sanity check
  });

  test('should return a valid year when used with a date string and "yyyy" format', () => {
    const result = dateFilter("2025-04-10", "yyyy");

    expect(result).toBe(2025);
    expect(typeof result).toBe("number");
  });

  test('should return a localized date string when format is not "yyyy"', () => {
    const result = dateFilter("2025-04-10", "MM-dd");

    expect(typeof result).toBe("string");
    // This test is somewhat fuzzy since toLocaleDateString output varies by system locale
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle invalid date inputs gracefully", () => {
    const result = dateFilter("invalid-date", "yyyy");

    // Even for invalid dates, we should get a number, not NaN
    expect(typeof result).toBe("number");
    // Invalid dates typically resolve to 1970 or earlier when parsed as Unix timestamps
    expect(!isNaN(result)).toBe(true);
  });
});
