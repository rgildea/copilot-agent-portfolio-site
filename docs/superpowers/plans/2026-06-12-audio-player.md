# Audio Player — Rough vs. Final Mix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Listen" section with WaveSurfer.js waveform players that let visitors toggle between rough and final mixes per track, with per-track millisecond offset synchronization.

**Architecture:** Portfolio content schema gains an optional `audioTracks` field. Astro filters audio-enabled items at build time and serializes track data into `data-tracks` attributes on each artist card. A `<script>` in `index.astro` imports `src/scripts/audio-player.js`, which Vite/Astro bundles with the WaveSurfer npm dependency. Each card gets one WaveSurfer instance at a time; switching tabs or mix modes destroys and recreates the instance, seeking to the offset-adjusted position.

**Tech Stack:** WaveSurfer.js v7 (npm), Astro content collections, vanilla JS (ES modules), Playwright for tests.

**Spec:** `docs/superpowers/specs/2026-06-12-audio-player-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `wavesurfer.js` dependency |
| `src/content/config.ts` | Modify | Add `audioTracks` schema to portfolio collection |
| `src/content/portfolio/occo.md` | Modify | Example audio track data (real R2 URLs to be filled in) |
| `src/layouts/Base.astro` | Modify | Add "Listen" nav link |
| `src/pages/index.astro` | Modify | Add Listen section HTML + `<script>` import |
| `src/scripts/audio-player.js` | Create | WaveSurfer init, playback, tab switching, mix toggle, offset sync |
| `public/css/main.css` | Modify | Listen section styles |
| `tests/visual/listen.spec.js` | Create | Playwright tests for Listen section |

---

## Task 1: Install WaveSurfer.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install wavesurfer.js
```

- [ ] **Step 2: Verify it appears in package.json**

```bash
grep wavesurfer package.json
```
Expected: line containing `"wavesurfer.js"` with a version.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add wavesurfer.js dependency"
```

---

## Task 2: Extend portfolio content schema

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Add `audioTracks` to the portfolio schema**

Replace the entire `src/content/config.ts` with:

```ts
import { defineCollection, z } from "astro:content";

const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    role: z.string(),
    image: z.string(),
    url: z.string(),
    client: z.string().optional(),
    description: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(10),
    audioTracks: z
      .array(
        z.object({
          title: z.string(),
          roughUrl: z.string().url(),
          finalUrl: z.string().url(),
          roughOffset: z.number().default(0),
        }),
      )
      .optional(),
  }),
});

const services = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    description: z.string(),
    order: z.number().default(10),
  }),
});

export const collections = { portfolio, services };
```

- [ ] **Step 2: Build to verify schema compiles with no errors**

```bash
npm run build
```
Expected: `dist/` is created, no TypeScript or Zod errors in output.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add audioTracks field to portfolio content schema"
```

---

## Task 3: Add example audio tracks to OCCO portfolio item

**Files:**
- Modify: `src/content/portfolio/occo.md`

- [ ] **Step 1: Add `audioTracks` frontmatter**

Replace the entire `src/content/portfolio/occo.md` with:

```markdown
---
title: OCCO
role: Producer, Mix Engineer
image: /images/portfolio/occo.png
url: https://open.spotify.com/artist/5IG3wkveWKVh9r0AQvY8pQ
client: OCCO
description: Produced and mixed multiple tracks for ambient electronic artist OCCO, emphasizing spatial audio techniques and immersive soundscapes.
featured: true
order: 2
audioTracks:
  - title: "Drift"
    roughUrl: "https://REPLACE_WITH_R2_URL/occo-drift-rough.mp3"
    finalUrl: "https://REPLACE_WITH_R2_URL/occo-drift-final.mp3"
    roughOffset: 0
  - title: "Void"
    roughUrl: "https://REPLACE_WITH_R2_URL/occo-void-rough.mp3"
    finalUrl: "https://REPLACE_WITH_R2_URL/occo-void-final.mp3"
    roughOffset: -240
---
```

