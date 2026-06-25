# Lighthouse Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Lighthouse Performance score from 50 to 75-85 by eliminating CLS from async CSS, deferring the Spotify iframe, compressing hero images, and fixing accessibility issues.

**Architecture:** Five tasks targeting root causes from the 2026-06-24 Lighthouse report. Tasks 1, 2, and 3 touch independent files and can run in parallel with git worktrees. Tasks 4 and 5 depend on the same files as Tasks 1 and 2 respectively and must follow them.

**Tech Stack:** Astro (static output), vanilla JS, vanilla CSS, Playwright (visual tests), cwebp (image compression, at `/opt/homebrew/bin/cwebp`)

## Global Constraints

- Vanilla JS only — no TypeScript, no frameworks
- Never change core stack (Astro, vanilla CSS, vanilla JS)
- Tests require a production build — always `npm run build` before running tests
- Quick test command: `npm run test:visual` (Chromium only); full: `npm run test:visual:full`
- Work in a new branch unless instructed otherwise

---

### Task 1: Synchronous CSS Loading (Fix CLS)

**Root cause:** `Base.astro` loads `main.css`, `synthwave.css`, and Google Fonts with the print-media async trick (`media="print" onload="this.media='all'"`). This causes the page to first render with browser defaults, then violently reflow when styles apply — recorded as CLS 1.171. Switching to synchronous loading eliminates the reflow.

**Files:**
- Modify: `src/layouts/Base.astro:60-70`

**Interfaces:**
- Produces: Synchronously loaded CSS — no noscript fallback needed

- [ ] **Step 1: Create a branch**

```bash
git checkout -b fix/synchronous-css
```

- [ ] **Step 2: Write a failing Playwright test for CLS-free render**

Add to `tests/visual/homepage.spec.js` before the last closing `});`:

```javascript
test.describe("CSS loading", () => {
  test("page should render with styles applied on first paint", async ({ page }) => {
    // If CSS loads async (print-media trick), the navbar background is missing on first paint.
    // Synchronous CSS means the navbar is styled before JS runs.
    let stylesApplied = false;
    page.on("domcontentloaded", () => { stylesApplied = true; });
    await page.goto("/");
    // Navbar should have a background color (non-transparent) — only true if CSS loaded
    const bg = await page.locator(".navbar").evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    // rgba(0,0,0,0) is transparent (no CSS); any real value means CSS loaded
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });
});
```

- [ ] **Step 3: Run the build and verify the test currently passes (or note baseline)**

```bash
npm run build && npm run test:visual -- --grep "CSS loading"
```

Expected: The test may pass or fail depending on timing — note the result. Proceed regardless.

- [ ] **Step 4: Replace async CSS links with synchronous links in `src/layouts/Base.astro`**

Change lines 60–70. The full replacement:

**Before (lines 60–70):**
```html
    <link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'" />
    <link rel="stylesheet" href="/css/synthwave.css" media="print" onload="this.media='all'" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />

    <noscript>
      <link rel="stylesheet" href="/css/main.css" />
      <link rel="stylesheet" href="/css/synthwave.css" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
    </noscript>
```

**After:**
```html
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="stylesheet" href="/css/synthwave.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 5: Build and run tests**

```bash
npm run build && npm run test:visual
```

Expected: All tests pass. The "CSS loading" test should pass.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro tests/visual/homepage.spec.js
git commit -m "fix: load CSS synchronously to eliminate CLS reflow"
```

---

### Task 2: Defer Spotify Iframe

**Root cause:** The Spotify `<iframe>` loads ~900 KiB of JS and fonts on initial page load, blocking TTI and triggering unused JS/CSS audits. Replacing it with a static facade that loads the real iframe on user click removes it from the critical path entirely.

**Files:**
- Modify: `src/pages/index.astro:44-56` (replace iframe with facade)
- Modify: `public/css/main.css` (update `.spotify-direct-embed` height rules for facade)
- Modify: `public/js/script.js` (add click handler)
- Modify: `tests/visual/homepage.spec.js` (update Spotify test)

**Interfaces:**
- Produces: `#spotify-facade` div with `.spotify-facade-btn` button; clicking it injects the real iframe

- [ ] **Step 1: Create a branch (if not continuing from Task 1)**

```bash
git checkout -b fix/defer-spotify
```

