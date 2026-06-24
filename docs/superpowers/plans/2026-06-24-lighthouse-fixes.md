# Lighthouse Performance & Quality Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address the highest-impact issues flagged in the 2026-06-24 Lighthouse report to improve performance score from 46 and eliminate critical quality regressions.

**Architecture:** Fixes are grouped into three tiers by expected impact. High-priority items target the worst-scoring metrics (CLS 0.885, TTI 18.4 s, Speed Index 9.2 s). Medium items address SEO, accessibility, and image encoding. Low items are nice-to-haves with minimal user impact.

**Tech Stack:** Astro (static build), vanilla CSS/JS, Playwright visual tests, Netlify deployment.

## Global Constraints

- Stack is Astro with static output — no SSR, no TypeScript, vanilla CSS/JS only.
- All changes must pass `npm run build` and `npm run test:visual` before commit.
- Do not add new dependencies without user approval.
- Images live in `public/images/portfolio/`.
- The build produces `dist/` — tests run against `npm run serve` (which builds then serves on port 8080).

---

## Scores at Time of Report

| Category       | Score |
|----------------|-------|
| Performance    | 46    |
| Accessibility  | 97    |
| Best Practices | 83    |
| SEO            | 91    |
| PWA            | 30    |

---

## HIGH PRIORITY

Issues that directly cause the worst metric scores (CLS, TTI, Speed Index).

---

### Task 1: Stop eager-loading audio — defer WAV fetches until user interaction

**Why this matters:** The two WAV files (66,950 KiB and 61,511 KiB) are fetched on page load, which is the primary cause of Time to Interactive at 18.4 s and the "enormous network payloads" audit failure.

**Files:**
- Modify: `public/js/script.js` — wherever WaveSurfer instances are created/loaded
- Modify: `src/pages/index.astro` — if audio URLs are hardcoded in markup

**Interfaces:**
- Consumes: existing WaveSurfer initialization code in `script.js`
- Produces: audio loads only after user clicks play or the mix-toggle button

- [ ] **Step 1: Locate the WaveSurfer load calls**

```bash
grep -n "load\|wavesurfer\|WaveSurfer" public/js/script.js | head -40
```

Expected: lines showing `wavesurfer.load(url)` or similar.

- [ ] **Step 2: Audit current load timing**

Open `http://localhost:4321` in browser DevTools → Network tab, filter by Media. Confirm both WAV files start downloading on page load.

- [ ] **Step 3: Refactor to lazy-load**

Wrap the `.load()` calls so they only fire when the user first interacts with the player. Pattern:

```js
let loaded = false;
function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  wavesurferA.load(urlA);
  wavesurferB.load(urlB);
}
playBtn.addEventListener('click', ensureLoaded);
mixToggle.addEventListener('click', ensureLoaded);
```

Adjust variable names to match what exists in `script.js`. Do not change any other behavior.

- [ ] **Step 4: Build and verify in browser**

```bash
npm run build && npm run serve
```

Open the served site. Confirm in Network tab that WAV files do NOT download until the play button is clicked.

- [ ] **Step 5: Run tests**

```bash
npm run test:visual
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add public/js/script.js
git commit -m "perf: defer audio loading until first user interaction"
```

---

### Task 2: Fix Cumulative Layout Shift (CLS: 0.885)

**Why this matters:** CLS score of 0.885 is far above the "good" threshold of 0.1. This is the single worst-scoring metric. Common causes: images without explicit dimensions, content injected by third-party embeds, or WaveSurfer rendering that reflows layout.

**Files:**
- Modify: `src/pages/index.astro` — add explicit width/height to any `<img>` tags missing them
- Modify: `public/css/main.css` — add `min-height` reservations for embed containers

**Interfaces:**
- Consumes: existing markup in `index.astro`
- Produces: stable layout during load with no unexpected shifts

- [ ] **Step 1: Identify shifting elements**

Run the production build and use Chrome DevTools → Performance tab → record page load. Look at the CLS section for which elements shift. Alternatively, install the Web Vitals extension and observe layout shifts highlighted in blue.

The Lighthouse report flagged these specific elements as likely causes:
- `<img src="/images/portfolio/img_6670.jpeg">` — large image, `infersize` attribute suggests dimensions may be computed late
- The Spotify and Bandcamp embed iframes — they resize as they load
- The WaveSurfer waveform container — may resize when audio metadata loads

- [ ] **Step 2: Add explicit dimensions to all portfolio images**

In `src/pages/index.astro`, find every `<img>` tag and confirm it has both `width` and `height` attributes set to the actual rendered pixel size. For `img_6670.jpeg` (displayed as a portfolio image), measure the rendered size via DevTools and set matching attributes.

