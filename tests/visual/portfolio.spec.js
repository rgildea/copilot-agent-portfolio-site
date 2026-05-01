// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Portfolio section tests", () => {
  test("should display portfolio section with items and filter buttons", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator(".portfolio-section")).toBeVisible();
    await expect(page.locator(".portfolio-filter")).toBeVisible();
    await expect(
      page.locator('button.filter-btn[data-filter="all"]'),
    ).toBeVisible();

    const count = await page.locator(".portfolio-item").count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("portfolio items should show info on hover", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#occo")).toBeVisible();
    await page.hover("#occo");

    await expect(page.locator("#occo .portfolio-info h3")).toContainText(
      "OCCO",
    );
  });

  test("portfolio filter buttons should correctly filter items", async ({
    page,
  }) => {
    await page.goto("/");

    const allButton = page.locator('button.filter-btn[data-filter="all"]');
    const clientButton = page.locator(
      'button.filter-btn[data-filter="client"]',
    );
    const personalButton = page.locator(
      'button.filter-btn[data-filter="personal"]',
    );

    await expect(allButton).toBeVisible();
    await expect(clientButton).toBeVisible();
    await expect(personalButton).toBeVisible();

    // Filter: client — only client-project items should be visible
    await clientButton.click();
    await expect(
      page.locator(".portfolio-item.client-project").first(),
    ).toBeVisible();
    const personalCount = await page
      .locator(".portfolio-item.personal-project")
      .count();
    if (personalCount > 0) {
      await expect(
        page.locator(".portfolio-item.personal-project").first(),
      ).toBeHidden();
    }

    // Filter: personal — only personal-project items should be visible
    await personalButton.click();
    await expect(
      page.locator(".portfolio-item.personal-project").first(),
    ).toBeVisible();
    const clientCount = await page
      .locator(".portfolio-item.client-project")
      .count();
    if (clientCount > 0) {
      await expect(
        page.locator(".portfolio-item.client-project").first(),
      ).toBeHidden();
    }

    // Filter: all — all items should be visible again
    await allButton.click();
    await expect(
      page.locator(".portfolio-item.client-project").first(),
    ).toBeVisible();
    await expect(
      page.locator(".portfolio-item.personal-project").first(),
    ).toBeVisible();
  });

  test("portfolio section should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.locator(".portfolio-section")).toBeVisible();

    const firstBounds = await page
      .locator(".portfolio-item")
      .first()
      .boundingBox();
    if (firstBounds) {
      expect(firstBounds.width).toBeLessThanOrEqual(375);
    }
  });
});
