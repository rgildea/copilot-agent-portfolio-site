# Spotify Playlist Placeholder Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare "Load Playlist" button with a blurred screenshot of the Spotify embed, overlaid with a play button and "Play Playlist" label, that fades out when clicked and reveals the live iframe.

**Architecture:** Static image asset (blurred screenshot) sits behind an absolutely-positioned overlay div containing a play SVG + label. The wrapper div fades to opacity 0 on click, swaps its contents to the iframe on `transitionend`, then fades back in.

**Tech Stack:** Vanilla HTML/CSS/JS, Astro (static output), ImageMagick for one-time image processing, Playwright for functional tests.

## Global Constraints

- No TypeScript — vanilla JS only
- No external dependencies added
- `var` declarations (existing JS style)
- `border-radius: 8px` matches existing embed frame
- Playlist iframe URL: `https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0`
- Build command: `npm run build`
- Test command: `npm run test:visual`

---

### Task 1: Create blur script and process screenshot

**Files:**
- Create: `scripts/blur-spotify-screenshot.sh`
- Produces: `public/images/spotify-placeholder.jpg`

**Interfaces:**
- Consumes: `public/images/spotify-screenshot-raw.png` (already present, 1780×1150)
- Produces: `public/images/spotify-placeholder.jpg` — referenced by `<img src="/images/spotify-placeholder.jpg">` in Task 2

- [ ] **Step 1: Create the script**

Write `scripts/blur-spotify-screenshot.sh` with this exact content:

```bash
#!/usr/bin/env bash
# Usage: ./scripts/blur-spotify-screenshot.sh <input> [output]
set -e
INPUT="${1:?Usage: $0 <input> [output]}"
OUTPUT="${2:-public/images/spotify-placeholder.jpg}"
SPLIT_PCT=38

H=$(identify -format "%h" "$INPUT")
SPLIT=$(echo "$H * $SPLIT_PCT / 100" | bc)

convert "$INPUT" -blur 0x14 \
  \( "$INPUT" -gravity North -crop "100%x${SPLIT}+0+0" +repage \) \
  -gravity North -composite \
  "$OUTPUT"

echo "Written to $OUTPUT"
```

- [ ] **Step 2: Make it executable and run it**

```bash
chmod +x scripts/blur-spotify-screenshot.sh
./scripts/blur-spotify-screenshot.sh public/images/spotify-screenshot-raw.png
```

Expected: `Written to public/images/spotify-placeholder.jpg`

- [ ] **Step 3: Verify the output image looks right**

Open `public/images/spotify-placeholder.jpg`. The top ~38% (cover art + playlist title) should be crisp; everything below should be blurred. If the split point looks off, re-run with a different `SPLIT_PCT` value in the script (try 30–45) until the cut lands just above the first track row.

- [ ] **Step 4: Commit**

```bash
git add scripts/blur-spotify-screenshot.sh public/images/spotify-placeholder.jpg
git commit -m "feat: add blur script and processed Spotify placeholder image"
```

---

### Task 2: Update HTML and CSS

**Files:**
- Modify: `src/pages/index.astro:44-47`
- Modify: `public/css/main.css:482-518`

**Interfaces:**
- Consumes: `public/images/spotify-placeholder.jpg` from Task 1
- Produces: `.spotify-facade-btn`, `.spotify-facade-img`, `.spotify-facade-content`, `.spotify-facade-play` — used by JS click handler in Task 3

- [ ] **Step 1: Replace the button markup in `src/pages/index.astro`**

Replace lines 44–48:
```html
      <div class="spotify-direct-embed" id="spotify-facade">
        <button class="spotify-facade-btn" aria-label="Load Spotify playlist">
          Load Playlist
        </button>
      </div>
```

With:
```html
      <div class="spotify-direct-embed" id="spotify-facade">
        <button class="spotify-facade-btn" aria-label="Load Spotify playlist">
          <img src="/images/spotify-placeholder.jpg" alt="" class="spotify-facade-img" aria-hidden="true">
          <div class="spotify-facade-content">
            <svg class="spotify-facade-play" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="32"/>
              <polygon points="24,16 52,32 24,48"/>
            </svg>
            <span>Play Playlist</span>
          </div>
        </button>
      </div>
```

- [ ] **Step 2: Add `transition` to `.spotify-direct-embed` in `public/css/main.css`**

Find the `.spotify-direct-embed` rule (line 482). Add `transition: opacity 0.3s ease;` as the last property:

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
  transition: opacity 0.3s ease;
}
```

- [ ] **Step 3: Replace `.spotify-facade-btn` and `.spotify-facade-btn:hover` in `public/css/main.css`**

Replace the current rules (lines 501–518):
```css
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

With:
```css
.spotify-facade-btn {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  position: relative;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.spotify-facade-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.spotify-facade-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  transition: background 0.2s ease;
  border-radius: 8px;
  color: var(--light-text);
  font-size: 0.9rem;
}

.spotify-facade-btn:hover .spotify-facade-content {
  background: rgba(0, 0, 0, 0.5);
}

.spotify-facade-play {
  width: 64px;
  height: 64px;
  transition: transform 0.2s ease;
}

.spotify-facade-play circle {
  fill: var(--accent-color);
}

.spotify-facade-play polygon {
  fill: #000;
  transform: translateX(4px);
  transform-box: fill-box;
  transform-origin: center;
}

.spotify-facade-btn:hover .spotify-facade-play {
  transform: scale(1.08);
}
```

- [ ] **Step 4: Build and visually verify**

```bash
npm run build && npm run serve
```

Open `http://localhost:8080` in a browser. Verify:
- The hero section shows the blurred screenshot with a centered play button circle and "Play Playlist" label
- Hovering the placeholder darkens the overlay slightly and scales the play button
- The placeholder has rounded corners and a box shadow matching the surrounding design

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro public/css/main.css
git commit -m "feat: replace bare Spotify button with blurred screenshot placeholder"
```

---

### Task 3: Update JS click handler with fade transition

**Files:**
- Modify: `public/js/script.js:304-322`

**Interfaces:**
- Consumes: `#spotify-facade` div with `.spotify-facade-btn` inside (from Task 2), `transition: opacity 0.3s ease` on `.spotify-direct-embed` (from Task 2)
- Produces: on click — fade out facade, swap in iframe, fade back in

- [ ] **Step 1: Replace the click handler in `public/js/script.js`**

Replace lines 304–322:
```js
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

With:
```js
(function () {
  var facade = document.getElementById("spotify-facade");
  if (!facade) return;
  facade.addEventListener("click", function () {
    facade.style.opacity = "0";
    facade.addEventListener("transitionend", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0";
      iframe.title = "Featured playlist by Ryan Gildea";
      iframe.style.cssText = "border-radius:8px;";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
      facade.innerHTML = "";
      facade.appendChild(iframe);
      facade.style.opacity = "1";
    }, { once: true });
  });
})();
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Run functional tests**

```bash
npm run test:visual
```

Expected: all tests pass. The two Spotify tests in `tests/visual/homepage.spec.js` check that:
- `.spotify-facade-btn` is visible before interaction
- After clicking, `.spotify-direct-embed iframe` becomes visible

Both should pass — Playwright auto-waits through the 600ms fade cycle before asserting visibility.

If the iframe visibility test times out (unlikely), add a longer timeout to that test:
```js
await expect(page.locator(".spotify-direct-embed iframe")).toBeVisible({ timeout: 10000 });
```

- [ ] **Step 4: Commit**

```bash
git add public/js/script.js
git commit -m "feat: fade Spotify placeholder out before swapping in iframe"
```