- [ ] **Step 2: Write a failing test for the Spotify facade**

Add to `tests/visual/homepage.spec.js` inside the `"Homepage visual tests"` describe block:

```javascript
  test("spotify section should show facade button before interaction", async ({ page }) => {
    await page.goto("/");
    // Facade button must exist; real iframe must not yet be present
    await expect(page.locator("#spotify-facade .spotify-facade-btn")).toBeVisible();
    await expect(page.locator(".spotify-direct-embed iframe")).toHaveCount(0);
  });

  test("clicking spotify facade should load real iframe", async ({ page }) => {
    await page.goto("/");
    await page.locator("#spotify-facade .spotify-facade-btn").click();
    await expect(page.locator(".spotify-direct-embed iframe")).toBeVisible();
  });
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
npm run build && npm run test:visual -- --grep "spotify"
```

Expected: FAIL — "spotify facade button" not found (current markup has an eager iframe).

- [ ] **Step 4: Replace the eager iframe in `src/pages/index.astro` with a facade**

**Before (lines 44–56):**
```html
      <div class="spotify-direct-embed">
        <iframe
          style="border-radius: 12px"
          src="https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0"
          title="Featured playlist by Ryan Gildea"
          width="100%"
          class="spotify-iframe"
          frameborder="0"
          allowfullscreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="eager"
        ></iframe>
      </div>
```

**After:**
```html
      <div class="spotify-direct-embed" id="spotify-facade">
        <button class="spotify-facade-btn" aria-label="Load Spotify playlist">
          Load Playlist
        </button>
      </div>
```

- [ ] **Step 5: Update `.spotify-direct-embed` height rules in `public/css/main.css`**

The facade button must occupy the same space as the former iframe to prevent CLS when it injects. Find and update the two existing rules (around lines 484–501):

**Before:**
```css
.spotify-direct-embed {
  margin-top: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  height: auto;
  min-height: 152px;
  position: relative;
}

.spotify-direct-embed iframe {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  height: 60vh;
  max-height: 800px;
  width: 100%;
}
```

**After:**
```css
.spotify-direct-embed {
  margin-top: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  height: 60vh;
  min-height: 380px;
  max-height: 800px;
  position: relative;
}

.spotify-direct-embed iframe {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  height: 100%;
  width: 100%;
}

.spotify-facade-btn {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  color: var(--light-text);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.spotify-facade-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}
```

**Note:** Also check for responsive overrides of `.spotify-direct-embed` height in `main.css` around lines 449, 1101, 1170, 1212, 1245. For each `min-height` or `height` override on `.spotify-direct-embed`, ensure the facade container retains a fixed height (not `auto`). Leave `.spotify-direct-embed iframe` height overrides in place — they apply to the injected iframe.

- [ ] **Step 6: Add the click handler in `public/js/script.js`**

Append to the end of `public/js/script.js` (after line 300):

```javascript
(function () {
  var facade = document.getElementById("spotify-facade");
  if (!facade) return;
  facade.addEventListener("click", function () {
    var iframe = document.createElement("iframe");
    iframe.src =
      "https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0";
    iframe.title = "Featured playlist by Ryan Gildea";
    iframe.style.cssText = "border-radius:8px;";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute(
      "allow",
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    );
    facade.innerHTML = "";
    facade.appendChild(iframe);
  });
})();
```

- [ ] **Step 7: Build and run tests**

```bash
npm run build && npm run test:visual
```

Expected: All tests pass, including the two new Spotify facade tests.

- [ ] **Step 8: Commit**

```bash
git add src/pages/index.astro public/css/main.css public/js/script.js tests/visual/homepage.spec.js
git commit -m "feat: defer Spotify iframe behind click facade to reduce initial payload"
```

---

### Task 3: Compress Hero Background Images

**Root cause:** `hero-background-2.webp` (332 KiB) and `hero-background-3.webp` (608 KiB) contribute ~940 KiB to total page payload. Both sit behind a `rgba(11, 11, 41, 0.6)` dark overlay, so quality loss at q=25 is imperceptible. `hero-background.webp` (44 KiB) is already well-optimized — leave it alone.

**Files:**
- Modify: `public/images/hero-background-2.webp` (in-place recompress)
- Modify: `public/images/hero-background-3.webp` (in-place recompress)

