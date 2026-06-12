# Audio Player — Rough vs. Final Mix

**Date:** 2026-06-12  
**Status:** Approved

## Overview

Add a standalone "Listen" section to the portfolio site that lets visitors compare rough and final mixes for selected tracks using WaveSurfer.js. Each portfolio item can expose multiple audio tracks; each track has a rough URL, a final URL, and an optional millisecond offset to keep the two mixes synchronized.

---

## Data Model

Extend the portfolio content schema in `src/content/config.ts` with an optional `audioTracks` field:

```js
audioTracks: z.array(z.object({
  title: z.string(),
  roughUrl: z.string().url(),
  finalUrl: z.string().url(),
  roughOffset: z.number().default(0),   // milliseconds, applied to rough mix
})).optional(),
```

Example in a portfolio markdown file:

```yaml
audioTracks:
  - title: "Acid Rain"
    roughUrl: "https://pub-xxx.r2.dev/hornz-acid-rain-rough.mp3"
    finalUrl: "https://pub-xxx.r2.dev/hornz-acid-rain-final.mp3"
    roughOffset: -320
  - title: "Bass Ritual"
    roughUrl: "https://pub-xxx.r2.dev/hornz-bass-ritual-rough.mp3"
    finalUrl: "https://pub-xxx.r2.dev/hornz-bass-ritual-final.mp3"
    roughOffset: 0
```

Audio files are hosted on Cloudflare R2. The R2 bucket must have a CORS policy permitting `GET` requests from the site's domain so WaveSurfer can load and decode the audio.

---

## Page Structure

A new `#listen` section is added to `src/pages/index.astro` between the Portfolio section and the Contact section. At build time Astro filters `portfolioItems` to those with a non-empty `audioTracks` array, sorted by the existing `order` field.

A "Listen" nav link is added to the navbar alongside About, Work, and Contact.

### Artist card anatomy

Each audio-enabled portfolio item renders one artist card:

```
┌─────────────────────────────────────────────────────┐
│ [thumbnail]  ARTIST NAME          role         badge │
├─────────────────────────────────────────────────────┤
│ [Track 1 tab] [Track 2 tab] [Track 3 tab]           │
├─────────────────────────────────────────────────────┤
│  ▶  Track title            [ Rough | Final ]        │
│  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  │  ← waveform
│  1:02 / 3:47                                        │
└─────────────────────────────────────────────────────┘
```

- **Tabs** select the active track. Tab state persists within the card; switching tabs preserves the current mix mode (Rough or Final).
- **Rough / Final toggle** is a pill with two states. Active state is highlighted in pink (`--secondary-color`).
- **Waveform** renders the active mix file. Played portion is pink; unplayed is cyan (`--accent-color`).
- Only one WaveSurfer instance is active per card at a time. Switching tabs destroys the current instance and creates a new one.

---

## WaveSurfer.js Integration

Install as an npm dependency:

```
npm install wavesurfer.js
```

Initialize in a `<script type="module">` block at the bottom of `index.astro` (separate from `script.js`, which remains non-module). The script reads audio data serialized into a `data-tracks` attribute (JSON) on each artist card element, then instantiates WaveSurfer per card.

---

## Offset Synchronization

The `roughOffset` value (milliseconds) aligns the rough mix to the final mix on a shared player timeline.

**Relationship:**
```
T_rough = T_player − (roughOffset / 1000)
```

| `roughOffset` | Meaning | Behavior at player position 0 |
|---|---|---|
| `0` | No offset | Both files start at 0 |
| `-500` (negative) | Rough has 500 ms of extra material at the start | Rough file seeks to 0.5 s; final starts at 0 |
| `+500` (positive) | Rough starts 500 ms after the final | Rough plays silence for 500 ms, then begins from its file position 0 |

**Toggle seek:** when the user switches mixes, the new mix seeks to the offset-adjusted equivalent of the current position:
- Final → Rough: `roughSurfer.seekTo( clamp(T_final − offset_s, 0, roughDuration) / roughDuration )`
- Rough → Final: `finalSurfer.seekTo( clamp(T_rough + offset_s, 0, finalDuration) / finalDuration )`

**Positive offset silence:** when play is triggered while T_player < offset_s, use `setTimeout` to delay starting the rough WaveSurfer instance by `(offset_s − T_player) * 1000` ms, then begin playback from file position 0. The player timeline treats the silence zone as real time — scrubbing into it is valid and cancels any pending delay.

**Global exclusivity:** starting playback on any card pauses all other cards.

---

## Styling

All new CSS goes in `public/css/main.css` under a `/* Listen section */` comment block. No new CSS files. The section uses existing CSS variables — no new color definitions needed.

---

## Files to Create / Modify

| File | Change |
|---|---|
| `src/content/config.ts` | Add `audioTracks` to portfolio schema |
| `src/pages/index.astro` | Add Listen section HTML; add Listen nav link; add `<script type="module">` for WaveSurfer init |
| `public/css/main.css` | Add `/* Listen section */` styles |
| `src/content/portfolio/*.md` | Add `audioTracks` frontmatter to items that have audio |
| `package.json` | Add `wavesurfer.js` dependency |

---

## Out of Scope

- Player inside the portfolio modal (deferred — start with standalone section only)
- Waveform visual offset (both waveforms shown simultaneously with pixel-level alignment)
- Audio file upload UI (files are manually uploaded to R2)
