# Lighthouse Performance Optimization Plan

**Date:** 2026-06-24
**Report:** `6a3c8151337de60008f5b0ce--ryangildea-dot-com.netlify.app_2026-06-24_21-16-22.json`

## Current Scores

| Category       | Score |
|----------------|-------|
| Performance    | 50    |
| Accessibility  | 96    |
| Best Practices | 83    |
| SEO            | 100   |
| PWA            | 70    |

## Root Cause Analysis

### What's actually broken (and why)

**CLS: 1.171 (score 0.01)** — The `div.site-content` element is the primary shifter (CLS contribution 1.0). This is classic FOUC: `Base.astro` loads `main.css` and `synthwave.css` with the print-media async hack (`media="print" onload="this.media='all'"`). The page first renders with browser defaults, then violently reflows when CSS applies. Lighthouse confirms no render-blocking resources (score 1), so the async trick is working for that audit — but the reflow it causes is recorded as CLS.

**TBT: 620ms / TTI: 13.5s** — The main-thread breakdown shows 999ms in Style & Layout (reflows from async CSS) and 1,588ms in Script Evaluation. Contrary to what TBT numbers might suggest, Spotify's JS executes in the iframe's own browsing context and only blocks the main thread for ~6ms (confirmed by `third-party-summary`). The TBT is primarily driven by the CSS reflow cascading through the page, not Spotify's JavaScript.

**Unused JS: 318 KiB (score 0.08)** — Every byte is from `embed-cdn.spotifycdn.com`. We cannot reduce it; we can only defer when it loads by deferring the iframe.

**Unused CSS: 20 KiB** — All from Spotify's embed CSS. Same situation: deferred iframe loading eliminates it from the initial page load.

**Total payload: 2,848 KiB** — Top offenders we can control:
- `hero-background-3.webp`: 608 KiB
- `hero-background-2.webp`: 332 KiB
- Spotify JS + fonts: ~900 KiB (deferred iframe removes from initial load)

**LCP element** — A `<p>` tag in `.about-text` at y=844–1238 (below the fold on mobile). The hero section is not LCP because the background image is CSS-delivered (not an `<img>`). LCP is 2.3s — acceptable but could improve.

**Items we cannot fix** (external assets):
- Legacy JS: Spotify's own bundles use old Babel transforms
- Text compression: Bandcamp's CDN doesn't gzip its JS/CSS
- Best Practices (83): Console errors from `bandcamp.com/_fs-ch` classic follow button script

---

## Priority 1: Fix CLS — Synchronous CSS Loading

**File:** `src/layouts/Base.astro` lines 60–61, 64

**Change:** Replace the print-media async trick with standard `<link rel="stylesheet">` tags.

```html
<!-- Before -->
<link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'" />
<link rel="stylesheet" href="/css/synthwave.css" media="print" onload="this.media='all'" />
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" media="print" onload="this.media='all'" />

<!-- After -->
<link rel="stylesheet" href="/css/main.css" />
<link rel="stylesheet" href="/css/synthwave.css" />
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" />
```

**Tradeoff:** This will introduce render-blocking resources, and Lighthouse may flag it. However, both files are served from the same origin over HTTP/2, and the actual blocking delay should be well under 100ms — far less damaging than a CLS of 1.171. Google Fonts is the more significant concern; consider using `font-display: swap` in the font URL and potentially hosting fonts locally.

**Expected impact:** CLS drops from 1.171 to near 0. This alone should push Performance from 50 toward 70+.

---

## Priority 1 (co-equal): Defer Spotify Iframe

**File:** `src/pages/index.astro` lines 44–55

**Why high priority:** The Spotify iframe is responsible for ~900 KiB of third-party payload on initial page load (JS bundles + fonts). Deferring it eliminates the unused JS audit (318 KiB), the unused CSS audit (20 KiB), and reduces total byte weight significantly.

**Change:** Replace the eager iframe with a static facade that loads the real iframe on click.

```html
<!-- In index.astro, replace the spotify-direct-embed block with: -->
<div class="spotify-direct-embed" id="spotify-facade">
  <button class="spotify-load-btn" aria-label="Load Spotify playlist">
    Load Playlist
  </button>
</div>
```

```javascript
// In script.js, add:
document.getElementById('spotify-facade').addEventListener('click', function() {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0';
  iframe.style.cssText = 'width:100%;height:60vh;border-radius:8px;';
  iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  this.replaceWith(iframe);
});
```

**Note:** The container needs a fixed height (e.g., `height: 60vh; min-height: 380px`) — not just `min-height: 152px` — so the facade placeholder takes the same space as the iframe. This prevents the Spotify container from being a CLS source when the real iframe loads.

---

## Priority 2: Compress Hero Background Images

**Files:** `public/images/hero-background-2.webp` (332 KiB), `public/images/hero-background-3.webp` (608 KiB)

These sit behind a dark overlay (`rgba(11, 11, 41, 0.6)`). Compressing to q=25–30 with a slight blur will save ~800 KiB with zero perceptible quality loss. `hero-background.webp` (44 KiB) is already well-optimized.

```bash
cwebp -q 25 public/images/hero-background-2.webp -o public/images/hero-background-2.webp
cwebp -q 25 public/images/hero-background-3.webp -o public/images/hero-background-3.webp
```

**Expected impact:** ~800 KiB reduction in total payload. Improves Speed Index and network payload audit.

---

## Priority 3: Fix Preloader Trigger

**File:** `src/layouts/Base.astro` line 120

**Current:** Preloader clears on `window.load` (waits for all assets, including external embeds).

**Change:** Clear on `DOMContentLoaded` with a short delay.

```javascript
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    document.querySelector('.preloader').classList.add('loaded');
  }, 200);
});
```

Note: If Spotify iframe is deferred (Priority 1), `window.load` fires much sooner anyway. Do Priority 1 first; this may become less critical.

---

## Priority 4: Fix Navbar Text-Shadow Contrast

**File:** `public/css/main.css`

**Change:** Remove `text-shadow` from `.navbar.top-position .nav-links a`. White text on dark overlay already has >10:1 contrast; the cyan glow adds no information and fails Lighthouse contrast checks.

```css
.navbar.top-position .nav-links a {
  color: var(--light-text);
  cursor: pointer !important;
  /* text-shadow removed: white on dark overlay has sufficient contrast */
}
```

**Expected impact:** Accessibility 96 → 97.

---

## Priority 5: Add Title to Bandcamp Follow Iframe

**File:** `src/pages/index.astro` line 289

```html
<iframe
  title="Follow Ryan Gildea on Bandcamp"
  scrolling="no"
  style="border: 0;width: 100%;height: 33px;"
  src="https://bandcamp.com/band_follow_button_classic/1087522331"
></iframe>
```

**Expected impact:** Clears iframe title accessibility failure.

---

## What to Skip

- **Uploadcare URL optimization** — "Properly size images" shows only 39 KiB savings. Not worth the maintenance cost.
- **Service Worker / PWA** — PWA is at 70, but adding a service worker is a significant undertaking and not a quality issue.
- **Legacy JS / text compression on external assets** — Cannot be fixed on our end.

---

## Expected Score After All Fixes

| Category       | Current | Expected |
|----------------|---------|----------|
| Performance    | 50      | 75–85    |
| Accessibility  | 96      | 97–98    |
| Best Practices | 83      | 83       |
| SEO            | 100     | 100      |

The CLS fix is the highest-leverage single change. Combined with Spotify deferral, the score should move significantly.

---

## Verification

```bash
npm run build && npm run test:visual
```

Run a fresh Lighthouse report against the production build to confirm CLS drops toward 0 and performance score improves before merging.
