# Lighthouse Performance & Accessibility Optimization Plan

**Date:** June 24, 2026  
**Status:** Draft / Actionable Plan  
**Target:** Skyrocket Lighthouse Performance score from 50 to 90+, increase Accessibility to 100, and ensure stable, low-latency paint times.

---

## Executive Score Summary & Progress Tracking

The newest Lighthouse report (**21-16-22**) shows significant progress from the previous run (**18-32-36**), but highlights critical regressions in layout stability and text contrast.

| Category | Previous Run | Newest Run | Trend | Primary Drivers & Key Findings |
| :--- | :---: | :---: | :---: | :--- |
| **Performance** | 46 | **50** | 📈 +4 | WAV lazy-loading is successfully implemented. However, Cumulative Layout Shift (CLS) is a major score blocker at 1.171. |
| **Accessibility** | 97 | **96** | 📉 -1 | Slight regression due to a text-shadow contrast issue on navigation links. |
| **Best Practices** | 83 | **83** | ➡️ Flat | Third-party errors from the classic Bandcamp follow button classic script (out of our control). |
| **SEO** | 91 | **100** | 📈 +9 | Meta description successfully added to layouts. |
| **PWA** | 30 | **70** | 📈 +40 | Manifest and apple-touch-icon successfully deployed. |

---

## 🔴 HIGH PRIORITY TIER (Core UX & Score Drivers)

### Task 1: Fix Cumulative Layout Shift (CLS: 1.171 — Score: 0.01)
* **The Problem:** The site suffers from an atrocious CLS of 1.171, rendering it highly unstable during initial load. 
* **The Root Causes:**
  1. **Flash of Unstyled Content (FOUC):** In `src/layouts/Base.astro`, the primary stylesheets (`main.css` and `synthwave.css`) are loaded asynchronously using the print media query hack (`media="print" onload="this.media=\x27all\x27"`). This causes the page to render with standard browser styles first, then violently reflow once local CSS is applied.
  2. **Spotify Container Mismatch:** In `public/css/main.css`, `.spotify-direct-embed` has a static `min-height: 152px;`, but the iframe inside scale dynamically using viewport relative units (`height: 60vh;` down to `40vh;` or `304px;` in different media queries), pushing all subsequent DOM elements down as it resolves.
* **The Fixes:**
  - **Step 1:** Modify `src/layouts/Base.astro` to load local stylesheets synchronously using normal stylesheet link tags:
    ```html
    <!-- Replace print-async hacks with synchronous loading -->
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="stylesheet" href="/css/synthwave.css" />
    ```
  - **Step 2:** Update `public/css/main.css` to align the `.spotify-direct-embed` container heights with the iframe display properties across all breakpoints to preserve exact layouts.

### Task 2: Fix Navbar Link Contrast (Accessibility Regression)
* **The Problem:** Accessibility dropped from 97 to 96 due to insufficient navbar contrast.
* **The Root Cause:** In `public/css/main.css`, navbar links have a light cyan text-shadow:
  ```css
  .navbar.top-position .nav-links a {
    color: var(--light-text); /* #ffffff */
    text-shadow: 0 0 2px var(--accent-color); /* #52c1d1 */
  }
  ```
  Lighthouse flag this as an insufficient contrast ratio (**1.3:1** vs **4.5:1** target) between white foreground and its glowing text-shadow.
* **The Fix:**
  - **Step 1:** Remove `text-shadow` on navigation anchors in `public/css/main.css`. White text against a dark overlay has an excellent natural contrast (>10:1) and enhances text legibility:
    ```css
    .navbar.top-position .nav-links a {
      color: var(--light-text);
      cursor: pointer !important;
      text-shadow: none; /* Removed text-shadow to fix contrast */
    }
    ```

---

## 🟡 MEDIUM PRIORITY TIER (Main-Thread & Loading Optimization)

### Task 3: Dissolve the "Preloader Trap"
* **The Problem:** Perceived speed is heavily bottlenecked. The screen remains completely black with a loading spinner for multiple seconds.
* **The Root Cause:** In `src/layouts/Base.astro`, the preloader fades out only when the window `load` event fires:
  ```javascript
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.querySelector(".preloader").classList.add("loaded");
    }, 500);
  });
  ```
  The `load` event waits for *all* assets—including slow third-party embeds (Spotify and Bandcamp CDNs) and large background images—to completely finish downloading. Perceived performance and LCP are at the mercy of external network latencies.
* **The Fix:**
  - **Step 1:** Modify the layout script to clear the preloader immediately upon `DOMContentLoaded` or a short, fixed fallback timer:
    ```javascript
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        document.querySelector(".preloader").classList.add("loaded");
      }, 200);
    });
    ```

### Task 4: Defer / Lazy-Load the Spotify Iframe
* **The Problem:** Total Blocking Time is **620ms** and Time to Interactive is **13.5s** because Spotify\x27s React application bundle executes over 1.5 seconds of JavaScript on page startup.
* **The Root Cause:** The iframe in the hero section is loaded with `loading="eager"`.
* **The Fix:**
  - **Option A (Scroll Deferred):** Inject the Spotify iframe dynamically in `script.js` only after the user scrolls down 50px or after 2.5s of idle time.
  - **Option B (Static Facade):** Display a beautiful, styled SVG overlay representation of the Spotify playlist. Swap in the real iframe only when the user clicks "Load Playlist".

### Task 5: Add Title to Bandcamp Follow Iframe
* **The Problem:** Screan readers cannot identify the contents of the Bandcamp follow frame (fails accessibility standards).
* **The Root Cause:** The follow iframe lacks a descriptive `title` attribute in `src/pages/index.astro`.
* **The Fix:**
  - **Step 1:** Append a `title` attribute to the Bandcamp follower iframe:
    ```html
    <iframe
      title="Follow Ryan Gildea on Bandcamp"
      scrolling="no"
      style="border: 0;width: 100%;height: 33px;"
      src="https://bandcamp.com/band_follow_button_classic/1087522331"
    ></iframe>
    ```

---

## 🟢 LOW PRIORITY TIER (Image compression & Asset tuning)

### Task 6: Compress slideshow hero background images
* **The Problem:** `hero-background-3.webp` is **608 KiB** and `hero-background-2.webp` is **332 KiB**. They download concurrently on load, consuming cellular data and slowing initial paint.
* **The Root Cause:** The backgrounds are rendered as distinct divs in HTML, forcing concurrent browser fetch.
* **The Fix:**
  - **Step 1:** Compress the WebP background images to a much lower quality setting (e.g., `q=25`) and apply a slight gaussian blur. Since these images sit under a dark overlay opacity mask (`rgba(11, 11, 41, 0.6)`), there will be zero perceivable loss of aesthetic, but payload size will drop by **~85%** (saving ~800 KiB).

### Task 7: Optimize Uploadcare URLs
* **The Problem:** External Uploadcare images (`nature-creeps-beneath` and `left-hand-does`) are served raw without responsive sizes.
* **The Fix:**
  - **Step 1:** Update `src/pages/index.astro` to append `-/resize/350x/-/format/webp/` to Uploadcare image links when rendering, saving additional bandwidth on mobile.

---

## 🧪 Validation & Test Suite Alignment

All optimizations must preserve layout boundaries and functionality:
1. **Local Build Check:** Ensure the Astro builder passes with zero warnings:
   ```bash
   npm run build
   ```
2. **Visual Regression Check:** Execute the Playwright visual regression suite to guarantee snapshots match current design elements:
   ```bash
   npm run test:visual
   ```
