// @ts-check
import { expect, test } from "@playwright/test";

// Stall all audio requests for the duration of a test so we can assert
// loading states without depending on network timing.
async function stallAudio(page) {
  await page.route("**/audio.mixdownapp.com/**", async () => {
    await new Promise((r) => setTimeout(r, 30_000));
  });
}

test.describe("Listen section", () => {
  test("should render the listen section with a nav link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".listen-section")).toBeVisible();
    await expect(page.locator('.nav-links a[href="/#listen"]')).toBeVisible();
  });

  test("should render a description below the section title", async ({ page }) => {
    await page.goto("/");
    const desc = page.locator(".listen-section .section-desc");
    await expect(desc).toBeVisible();
    await expect(desc).not.toBeEmpty();
  });

  test("should render an artist card for each portfolio item with audio", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = page.locator(".listen-card");
    await expect(cards.first()).toBeVisible();
    await expect(
      cards.first().locator(".listen-card__artist-name"),
    ).toBeVisible();
    await expect(cards.first().locator(".listen-card__tabs")).toBeVisible();
    await expect(cards.first().locator(".listen-card__player")).toBeVisible();
  });

  test("should show at least one tab per card", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator(".listen-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      expect(await cards.nth(i).locator(".listen-tab").count()).toBeGreaterThan(0);
    }
  });

  test("clicking a tab should keep it active", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    const tabs = firstCard.locator(".listen-tab");
    await tabs.first().click();
    await expect(tabs.first()).toHaveClass(/active/);
  });

  test("should show rough/final toggle with rough active by default", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.locator(".listen-card").first().locator(".mix-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle.locator('[data-mix="rough"]')).toHaveClass(/active/);
    await expect(toggle.locator('[data-mix="final"]')).not.toHaveClass(/active/);
  });

  test("clicking final toggle should activate final and deactivate rough", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.locator(".listen-card").first().locator(".mix-toggle");
    await toggle.locator('[data-mix="final"]').click();
    await expect(toggle.locator('[data-mix="final"]')).toHaveClass(/active/);
    await expect(toggle.locator('[data-mix="rough"]')).not.toHaveClass(/active/);
  });

  test("should show waveform container and play button", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    await expect(firstCard.locator(".listen-waveform")).toBeVisible();
    await expect(firstCard.locator(".listen-play-btn")).toBeVisible();
  });

  test("listen section should be visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.locator(".listen-section")).toBeVisible();
    const firstCard = page.locator(".listen-card").first();
    await expect(firstCard).toBeVisible();
    const bounds = await firstCard.boundingBox();
    if (bounds) expect(bounds.width).toBeLessThanOrEqual(375);
  });
});

test.describe("Audio player button behavior", () => {
  test("play button starts with play icon and no loading state", async ({ page }) => {
    await page.goto("/");
    const playBtn = page.locator(".listen-card").first().locator(".listen-play-btn");
    await expect(playBtn).toBeVisible();
    await expect(playBtn).not.toHaveClass(/loading/);
    const href = await playBtn.locator("use").getAttribute("href");
    expect(href).toContain("icon-play");
  });

  test("clicking play before audio is ready shows the loading spinner", async ({ page }) => {
    await stallAudio(page);
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    await firstCard.locator(".listen-play-btn").click();
    await expect(firstCard.locator(".listen-play-btn")).toHaveClass(/loading/);
  });

  test("switching tabs resets the play button to stopped state", async ({ page }) => {
    await stallAudio(page);
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    const tabs = firstCard.locator(".listen-tab");
    if (await tabs.count() < 2) return;

    await firstCard.locator(".listen-play-btn").click();
    await expect(firstCard.locator(".listen-play-btn")).toHaveClass(/loading/);

    await tabs.nth(1).click();

    const playBtn = firstCard.locator(".listen-play-btn");
    await expect(playBtn).not.toHaveClass(/loading/);
    const href = await playBtn.locator("use").getAttribute("href");
    expect(href).toContain("icon-play");
  });

  test("switching tabs does not autoplay the new track", async ({ page }) => {
    await stallAudio(page);
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    const tabs = firstCard.locator(".listen-tab");
    if (await tabs.count() < 2) return;

    await tabs.nth(1).click();

    const playBtn = firstCard.locator(".listen-play-btn");
    await expect(playBtn).not.toHaveClass(/loading/);
    const href = await playBtn.locator("use").getAttribute("href");
    expect(href).toContain("icon-play");
  });
});
