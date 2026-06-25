# Spotify Playlist Placeholder Redesign

## Overview

Replace the bare "Load Playlist" button with a visually rich placeholder that looks like a preview of the actual Spotify embed — a screenshot with the track list blurred to avoid staleness when the playlist content changes. On click it fades out and the real Spotify iframe fades in.

## Image Asset

- The user takes a screenshot of the live Spotify embed (rendered at up to 900px wide).
- A shell script using ImageMagick processes the screenshot:
  1. Blurs a full copy of the image (Gaussian, radius ~14px).
  2. Composites the crisp top 38% of the original (cover art + playlist title) back over the blurred version.
  3. Outputs `public/images/spotify-placeholder.jpg`.
- The 38% split point approximates where the track list begins. It can be tuned after reviewing the result.
- The script is provided at `scripts/blur-spotify-screenshot.sh` and is a one-time manual step.

## HTML (`src/pages/index.astro`)

Replace the current `<button class="spotify-facade-btn">Load Playlist</button>` with:

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

## CSS (`public/css/main.css`)

### `.spotify-facade-btn` changes
- Remove: `background`, `border`, `color`, `font-size`, `align-items`, `justify-content`
- Add: `position: relative; overflow: hidden; padding: 0`

### `.spotify-facade-img` (new)
```css
.spotify-facade-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
```

### `.spotify-facade-content` (new)
```css
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
```

### `.spotify-facade-btn:hover .spotify-facade-content`
```css
background: rgba(0, 0, 0, 0.5);
```

### `.spotify-facade-play` (new)
```css
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

### Facade transition (on the wrapper)
Add `transition: opacity 0.3s ease` to `.spotify-direct-embed` so the fade out/in works.

## JS (`public/js/script.js`)

Update the click handler to fade out before swapping in the iframe:

```js
facade.addEventListener("click", function () {
  facade.style.opacity = "0";
  facade.addEventListener("transitionend", function onFade() {
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
```

## ImageMagick Script (`scripts/blur-spotify-screenshot.sh`)

```bash
#!/usr/bin/env bash
# Usage: ./scripts/blur-spotify-screenshot.sh <input.png> [output.jpg]
set -e
INPUT="${1:?Usage: $0 <input.png> [output.jpg]}"
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

Run after taking the screenshot: `./scripts/blur-spotify-screenshot.sh screenshot.png`

## Out of Scope

- Automating the screenshot capture (Playwright or similar) — manual is sufficient for a one-time asset.
- Gradient blur (progressively blurring toward the bottom) — the hard split at 38% achieves the goal more simply.
