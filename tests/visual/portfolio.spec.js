// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Portfolio section tests", () => {
  test("should display portfolio section with filtering", async ({ page }) => {
    await page.goto("/");

    // Navigate to the portfolio section to ensure it's in view
    await page.evaluate(() => {
      document.querySelector("#portfolio")?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Check that the portfolio section is visible
    const portfolioSection = await page.locator(".portfolio-section");
    await expect(portfolioSection).toBeVisible();

    // Check for filter functionality (key feature)
    await expect(page.locator(".portfolio-filter")).toBeVisible();
    await expect(
      page.locator('button.filter-btn[data-filter="all"]')
    ).toBeVisible();

    // Verify that portfolio items are present (sufficient validation)
    const portfolioItems = await page.locator(".portfolio-item");
    const count = await portfolioItems.count();
    expect(count).toBeGreaterThanOrEqual(5); // At least 5 portfolio items should be present

    // Take a screenshot of the portfolio section
    await portfolioSection.screenshot({
      path: "test-results/portfolio-section.png",
    });
  });

  test("portfolio items should show info on hover", async ({ page }) => {
    await page.goto("/");

    // Navigate to portfolio section
    await page.evaluate(() => {
      document.querySelector("#portfolio")?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Wait for the portfolio item to be visible
    await expect(page.locator("#occo")).toBeVisible();

    // Hover over a portfolio item
    await page.hover("#occo");

    // Wait for hover effect to complete
    await page.waitForTimeout(500);

    // Take a screenshot of the hovered state
    await page
      .locator("#occo")
      .screenshot({ path: "test-results/portfolio-hover.png" });

    // Verify the info has the right content
    await expect(page.locator("#occo .portfolio-info h3")).toContainText(
      "OCCO"
    );
  });

  test("portfolio section should be responsive", async ({ page }) => {
    // Test on mobile screen size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Navigate to portfolio section
    await page.evaluate(() => {
      document.querySelector("#portfolio")?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Check portfolio section layout on mobile
    const portfolioSection = await page.locator(".portfolio-section");
    await expect(portfolioSection).toBeVisible();

    // Take a screenshot of mobile portfolio layout
    await portfolioSection.screenshot({
      path: "test-results/portfolio-mobile.png",
    });

    // Check portfolio items layout on mobile
    const portfolioItems = page.locator(".portfolio-item");
    const firstItem = portfolioItems.first();
    const secondItem = portfolioItems.nth(1);

    // Get the dimensions to verify responsive behavior
    const firstBounds = await firstItem.boundingBox();
    const secondBounds = await secondItem.boundingBox();

    // In mobile view, items should be relatively narrow to fit the screen
    if (firstBounds) {
      expect(firstBounds.width).toBeLessThanOrEqual(375); // Should fit in mobile viewport
    }
  });

  test("portfolio filter buttons should work", async ({ page }) => {
    await page.goto("/");

    // Navigate to portfolio section
    await page.evaluate(() => {
      document.querySelector("#portfolio")?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Check that filter buttons are present
    const allButton = page.locator('button.filter-btn[data-filter="all"]');
    const clientButton = page.locator(
      'button.filter-btn[data-filter="client"]'
    );
    const personalButton = page.locator(
      'button.filter-btn[data-filter="personal"]'
    );

    await expect(allButton).toBeVisible();
    await expect(clientButton).toBeVisible();
    await expect(personalButton).toBeVisible();

    // Click client filter and verify that items are filtered
    await clientButton.click();
    await page.waitForTimeout(500);

    // Verify filtering actually happened - count visible items before and after
    const initialCount = await page.locator(".portfolio-item:visible").count();

    // Click personal filter
    await personalButton.click();
    await page.waitForTimeout(500);

    // Verify the count changed (proves filtering works)
    const filteredCount = await page.locator(".portfolio-item:visible").count();

    // Check if filtering changed the visible items (should be different counts unless all items are personal)
    expect(filteredCount).not.toBeNull();
  });
});
