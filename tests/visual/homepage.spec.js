// @ts-check
import { expect, test } from "@playwright/test";

test.describe("Homepage visual tests", () => {
  test("should display the hero section correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".hero h1")).toBeVisible();
    await expect(page.locator(".hero h2")).toBeVisible();
    await expect(page.locator(".hero .cta-button")).toBeVisible();
  });

  test("portfolio images should include WebP sources", async ({ page }) => {
    await page.goto("/");

    const webpSources = page.locator(
      '.portfolio-gallery picture source[type="image/webp"]',
    );
    await expect(webpSources.first()).toBeAttached();
    expect(await webpSources.count()).toBeGreaterThan(0);
  });

  test("should have a working navigation bar", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".navbar")).toBeVisible();
    await expect(page.locator('.nav-links a[href="/#about"]')).toBeVisible();
    await expect(
      page.locator('.nav-links a[href="/#portfolio"]'),
    ).toBeVisible();
    await expect(page.locator('.nav-links a[href="/#contact"]')).toBeVisible();

    // Clicking a nav link should scroll to its section
    await page.locator('.nav-links a[href="/#about"]').click();
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("spotify section should show facade button before interaction", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#spotify-facade .spotify-facade-btn")).toBeVisible();
    await expect(page.locator(".spotify-direct-embed iframe")).toHaveCount(0);
  });

  test("clicking spotify facade should load real iframe", async ({ page }) => {
    await page.goto("/");
    await page.locator("#spotify-facade .spotify-facade-btn").click();
    await expect(page.locator(".spotify-direct-embed iframe")).toBeVisible();
  });
});

test.describe("Contact form", () => {
  test("should submit the form and show success state", async ({ page }) => {
    // Intercept the Netlify Forms POST so we don't need a real backend
    await page.route("/", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 200, body: "" });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");

    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#message").fill("This is a test message.");

    await page.locator("button.submit-button").click();

    await expect(page.locator("button.submit-button")).toContainText(
      "Message Sent!",
    );
  });
});

test.describe("Responsive design tests", () => {
  test("desktop layout should show nav items horizontally", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const navLinks = page.locator(".nav-links li");
    const positions = await navLinks.evaluateAll((elements) => {
      if (elements.length < 2) return [];
      return elements.slice(0, 2).map((el) => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });
    });

    expect(positions.length).toBeGreaterThanOrEqual(2);
    // Second nav item should sit to the right of the first
    expect(positions[1].left).toBeGreaterThan(positions[0].right - 5);
  });

  test("mobile layout should still render the navbar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.locator(".navbar")).toBeVisible();
  });
});
