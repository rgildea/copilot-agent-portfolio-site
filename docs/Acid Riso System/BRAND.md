# ACID RISO — Brand System

**Ryan Gildea · Mix / Master / Produce**
A gritty, neo-psychedelic identity for a boutique mix & master studio that serves experimental, indie-psych and neo-psychedelia artists. The promise — *wide and lush, not flat and crowded* — is mirrored in the design: a loud, tactile, off-register surface over a clean, disciplined structure.

> **Read this first.** It's the rulebook. Styling values live in `design-tokens.css` / `tokens.json`; fonts in `fonts.css`; a working reference build in `hero.html`. The full visual guidelines page is `Design System v2.dc.html` (built for a specific design tool — keep it as the canonical visual reference / for screenshots; it won't render in a plain browser).

---

## 1. The idea in one line
**Clean bones, loud skin.** The information architecture is strict and legible — a structured grid, mono labels, clear hierarchy. All the psychedelia lives in the *surface*: spot inks, halftone, misregistration, and living grain. A first-time visitor never gets lost; they just feel that this studio gets weird, deep, washy music.

---

## 2. Logo / wordmark
- The wordmark is **"RYAN GILDEA"** (or the **RG** monogram) set in **Anton**, all caps, printed **off-register**: a pink and a teal ghost offset ±3px behind a bone copy.
- CSS: apply the `.riso-misreg` utility, or stack three copies (teal + pink ghosts `mix-blend-mode: screen`, bone on top) for the richer overlap.
- Clear space: at least the cap-height of the mark on all sides. Never add a second effect (glow, bevel, outline) — the misregister *is* the treatment.
- Don't: re-color the ghosts arbitrarily, center the offset (it must read as a print slip), or set the mark in any other typeface.

---

## 3. Color
Warm **ink-black** grounds everything. Three flat fluoro **spot inks** do the talking — used at full strength, never tinted or gradient-filled. Mixing happens through **halftone overprint**, not opacity.

| Role | Token | Hex |
|------|-------|-----|
| Page ground | `--ink` | `#16130E` |
| Deep panel | `--ink-2` | `#1B170F` |
| Card surface | `--surface` | `#211C13` |
| Raised | `--surface-2` | `#2A2417` |
| Hover | `--surface-3` | `#332B1C` |
| **Primary ink** (play, active, CTA) | `--ink-pink` | `#FF3D7F` |
| **Secondary ink** (links, final-mix, outlines) | `--ink-teal` | `#1FB89C` |
| **Accent ink** (punctuation only) | `--ink-yellow` | `#F2D43C` |
| Text — bone | `--text` | `#ECE6D8` |
| Text — muted | `--text-muted` | `#C4BEAE` |
| Text — faint (labels) | `--text-faint` | `#8A8270` |

**Rules**
- Pink leads, teal supports, yellow only punctuates (a badge, a single dot, a highlight). If everything's yellow, nothing is.
- One primary action per view.
- Never gradient a spot ink to create a new color. To blend, overprint halftone dots.
- Text is bone on ink; never pure white, never pure black.

---

## 4. Typography
Three voices, all on Google Fonts (see `fonts.css`).

| Voice | Family | Use |
|-------|--------|-----|
| Display | **Anton** (400, UPPER) | Poster headlines. Tracking +0.5. The shout. |
| Body / UI | **Hanken Grotesk** (400–700) | Everything readable. Tracking 0. |
| Data | **Space Mono** (400/700, UPPER) | Times, LUFS, labels, captions. Tracking +1.5. |

**Scale**

| Step | Font / size |
|------|-------------|
| Poster XL | Anton 96 UPPER |
| Poster L | Anton 56 UPPER |
| Heading | Hanken 700 · 20 |
| Body L | Hanken 400 · 18 / 1.6 |
| Body | Hanken 400 · 16 / 1.65 |
| Mono label | Space Mono 400 · 12 / +1.5 |

Headlines are short and loud — two or three words. Let Anton carry the volume so the body can stay calm.

---

## 5. The signature: texture & print
The look is a three-layer stack, all pure CSS / SVG (no image files — crisp at any size). Order matters.

1. **CMYK halftone** — three offset radial-dot screens (pink / teal / yellow) on a 9px grid, `screen`-blended. Utility: `.riso-print`.
2. **Misregistration** — color channels offset ±3px (`--misregister`). Utility: `.riso-misreg`.
3. **Living grain** — animated `feTurbulence` noise, `overlay` at .20, **stepped** (`steps(3)`, 1s) so it shimmers like running film — never a static stamp. Utility: `.riso-grain`.