**Note:** Also recompress the `.jpg` fallbacks (`hero-background-2.jpg`, `hero-background-3.jpg`) if they exist, to keep the no-webp path fast too.

**Interfaces:**
- Produces: Same filenames, same CSS references, reduced file sizes

- [ ] **Step 1: Create a branch (if not continuing from earlier tasks)**

```bash
git checkout -b fix/compress-hero-images
```

- [ ] **Step 2: Record current file sizes**

```bash
du -h /Users/ryan/projects/copilot-agent-portfolio-site/public/images/hero-background-2.webp \
       /Users/ryan/projects/copilot-agent-portfolio-site/public/images/hero-background-3.webp
```

Record the output for comparison after compression.

- [ ] **Step 3: Compress hero-background-2.webp**

```bash
cd /Users/ryan/projects/copilot-agent-portfolio-site && \
cwebp -q 25 public/images/hero-background-2.webp -o public/images/hero-background-2.webp
```

Expected: Output ends with `Saved file ...` and reports compressed size.

- [ ] **Step 4: Compress hero-background-3.webp**

```bash
cd /Users/ryan/projects/copilot-agent-portfolio-site && \
cwebp -q 25 public/images/hero-background-3.webp -o public/images/hero-background-3.webp
```

- [ ] **Step 5: Compress .jpg fallbacks if they exist**

```bash
ls public/images/hero-background-2.jpg public/images/hero-background-3.jpg 2>/dev/null && \
  convert public/images/hero-background-2.jpg -quality 25 public/images/hero-background-2.jpg && \
  convert public/images/hero-background-3.jpg -quality 25 public/images/hero-background-3.jpg || \
  echo "No jpg fallbacks found — skipping"
```

- [ ] **Step 6: Verify file sizes reduced**

```bash
du -h public/images/hero-background-2.webp public/images/hero-background-3.webp
```

Expected: Combined size well under 200 KiB (down from ~940 KiB).

- [ ] **Step 7: Build and run visual tests to confirm no visible regression**

```bash
npm run build && npm run test:visual
```

Expected: All tests pass. Visually inspect the hero — the dark overlay should make quality difference imperceptible.

- [ ] **Step 8: Commit**

```bash
git add public/images/hero-background-2.webp public/images/hero-background-3.webp
git commit -m "perf: recompress hero background images to q=25 (-800 KiB payload)"
```

---

### Task 4: Fix Preloader Trigger

**Context:** The preloader currently waits for `window.load` (all assets including external embeds) before hiding. After Task 2 defers the Spotify iframe, `window.load` fires sooner — but switching to `DOMContentLoaded` is still cleaner and reduces the perceived wait further.

**Files:**
- Modify: `src/layouts/Base.astro:117-123`

**Interfaces:**
- Depends on: Task 1 (same file — merge or apply after Task 1 is in main)

- [ ] **Step 1: Ensure you're on a branch that includes Task 1's changes**

Either continue on the `fix/synchronous-css` branch or check out a new branch from main after Task 1 is merged:

```bash
git checkout -b fix/preloader-trigger
```

- [ ] **Step 2: Write a test for fast preloader dismissal**

Add to `tests/visual/homepage.spec.js` inside `"Homepage visual tests"`:

```javascript
  test("preloader should be hidden before external resources finish loading", async ({ page }) => {
    // Block all external network requests to simulate slow third-party resources
    await page.route("**/*.spotify.com/**", (route) => route.abort());
    await page.route("**/*.bandcamp.com/**", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait 500ms (DOMContentLoaded delay) then check preloader is gone
    await page.waitForTimeout(500);
    const preloader = page.locator(".preloader");
    await expect(preloader).toHaveClass(/loaded/);
  });
```

- [ ] **Step 3: Run test to confirm it fails against current code**

```bash
npm run build && npm run test:visual -- --grep "preloader"
```

Expected: FAIL — preloader is still visible because `window.load` hasn't fired (Spotify/Bandcamp blocked).

- [ ] **Step 4: Update preloader trigger in `src/layouts/Base.astro`**

**Before (lines 117–123):**
```javascript
    <script is:inline>
      window.addEventListener("load", function () {
        setTimeout(function () {
          document.querySelector(".preloader").classList.add("loaded");
        }, 500);
      });
    </script>
```