Example (adjust values to match actual rendered sizes):
```html
<img src="/images/portfolio/img_6670.jpeg" alt="Ryan Gildea"
  class="portfolio-image" loading="lazy"
  width="350" height="350">
```

Remove `infersize="true"` from any image that now has explicit dimensions.

- [ ] **Step 3: Reserve space for embed iframes**

Add explicit height to the Spotify and Bandcamp embed containers in CSS. Find the container selectors in `public/css/main.css`:

```css
/* Reserve height so iframes don't cause layout shift */
.spotify-embed-container {
  min-height: 152px; /* adjust to match actual iframe height */
}
.bandcamp-embed-container {
  min-height: 120px; /* adjust to match actual iframe height */
}
```

Measure the actual rendered heights of these iframes and use those values.

- [ ] **Step 4: Reserve space for WaveSurfer container**

Find the waveform container selector and add a fixed height matching what WaveSurfer renders into:

```css
.waveform-container,
wave { /* WaveSurfer renders a <wave> element */
  height: 80px; /* or whatever height WaveSurfer uses */
  overflow: hidden;
}
```

- [ ] **Step 5: Build and measure CLS**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080`, run Lighthouse in Chrome DevTools. CLS should be below 0.1.

- [ ] **Step 6: Run tests**

```bash
npm run test:visual
```

Expected: all pass. Visual snapshots may need updating if layout changed — review diffs carefully.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro public/css/main.css
git commit -m "perf: fix cumulative layout shift by reserving space for images and embeds"
```

---

### Task 3: Convert portfolio images to WebP and resize to display dimensions

**Why this matters:**
- "Serve images in next-gen formats" audit: 5,711 KiB potential savings
- "Properly size images" audit: 3,589 KiB potential savings
- "Efficiently encode images" audit: 292 KiB potential savings

Portfolio images are PNG/JPEG being served at full resolution when they display at 350×350 px or smaller.

**Files:**
- Modify: `public/images/portfolio/` — convert and resize images
- Modify: `src/pages/index.astro` — update `src` attributes to `.webp`

**Interfaces:**
- Consumes: existing PNG/JPEG files in `public/images/portfolio/`
- Produces: WebP images at display-appropriate dimensions, originals kept as fallback

- [ ] **Step 1: Confirm `cwebp` or `ffmpeg` is available**

```bash
which cwebp || which ffmpeg
```

If neither is available: `brew install webp` (for `cwebp`).

- [ ] **Step 2: Check actual display dimensions for each image**

Open `http://localhost:4321`, use DevTools to inspect each portfolio image. Record the rendered width × height for each. Portfolio card images render at approximately 350×350; the thumbnail images (`occo.png` in listen-card) render at 48×48.

- [ ] **Step 3: Convert and resize each image to WebP**

For each portfolio image (adjust dimensions per Step 2):

```bash
# Portfolio card images (350px wide)
cwebp -q 82 public/images/portfolio/img_6670.jpeg -o public/images/portfolio/img_6670.webp
cwebp -q 82 public/images/portfolio/occo.png -o public/images/portfolio/occo.webp
cwebp -q 82 public/images/portfolio/post-work-society.png -o public/images/portfolio/post-work-society.webp
cwebp -q 82 public/images/portfolio/eons-past.png -o public/images/portfolio/eons-past.webp
cwebp -q 82 public/images/portfolio/hornz.png -o public/images/portfolio/hornz.webp
cwebp -q 82 public/images/portfolio/jerzee.png -o public/images/portfolio/jerzee.webp
```

For the listen-card thumbnail (48×48):
```bash
cwebp -q 82 -resize 48 48 public/images/portfolio/occo.png -o public/images/portfolio/occo-thumb.webp
```

- [ ] **Step 4: Use `<picture>` with WebP + original fallback in `index.astro`**

For each portfolio image, replace `<img>` with a `<picture>` element:

```html
<picture>
  <source srcset="/images/portfolio/occo.webp" type="image/webp">
  <img src="/images/portfolio/occo.png" alt="OCCO"
    class="portfolio-image" loading="lazy" width="350" height="350">
</picture>
```

Do this for every portfolio image. Keep the original PNG/JPEG as the `<img>` fallback.