Use the full stack on hero bands and full-bleed sections. On dense UI, dial it back — let content breathe. The grain is the one always-on motion in the whole system.

---

## 6. Components
- **Buttons** — hard-edged, 4px radius. Primary = solid pink on ink with a hard offset shadow (`--shadow-hard`); hover nudges the shadow to 2px. Secondary = 1.5px teal outline, fills teal 10% on hover. Text link = teal with a 2px underline.
- **Tags & filters** — mono caps. Badges: `CLIENT` = solid yellow chip; `PERSONAL` = pink outline chip. Filter pills: active fills solid teal, rest are teal outlines (4px radius — pills only for the A/B toggle).
- **Project cards** — image-led, duotone-halftone photo (`.riso-duotone`), info on a solid ink band. Hover lifts onto a hard pink offset (`--shadow-pink-soft`) and the spot border lights.
- **Forms** — inputs on `--surface` with a hairline; focus lights the border pink with a hard offset (`--shadow-pink` soft), no glow. 4px radius.
- **Waveform player** *(carried over from the old site — the signature interaction)* — artist header, per-track tabs, an **A/B rough-vs-final** toggle (teal), and hard-edged bars. Played samples are solid pink; the rest muted bone. Bars have 0 radius — square, like a meter.
- **Navigation** — flat bar, transparent over the hero; on scroll it gains a solid ink ground, a hairline, and the misregistered wordmark.

---

## 7. Imagery
Push every photo through a two-ink press: **duotone to pink + teal, halftone screen, registered a hair off.** Never drop a clean full-color image onto the page.
- **Do** — duotone + halftone; misregistered Anton type straight on the photo.
- **Don't** — untreated/full-color photos, warm "lifestyle" grades, or any photo with no halftone.

**Two ways to treat a photo:**
1. **Live, in-browser (recommended)** — use the `.riso-photo` component (see `design-tokens.css` / `hero.html`). Give it a normal `<img>` and CSS does the duotone (shadows&nbsp;→&nbsp;teal, highlights&nbsp;→&nbsp;pink) and the halftone screen automatically — no pre-processing, and it re-treats instantly when you swap the file. Flip the duotone by swapping the two colors in `.rp-shadow` / `.rp-highlight`. It's ~90% of a hand-done duotone; the source should have a full tonal range (true blacks to whites) for the cleanest result.
2. **Baked in an editor** — for hero/marquee shots where you want pixel control, duotone in Photoshop/Affinity (map shadows → teal `#1FB89C`, highlights → pink `#FF3D7F`), export, then add the halftone with `.rp-screen` or in-editor.

There is no automated build-step pipeline — treatment is either the live CSS component or a manual editor pass. Pick per image.

---

## 8. Depth & motion
- **Depth** = hard offset shadows + solid spot-ink borders. **No glow, no blur shadows.** Flat and printed.
- **Radius** stays hard (0 / 4 / 6). Pills are reserved for the A/B toggle.
- **Motion** is quick and physical: micro-interactions 120ms; card lift 160ms ease-out; hero photo crossfade ~2s (≈9s hold). The film grain shimmers continuously at `steps(3)` / 1s.

---

## 9. Voice (visual tone)
Underground, confident, technical. Show-poster energy, not corporate polish. Mono labels and real numbers (`−14 LUFS`, `3:18`) signal craft. When in doubt: louder surface, calmer structure.

---

## Files
| File | Purpose |
|------|---------|
| `BRAND.md` | This rulebook. Read first. |
| `design-tokens.css` | CSS custom properties + signature texture utilities. Source of truth for styling. |
| `tokens.json` | Same tokens as structured JSON (build tools / Tailwind / Style Dictionary). |
| `fonts.css` | `@import` + `<link>` snippet for Anton, Hanken Grotesk, Space Mono. |
| `hero.html` | Self-contained, framework-free reference build (hero + live duotone imagery + waveform player). Open in a browser; use as the starting component. |
| `sample-photo.jpg` | Grayscale demo shot for the `.riso-photo` component. Swap for your own. |
| `Design System v2.dc.html` | Full visual guidelines page — canonical reference / screenshots. Won't render in a plain browser. |