**After:**
```javascript
    <script is:inline>
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
          document.querySelector(".preloader").classList.add("loaded");
        }, 200);
      });
    </script>
```

- [ ] **Step 5: Build and run tests**

```bash
npm run build && npm run test:visual
```

Expected: All tests pass, including the new preloader test.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro tests/visual/homepage.spec.js
git commit -m "fix: dismiss preloader on DOMContentLoaded instead of window.load"
```

---

### Task 5: Fix Accessibility Issues

**Two independent changes:**
1. Remove `text-shadow` from `.navbar.top-position .nav-links a` — white text on `rgba(6,4,29,0.75)` already has >10:1 contrast; the cyan glow fails Lighthouse contrast checks.
2. Add `title` attribute to the Bandcamp follow iframe — Lighthouse flags iframes without accessible titles.

**Files:**
- Modify: `public/css/main.css:178-183`
- Modify: `src/pages/index.astro:289-293`

**Interfaces:**
- `src/pages/index.astro` depends on Task 2 (same file — apply after Task 2 is merged)

- [ ] **Step 1: Create a branch (if not continuing from Task 2)**

```bash
git checkout -b fix/accessibility-issues
```

- [ ] **Step 2: Write a test for Bandcamp iframe title**

Add to `tests/visual/homepage.spec.js` inside `"Homepage visual tests"`:

```javascript
  test("bandcamp follow iframe should have an accessible title", async ({ page }) => {
    await page.goto("/");
    const iframe = page.locator(".bandcamp-follow iframe");
    await expect(iframe).toHaveAttribute("title", /.+/);
  });
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
npm run build && npm run test:visual -- --grep "bandcamp"
```

Expected: FAIL — the iframe has no `title` attribute currently.

- [ ] **Step 4: Remove navbar text-shadow in `public/css/main.css`**

**Before (lines 178–183):**
```css
.navbar.top-position .nav-links a {
  color: var(--light-text);
  cursor: pointer !important;
  /* Add a subtle highlight to make it obvious the links are clickable */
  text-shadow: 0 0 2px var(--accent-color);
}
```

**After:**
```css
.navbar.top-position .nav-links a {
  color: var(--light-text);
  cursor: pointer !important;
}
```

- [ ] **Step 5: Add title to Bandcamp iframe in `src/pages/index.astro`**

**Before (lines 289–294):**
```html
            <div class="bandcamp-follow">
              <iframe
              scrolling="no"
              style="border: 0;width: 100%;height: 33px;"
              src="https://bandcamp.com/band_follow_button_classic/1087522331"
              ></iframe>
            </div>
```

**After:**
```html
            <div class="bandcamp-follow">
              <iframe
              title="Follow Ryan Gildea on Bandcamp"
              scrolling="no"
              style="border: 0;width: 100%;height: 33px;"
              src="https://bandcamp.com/band_follow_button_classic/1087522331"
              ></iframe>
            </div>
```

- [ ] **Step 6: Build and run tests**

```bash
npm run build && npm run test:visual
```

Expected: All tests pass, including the new Bandcamp iframe title test.

- [ ] **Step 7: Commit**

```bash
git add public/css/main.css src/pages/index.astro tests/visual/homepage.spec.js
git commit -m "fix: remove failing navbar text-shadow and add Bandcamp iframe title"
```

---

## Final Verification

After all tasks are merged to main:

- [ ] **Run full test suite**

```bash
npm run build && npm run test:visual:full
```

Expected: All tests pass across all browsers.

- [ ] **Run a Lighthouse audit against the production build**

```bash
npm run serve
# In another terminal or browser: open http://localhost:8080 and run Lighthouse
```

Expected score targets:

| Category       | Before | Target |
|----------------|--------|--------|
| Performance    | 50     | 75–85  |
| Accessibility  | 96     | 97–98  |
| Best Practices | 83     | 83     |
| SEO            | 100    | 100    |

---

## Parallelization Note

With git worktrees (`superpowers:using-git-worktrees`), Tasks 1, 2, and 3 touch independent files and can run simultaneously:
- Task 1: `src/layouts/Base.astro` only
- Task 2: `src/pages/index.astro`, `public/css/main.css`, `public/js/script.js`
- Task 3: `public/images/` only

Tasks 4 and 5 share files with Tasks 1 and 2 respectively — run them after those branches merge.