> **Note:** Replace the `REPLACE_WITH_R2_URL` placeholders with real Cloudflare R2 public bucket URLs before running the full test suite. The build will succeed with placeholder URLs; only WaveSurfer audio loading will fail until real URLs are provided.

- [ ] **Step 2: Build to verify schema accepts the new frontmatter**

```bash
npm run build
```
Expected: build succeeds with no schema validation errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/portfolio/occo.md
git commit -m "feat: add example audioTracks to OCCO portfolio item"
```

---

## Task 4: Write Playwright tests for the Listen section (TDD — expect FAIL)

**Files:**
- Create: `tests/visual/listen.spec.js`

- [ ] **Step 1: Create the test file**

```js
// @ts-check
import { expect, test } from "@playwright/test";

test.describe("Listen section", () => {
  test("should render the listen section with a nav link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".listen-section")).toBeVisible();
    await expect(page.locator('.nav-links a[href="/#listen"]')).toBeVisible();
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

  test("should show one tab per track and mark first tab active", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    const tabs = firstCard.locator(".listen-tab");
    await expect(tabs).toHaveCount(2); // OCCO has 2 tracks
    await expect(tabs.first()).toHaveClass(/active/);
  });

  test("clicking a tab should make it active and deactivate others", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator(".listen-card").first();
    const tabs = firstCard.locator(".listen-tab");
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/active/);
    await expect(tabs.first()).not.toHaveClass(/active/);
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
```

- [ ] **Step 2: Run tests — confirm they all FAIL**

```bash
npm run build && npm run test:visual -- --grep "Listen section"
```
Expected: all 8 tests fail because `.listen-section` does not exist in the DOM.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/visual/listen.spec.js
git commit -m "test: add Listen section Playwright tests (expected failing)"
```

---

## Task 5: Add nav link and Listen section HTML

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add "Listen" nav link in `Base.astro`**

Find the `<ul class="nav-links">` block and add the Listen link between Portfolio and Contact:

```html
<ul class="nav-links">
  <li><a href="/#about">About</a></li>
  <li><a href="/#portfolio">Portfolio</a></li>
  <li><a href="/#listen">Listen</a></li>
  <li><a href="/#contact">Contact</a></li>
</ul>
```

- [ ] **Step 2: Add `audioItems` filter in `index.astro` frontmatter**

In the frontmatter of `src/pages/index.astro`, add after the `portfolioItems` sort line:

```js
const audioItems = portfolioItems.filter(
  (item) => item.data.audioTracks && item.data.audioTracks.length > 0,
);
```

- [ ] **Step 3: Add the Listen section HTML in `index.astro`**

Insert this block between the closing `</section>` of the Portfolio section and the opening `<section id="contact"`:

```astro
{audioItems.length > 0 && (
  <section id="listen" class="listen-section">
    <div class="container">
      <h2 class="section-title">Rough vs. Final</h2>
      <div class="listen-cards">
        {audioItems.map((item) => (
          <div
            class="listen-card"
            data-tracks={JSON.stringify(item.data.audioTracks)}
          >
            <div class="listen-card__header">
              <img
                src={item.data.image}
                alt={item.data.title}
                class="listen-card__thumb"
                width="48"
                height="48"
                loading="lazy"
              />
              <div class="listen-card__meta">
                <div class="listen-card__artist-name">{item.data.title}</div>
                <div class="listen-card__role">{item.data.role}</div>
              </div>
            </div>

            <div class="listen-card__tabs" role="tablist">
              {item.data.audioTracks!.map((track, i) => (
                <button
                  class={`listen-tab${i === 0 ? " active" : ""}`}
                  role="tab"
                  data-track-index={String(i)}
                  aria-selected={i === 0 ? "true" : "false"}
                >
                  {track.title}
                </button>
              ))}
            </div>

            <div class="listen-card__player">
              <div class="listen-player-controls">
                <button class="listen-play-btn" aria-label="Play">
                  <i class="fas fa-play"></i>
                </button>
                <span class="listen-track-title">
                  {item.data.audioTracks![0].title}
                </span>
                <div class="mix-toggle" role="group" aria-label="Mix version">
                  <button class="mix-toggle__btn active" data-mix="rough">Rough</button>
                  <button class="mix-toggle__btn" data-mix="final">Final</button>
                </div>
              </div>
              <div class="listen-waveform"></div>
              <div class="listen-time">
                <span class="listen-time__current">0:00</span>
                <span class="listen-time__total">0:00</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Build to verify HTML renders**

```bash
npm run build
```
Expected: build succeeds. Check `dist/index.html` contains `id="listen"` and `class="listen-card"`.

```bash
grep -c "listen-card" dist/index.html
```
Expected: a number greater than 0.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: add Listen section HTML and nav link"
```

---

## Task 6: Add Listen section CSS

**Files:**
- Modify: `public/css/main.css`

- [ ] **Step 1: Add scroll-margin-top to the existing section rule**

Find the block in `main.css`:
```css
.about-section,
.portfolio-section,
.contact-section {
  scroll-margin-top: 140px;
}
```

Replace it with:
```css
.about-section,
.portfolio-section,
.listen-section,
.contact-section {
  scroll-margin-top: 140px;
}
```

- [ ] **Step 2: Append the Listen section styles at the end of `main.css`**

```css
/* Listen section */
.listen-section {
  padding: 100px 0;
  position: relative;
  z-index: 1;
}

.listen-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.listen-card {
  background: rgba(30, 6, 57, 0.7);
  border: 1px solid rgba(163, 114, 196, 0.3);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.listen-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(82, 193, 209, 0.12);
}

.listen-card__thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.listen-card__artist-name {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 0;
}

.listen-card__role {
  font-size: 0.8rem;
  color: var(--accent-color);
  letter-spacing: 0.5px;
  margin-top: 0.2rem;
}

.listen-card__tabs {
  display: flex;
  border-bottom: 1px solid rgba(82, 193, 209, 0.1);
  overflow-x: auto;
}

.listen-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.6rem 1.25rem;
  font-size: 0.8rem;
  color: rgba(244, 244, 244, 0.5);
  letter-spacing: 0.5px;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.listen-tab.active {
  color: var(--secondary-color);
  border-bottom-color: var(--secondary-color);
  background: rgba(226, 82, 162, 0.06);
}

.listen-tab:hover:not(.active) {
  color: rgba(244, 244, 244, 0.8);
}

.listen-card__player {
  padding: 1rem 1.5rem 1.25rem;
}

.listen-player-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.listen-play-btn {
  width: 36px;
  height: 36px;
  background: var(--secondary-color);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(226, 82, 162, 0.35);
  transition: var(--transition);
}

.listen-play-btn:hover {
  box-shadow: 0 0 16px rgba(226, 82, 162, 0.6);
  transform: scale(1.05);
}

.listen-track-title {
  flex: 1;
  font-size: 0.9rem;
  color: rgba(244, 244, 244, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mix-toggle {
  display: flex;
  border: 1px solid rgba(82, 193, 209, 0.35);
  border-radius: 20px;
  overflow: hidden;
  flex-shrink: 0;
}

.mix-toggle__btn {
  background: none;
  border: none;
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(244, 244, 244, 0.5);
  cursor: pointer;
  transition: var(--transition);
}

.mix-toggle__btn.active {
  background: var(--secondary-color);
  color: #fff;
}

.listen-waveform {
  margin: 0.5rem 0 0.35rem;
  border-radius: 4px;
  overflow: hidden;
  min-height: 48px;
}

.listen-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(244, 244, 244, 0.4);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .listen-cards {
    max-width: 100%;
  }

  .listen-card__header {
    padding: 1rem;
  }

  .listen-card__player {
    padding: 0.75rem 1rem 1rem;
  }

  .listen-player-controls {
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 3: Build to verify**

```bash
npm run build
```
Expected: build succeeds, no CSS parse errors.

- [ ] **Step 4: Commit**

```bash
git add public/css/main.css
git commit -m "feat: add Listen section CSS"
```

---

## Task 7: Create audio player module stub and wire script

**Files:**
- Create: `src/scripts/audio-player.js`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create stub `src/scripts/audio-player.js`**

```bash
mkdir -p src/scripts
```

Create `src/scripts/audio-player.js`:

```js
import WaveSurfer from 'wavesurfer.js';

export function initAudioPlayers() {
  // stub — full implementation in Task 8
}
```

- [ ] **Step 2: Add `<script>` to `index.astro`**

At the bottom of `src/pages/index.astro`, just before the closing `</Base>` tag, add:

```astro
<script>
  import { initAudioPlayers } from '../scripts/audio-player.js';
  initAudioPlayers();
</script>
```

- [ ] **Step 3: Build to verify script is bundled without errors**

```bash
npm run build
```
Expected: build succeeds. Vite bundles the script. Check `dist/` for a JS asset containing `WaveSurfer`.

```bash
ls dist/_astro/*.js | head -5
```
Expected: one or more `.js` files exist.

- [ ] **Step 4: Run the Listen section tests — DOM structure tests should now pass**

```bash
npm run build && npm run test:visual -- --grep "Listen section"
```
Expected: 6 of 8 tests pass — all render-only checks (section visible, cards, tabs, toggle state, waveform, mobile). The two click-interaction tests ("clicking a tab…" and "clicking final toggle…") will still fail because the stub JS has no event handlers; those pass after Task 8.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/audio-player.js src/pages/index.astro
git commit -m "feat: wire audio player script to index page"
```

---

## Task 8: Implement core audio player (WaveSurfer init, tabs, toggle)

**Files:**
- Modify: `src/scripts/audio-player.js`

- [ ] **Step 1: Replace stub with full implementation**

Replace the entire `src/scripts/audio-player.js` with:

```js
import WaveSurfer from 'wavesurfer.js';

const WAVE_COLOR = 'rgba(82, 193, 209, 0.4)';
const PROGRESS_COLOR = '#e252a2';
const WAVEFORM_HEIGHT = 48;

// Registry of all card states — used for global playback exclusivity
const players = new Map();

export function initAudioPlayers() {
  document.querySelectorAll('.listen-card').forEach(initCard);
}

function initCard(card) {
  const tracks = JSON.parse(card.dataset.tracks || '[]');
  if (!tracks.length) return;

  const state = {
    tracks,
    activeTrackIndex: 0,
    activeMix: 'rough',
    ws: null,
    silenceTimer: null,
    silenceStartMs: null,
    rafId: null,
  };
  players.set(card, state);

  const els = getCardEls(card);

  card.querySelectorAll('.listen-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.trackIndex, 10);
      if (idx === state.activeTrackIndex) return;
      const wasPlaying = isCardPlaying(state);
      clearSilenceTimer(state);
      loadTrack(card, state, idx, state.activeMix, wasPlaying, 0, els);
    });
  });

  card.querySelectorAll('.mix-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newMix = btn.dataset.mix;
      if (newMix === state.activeMix) return;
      const wasPlaying = isCardPlaying(state);
      const playerTime = getPlayerTime(state);
      const track = tracks[state.activeTrackIndex];
      const offset_s = (track.roughOffset || 0) / 1000;
      let targetFileTime;
      if (newMix === 'rough') {
        // final → rough: T_rough = T_player - offset_s
        targetFileTime = Math.max(0, playerTime - offset_s);
      } else {
        // rough → final: T_final = T_player = T_rough + offset_s
        targetFileTime = Math.max(0, playerTime + offset_s);
      }
      clearSilenceTimer(state);
      loadTrack(card, state, state.activeTrackIndex, newMix, wasPlaying, targetFileTime, els);
    });
  });

  els.playBtn.addEventListener('click', () => handlePlayClick(card, state, els));

  loadTrack(card, state, 0, 'rough', false, 0, els);
}

function loadTrack(card, state, trackIndex, mix, autoplay, seekToFileTime, els) {
  clearSilenceTimer(state);
  if (state.ws) {
    state.ws.destroy();
    state.ws = null;
  }

  const track = state.tracks[trackIndex];
  const url = mix === 'rough' ? track.roughUrl : track.finalUrl;
  const offset_s = (track.roughOffset || 0) / 1000;

  state.activeTrackIndex = trackIndex;
  state.activeMix = mix;

  updateTabUI(card, trackIndex);
  updateToggleUI(card, mix);
  if (els.trackTitleEl) els.trackTitleEl.textContent = track.title;
  if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
  if (els.timeTotalEl) els.timeTotalEl.textContent = '0:00';

  const ws = WaveSurfer.create({
    container: els.waveformEl,
    waveColor: WAVE_COLOR,
    progressColor: PROGRESS_COLOR,
    height: WAVEFORM_HEIGHT,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    url,
  });
  state.ws = ws;

  ws.on('ready', (duration) => {
    if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(duration);

    // Determine initial seek position in file time
    let initialFileTime = seekToFileTime;
    if (seekToFileTime === 0 && mix === 'rough' && offset_s < 0) {
      // Negative offset: rough file starts at |offset_s| when player is at 0
      initialFileTime = Math.abs(offset_s);
    }
    if (initialFileTime > 0) {
      ws.setTime(Math.min(initialFileTime, duration));
    }

    if (autoplay) {
      if (mix === 'rough' && offset_s > 0 && seekToFileTime === 0) {
        // Positive offset starting from player time 0: apply silence zone
        startSilenceZone(card, state, els, offset_s);
      } else {
        ws.play();
      }
    }
  });

  ws.on('timeupdate', (currentTime) => {
    if (state.silenceStartMs !== null) return; // silence zone RAF handles display
    const displayTime = mix === 'rough'
      ? Math.max(0, currentTime + offset_s)
      : currentTime;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(displayTime);
  });

  ws.on('play', () => {
    updatePlayBtn(card, true);
    pauseOtherCards(card);
  });

  ws.on('pause', () => updatePlayBtn(card, false));

  ws.on('finish', () => {
    updatePlayBtn(card, false);
    clearSilenceTimer(state);
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
  });
}

function handlePlayClick(card, state, els) {
  if (!state.ws) return;
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;

  // Pause if silence zone is counting down
  if (state.silenceTimer !== null) {
    clearSilenceTimer(state);
    updatePlayBtn(card, false);
    return;
  }

  if (state.ws.isPlaying()) {
    state.ws.pause();
    return;
  }

  // Positive offset + rough mix + at file position 0 = silence zone
  if (state.activeMix === 'rough' && offset_s > 0 && state.ws.getCurrentTime() === 0) {
    startSilenceZone(card, state, els, offset_s);
  } else {
    pauseOtherCards(card);
    state.ws.play();
  }
}

function startSilenceZone(card, state, els, offset_s) {
  state.silenceStartMs = performance.now();
  pauseOtherCards(card);
  updatePlayBtn(card, true);

  function tick() {
    if (state.silenceStartMs === null) return;
    const elapsed = (performance.now() - state.silenceStartMs) / 1000;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(elapsed);
    state.rafId = requestAnimationFrame(tick);
  }
  state.rafId = requestAnimationFrame(tick);

  state.silenceTimer = setTimeout(() => {
    state.silenceStartMs = null;
    state.silenceTimer = null;
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.ws) state.ws.play();
  }, offset_s * 1000);
}

function clearSilenceTimer(state) {
  if (state.silenceTimer !== null) {
    clearTimeout(state.silenceTimer);
    state.silenceTimer = null;
  }
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  state.silenceStartMs = null;
}

function isCardPlaying(state) {
  return (state.ws !== null && state.ws.isPlaying()) || state.silenceTimer !== null;
}

function getPlayerTime(state) {
  if (state.silenceStartMs !== null) {
    return (performance.now() - state.silenceStartMs) / 1000;
  }
  if (!state.ws) return 0;
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;
  return state.activeMix === 'rough'
    ? Math.max(0, state.ws.getCurrentTime() + offset_s)
    : state.ws.getCurrentTime();
}

function pauseOtherCards(activeCard) {
  players.forEach((state, card) => {
    if (card === activeCard) return;
    clearSilenceTimer(state);
    if (state.ws && state.ws.isPlaying()) state.ws.pause();
  });
}

function updateTabUI(card, activeIndex) {
  card.querySelectorAll('.listen-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === activeIndex);
    tab.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
  });
}

function updateToggleUI(card, mix) {
  card.querySelectorAll('.mix-toggle__btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mix === mix);
  });
}

function updatePlayBtn(card, isPlaying) {
  const icon = card.querySelector('.listen-play-btn i');
  if (icon) icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function getCardEls(card) {
  return {
    waveformEl: card.querySelector('.listen-waveform'),
    playBtn: card.querySelector('.listen-play-btn'),
    timeCurrentEl: card.querySelector('.listen-time__current'),
    timeTotalEl: card.querySelector('.listen-time__total'),
    trackTitleEl: card.querySelector('.listen-track-title'),
  };
}

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: build succeeds, no import or syntax errors.

- [ ] **Step 3: Run the Listen section tests — all should pass**

```bash
npm run build && npm run test:visual -- --grep "Listen section"
```
Expected: all 8 tests pass. (WaveSurfer audio loading errors in console are expected — the placeholder R2 URLs return 404. DOM interaction tests do not require audio to load.)

- [ ] **Step 4: Commit**

```bash
git add src/scripts/audio-player.js
git commit -m "feat: implement audio player with WaveSurfer, tabs, mix toggle, and offset sync"
```

---

## Task 9: Full build and complete test suite

**Files:** none — validation only

- [ ] **Step 1: Run the full production build**

```bash
npm run build
```
Expected: exits 0, `dist/` created, no errors.

- [ ] **Step 2: Run the full Playwright test suite (all browsers)**

```bash
npm run test:visual:full
```
Expected: all tests pass across Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari. Any failures in existing tests (homepage, portfolio) indicate a regression and must be fixed before merging.

- [ ] **Step 3: If all tests pass, commit**

If no additional changes were needed:
```bash
git log --oneline -8
```
All feature commits should be present. The branch is ready to merge.

If minor fixes were needed during the test run, stage and commit them:
```bash
git add <changed files>
git commit -m "fix: <description of fix>"
```

---

## Notes for filling in real R2 URLs

After uploading audio files to Cloudflare R2, update `src/content/portfolio/occo.md` (and any other portfolio items you add audio to) by replacing the `REPLACE_WITH_R2_URL` placeholder with your actual R2 public bucket base URL. The R2 bucket must have a CORS policy allowing `GET` from the portfolio site's domain, otherwise WaveSurfer cannot load or render waveforms.

## Adding audio to more portfolio items

To add audio to another portfolio item (e.g., `hornz.md`), add the same `audioTracks` frontmatter block:

```yaml
audioTracks:
  - title: "Track Name"
    roughUrl: "https://your-r2-bucket.r2.dev/hornz-trackname-rough.mp3"
    finalUrl: "https://your-r2-bucket.r2.dev/hornz-trackname-final.mp3"
    roughOffset: 0
```

The Listen section renders automatically for any portfolio item with `audioTracks` defined.
