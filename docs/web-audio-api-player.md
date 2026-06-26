# Web Audio API Player — Design Doc

## Problem

`HTMLMediaElement.volume` is clamped to [0, 1] by the browser spec. Any positive dB gain value
converts to a linear volume > 1.0 and throws `IndexSizeError`. Level matching can currently only
attenuate — boosting a quiet mix is not possible.

## Goal

Allow `roughGain` and `finalGain` values in the full configured range (−60 to +12 dB) by routing
audio through the Web Audio API, where a `GainNode` accepts any non-negative value.

---

## Proposed Architecture

### Current signal path

```
audio element → speakers
setVolume(n)  → audio.volume = n  (throws if n > 1)
```

### New signal path

```
audio element → MediaElementSourceNode → GainNode → AudioContext.destination
gainNode.gain.value = n  (no upper-bound restriction)
```

---

## Key Design Decisions

### One shared AudioContext

The Web Audio API spec recommends a single `AudioContext` per page. Creating one per player
instance wastes resources and can hit browser limits. A single context is created on first user
interaction and shared across all cards.

### GainNode per WaveSurfer instance

Each of the four possible nodes (rough + final per card) gets its own `GainNode`. This lets them
be independently level-matched without cross-talk.

### MediaElementSourceNode wraps the existing `<audio>` element

WaveSurfer still owns the media element (loading, decoding, playback events). We tap into it via
`audioContext.createMediaElementSource(wavesurfer.getMediaElement())`. This keeps WaveSurfer's
internals intact — we only intercept the output stage.

**Caveat**: once a media element is connected to a `MediaElementSourceNode`, its audio no longer
routes to the speakers by default — the `AudioContext` graph becomes the only output path. The
`GainNode → destination` connection handles this.

### AudioContext lifecycle

Browsers require a user gesture before an `AudioContext` can run. The context must be created or
resumed inside a user event handler (play button click, tab click, mix toggle). An `AudioContext`
created before interaction will be in `suspended` state; calling `context.resume()` on the first
interaction handles this.

### Fallback on error

If `createMediaElementSource` fails (e.g. CORS on the audio URL), log the error and fall back to
`setVolume(Math.min(1, linearVolume))` — the current clamped behavior. Playback still works, just
without boost.

---

## Changes Required

### `audio-player.js`

1. **Module-level** — add a lazily-initialized `AudioContext` singleton:
   ```js
   let audioCtx = null;
   function getAudioContext() {
     if (!audioCtx) audioCtx = new AudioContext();
     return audioCtx;
   }
   ```

2. **`gainToVolume`** — no change needed; it already returns the correct linear value. Remove the
   `Math.min(1, ...)` clamp once Web Audio is wired up.

3. **`loadTrackPair`** — after each `WaveSurfer.create()`, connect the node:
   ```js
   function connectGain(ws, linearGain) {
     try {
       const ctx = getAudioContext();
       ctx.resume();
       const source = ctx.createMediaElementSource(ws.getMediaElement());
       const gainNode = ctx.createGain();
       gainNode.gain.value = linearGain;
       source.connect(gainNode);
       gainNode.connect(ctx.destination);
       return gainNode;
     } catch (e) {
       console.warn('Web Audio unavailable, falling back to volume clamp', e);
       ws.setVolume(Math.min(1, linearGain));
       return null;
     }
   }
   ```

4. **State** — store the `GainNode` references (`roughGainNode`, `finalGainNode`) on `state` so
   they can be cleaned up in `destroyPair`.

5. **`destroyPair`** — disconnect and null out gain nodes alongside the WaveSurfer instances.

### `audio-player.test.js`

- Update `gainToVolume` tests: remove the `Math.min(1, ...)` clamp assertions; values like
  `gainToVolume(6)` should return `1.995` again, not `1`.
- Add unit tests for `connectGain` if it is extracted as a pure-ish function (requires mocking
  `AudioContext`).

### `src/content/config.ts`

No change — the schema range of −60 to +12 dB is already correct.

### `public/admin/config.yml`

No change.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| CORS blocks `createMediaElementSource` on cross-origin audio URLs | Catch the error, fall back to clamped `setVolume` |
| AudioContext suspended until interaction | Call `ctx.resume()` inside the play-button click handler |
| Double-connection if `loadTrackPair` is called twice on same element | `destroyPair` disconnects old nodes before recreating |
| Safari quirks with `MediaElementSourceNode` | Test on Safari; fallback path covers it |
| Clipping distortion at high gain values | User responsibility via CMS — the range cap (+12 dB) limits headroom |

---

## What Does Not Change

- WaveSurfer is still responsible for loading, decoding, seeking, and playback events
- The `roughOffset` silence-zone logic is untouched
- The `formatTime`, `playerTimeToFileTime`, `fileTimeToPlayerTime` helpers are untouched
- The CMS schema and content format are untouched