- [ ] **Step 5: Build and verify images render correctly**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080`, visually check that every portfolio image loads and looks correct.

- [ ] **Step 6: Run tests**

```bash
npm run test:visual
```

Expected: all pass (snapshots may differ due to slight WebP rendering differences — review and update if correct).

- [ ] **Step 7: Commit**

```bash
git add public/images/portfolio/ src/pages/index.astro
git commit -m "perf: convert portfolio images to WebP with original fallbacks"
```

---

## MEDIUM PRIORITY

Fixes that improve SEO, accessibility, and best practices without requiring architectural changes.

---

### Task 4: Add meta description

**Why this matters:** SEO audit failure — "Document does not have a meta description." Google uses this for search result snippets.

**Files:**
- Modify: `src/layouts/Base.astro` — add `<meta name="description">` in `<head>`

- [ ] **Step 1: Add meta description to layout**

Open `src/layouts/Base.astro`. In the `<head>` block, add:

```html
<meta name="description" content="Ryan Gildea — audio engineer, producer, and mixer based in [location]. Portfolio of mixing and production work.">
```

Adjust the content to accurately describe the site. Keep it under 160 characters.

- [ ] **Step 2: Verify in browser**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080`, view page source, confirm `<meta name="description">` appears.

- [ ] **Step 3: Run tests**

```bash
npm run test:visual
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "seo: add meta description"
```

---

### Task 5: Fix color contrast failures

**Why this matters:** Lighthouse accessibility audit flagged 3 elements with insufficient contrast. The site currently scores 97 on accessibility; fixing these brings it to 100.

**Failing elements (from report):**
1. A nav link with `position: relative; z-index: 1003` (likely the Contact link in the hero overlay area)
2. `<h1 id="hero-name" class="hero-title">` — the main hero name
3. `<button class="mix-toggle__btn active">` — the active mix toggle button

**Files:**
- Modify: `public/css/main.css` or `public/css/synthwave.css` — adjust color values

**Interfaces:**
- Consumes: existing color variables/values for the failing elements
- Produces: contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text

- [ ] **Step 1: Identify exact current colors**

In `public/css/main.css` and `public/css/synthwave.css`, search for:
```bash
grep -n "hero-title\|mix-toggle__btn\|hero.*color\|hero.*background" public/css/main.css public/css/synthwave.css
```

Note the foreground and background color values for each failing element.

- [ ] **Step 2: Check contrast ratios**

Use the WebAIM contrast checker at https://webaim.org/resources/contrastchecker/ (or Chrome DevTools → Elements → computed color) to measure each element's current ratio.

- [ ] **Step 3: Adjust colors to meet WCAG AA**

For each failing element, change either the text color or background to achieve ≥ 4.5:1 (normal text) or ≥ 3:1 (large/bold text ≥ 18px).

Typical adjustments:
- Hero title: if it's light text on a translucent background over an image, add a darker overlay or darken the text shadow.
- Mix toggle active button: if the active state uses a low-contrast color scheme, darken the background or lighten the text.

Apply changes in the relevant CSS file. Example pattern:
```css
.hero-title {
  /* was: color: #e0e0ff; */
  color: #ffffff; /* bump to pure white for better contrast */
  text-shadow: 0 0 8px rgba(0,0,0,0.8); /* add shadow if background is light */
}
```

- [ ] **Step 4: Build and verify visually**

```bash
npm run build && npm run serve
```

Check that the hero and mix toggle still look intentional (the synthwave aesthetic should be preserved).

- [ ] **Step 5: Run Lighthouse or axe on localhost to confirm 0 contrast failures**

In Chrome DevTools, run an accessibility audit or use the axe extension. Confirm no contrast failures.

- [ ] **Step 6: Run tests**

```bash
npm run test:visual
```

Visual snapshots may differ — review diffs to confirm changes are only the intended color adjustments.

- [ ] **Step 7: Commit**

```bash
git add public/css/main.css public/css/synthwave.css
git commit -m "a11y: fix color contrast failures on hero title and mix toggle"
```

---

### Task 6: Fix heading order

**Why this matters:** Lighthouse accessibility audit flagged an `<h4>` appearing before an `<h3>` or `<h2>` in the document, breaking sequential heading hierarchy.

**Files:**
- Modify: `src/pages/index.astro` — change the `<h4>` to the appropriate heading level

- [ ] **Step 1: Find the out-of-order heading**

```bash
grep -n "<h[1-6]" src/pages/index.astro
```

Identify the `<h4>` that appears without a preceding `<h3>`. Determine what logical heading level it should be (likely `<h3>` or demote the parent heading).

- [ ] **Step 2: Change the heading level**

Change the `<h4>` to `<h3>` (or whichever level maintains the correct hierarchy). Update both opening and closing tags. If a CSS style targets `h4` specifically, add the `h3` selector there too.

- [ ] **Step 3: Build and run tests**

```bash
npm run build && npm run test:visual
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "a11y: fix heading order — h4 promoted to correct sequential level"
```

---

### Task 7: Add apple-touch-icon

**Why this matters:** Best practices audit failure. When users add the site to their iOS home screen, no icon appears. This also affects the PWA score.

**Files:**
- Create: `public/apple-touch-icon.png` — 180×180 PNG icon
- Modify: `src/layouts/Base.astro` — add `<link rel="apple-touch-icon">` in `<head>`

- [ ] **Step 1: Create the icon**

Create a 180×180 PNG that represents the site brand (initials "RG", a waveform graphic, or similar). Save it to `public/apple-touch-icon.png`.

If no design tool is available, a quick option is to use ImageMagick:
```bash
convert -size 180x180 xc:#1a1a2e -fill '#c084fc' -font Helvetica-Bold \
  -pointsize 72 -gravity center -annotate 0 'RG' public/apple-touch-icon.png
```

Adjust colors to match the site's synthwave palette.

- [ ] **Step 2: Add link tag to layout**

In `src/layouts/Base.astro`, in `<head>`:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

- [ ] **Step 3: Build and verify**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080`, view source, confirm the link tag appears.

- [ ] **Step 4: Run tests**

```bash
npm run test:visual
```

- [ ] **Step 5: Commit**

```bash
git add public/apple-touch-icon.png src/layouts/Base.astro
git commit -m "feat: add apple-touch-icon for iOS home screen"
```

---

## LOW PRIORITY

Minor improvements with limited user-facing impact.

---

### Task 8: Reduce unused Font Awesome CSS

**Why this matters:** "Reduce unused CSS" audit: 35 KiB of Font Awesome CSS is unused. Font Awesome's full `all.min.css` includes hundreds of icon styles; the site uses only a few.

**Files:**
- Modify: `src/layouts/Base.astro` — switch from full Font Awesome to individual icon imports or a subset

- [ ] **Step 1: Identify which icons are actually used**

```bash
grep -rn "fa-\|fas \|fab \|far " src/ public/js/
```

List the specific icon classes in use (e.g., `fa-spotify`, `fa-bandcamp`, `fa-envelope`).

- [ ] **Step 2: Choose a strategy**

Option A (simpler): Replace the Font Awesome CDN link with a link to only the specific icon SVGs (copy the SVG paths from Font Awesome free and inline them or host them in `public/`).

Option B: Use the Font Awesome Kit with subsetting if already set up, or switch to individual `<i>` replacements with inline SVGs.

Implement Option A unless the icon count is > 10.

- [ ] **Step 3: Remove the Font Awesome CDN link from `Base.astro`**

```html
<!-- Remove this line: -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

Replace icon uses with inline SVGs or SVG `<use>` references from a sprite in `public/`.

- [ ] **Step 4: Build and visually verify all icons appear**

```bash
npm run build && npm run serve
```

Check header, footer, social links, contact section — confirm every icon renders.

- [ ] **Step 5: Run tests**

```bash
npm run test:visual
```

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro public/
git commit -m "perf: replace Font Awesome CDN with inline SVG icons"
```

---

### Task 9: Add web app manifest (PWA basics)

**Why this matters:** PWA score is 30. A manifest file adds installability support and improves the best-practices score. For a portfolio site this is cosmetic but takes ~15 minutes.

**Files:**
- Create: `public/manifest.json`
- Modify: `src/layouts/Base.astro` — add `<link rel="manifest">`

- [ ] **Step 1: Create manifest**

Create `public/manifest.json`:

```json
{
  "name": "Ryan Gildea — Audio",
  "short_name": "RG Audio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#c084fc",
  "icons": [
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

Adjust `theme_color` and `background_color` to match the site's synthwave palette.

- [ ] **Step 2: Link manifest in layout**

In `src/layouts/Base.astro` `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#c084fc">
```

- [ ] **Step 3: Build and verify**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080`, DevTools → Application → Manifest. Confirm it loads without errors.

- [ ] **Step 4: Run tests**

```bash
npm run test:visual
```

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json src/layouts/Base.astro
git commit -m "feat: add web app manifest for PWA basics"
```

---

## Out of Scope (Third-Party Issues)

These issues appear in the Lighthouse report but are caused by third-party embeds we do not control:

- **Spotify embed unused JS (318 KiB)** — Spotify's Next.js bundle is loaded by the iframe. The only mitigation would be lazy-loading the Spotify iframe itself, which risks a worse UX (blank embed until interaction).
- **Bandcamp cookie (SameSite)** — the `inspector-issues` audit logs a cookie from `bandcamp.com/band_follow_button_deluxe/` without a SameSite attribute. This is set by Bandcamp's server; we cannot change it.
- **Cache TTL on third-party assets** — Bandcamp logo and Spotify mosaic images have short cache headers set by those servers.
- **Legacy JS from Spotify embed** — polyfills in Spotify's bundle; not actionable from our side.
- **Service worker / offline support** — Low value for a portfolio site. Intentionally excluded.
