# Homepage Copy Restructure

## Overview

Restructure the homepage around new priority copy — a new Hero headline/sub-headline, a "Here's What I Can Do For You" services section, and a "How We Will Work Together" process section — while keeping existing content (About, Listen, Portfolio, Contact) accessible further down the page.

## Final Page Order

Hero → Services ("Here's What I Can Do For You") → Process ("How We Will Work Together") → Listen → Portfolio → About → Contact.

About's bio/skills content is unchanged, just moved lower on the page.

## Hero (`src/pages/index.astro`, new `src/data/hero.json`)

- Keep the eyebrow line and `<h1>Ryan Gildea</h1>` unchanged.
- Replace the current `<h2>Music Production | Mixing | Mastering</h2>` with:
  - `<h2>` = headline from `hero.json`
  - `<p>` = sub-headline from `hero.json`
- `src/data/hero.json`:
  ```json
  {
    "headline": "Helping Unique Artists Create Vibrant Mixes That Stand Out.",
    "subheadline": "My mixes give your song a lush, warm, and immersive atmosphere without the need for endless revisions."
  }
  ```
- CTAs unchanged except secondary button label: "Hear the Work" → "Hear The Difference" (href stays `#listen`).
- Wired into Decap CMS as a new file entry under the existing "settings" collection (same pattern as `about.json`/`contact.json`).

## Services Section — "Here's What I Can Do For You"

New section, `id="services"`, placed immediately after Hero.

### Section copy (`src/data/services-section.json`)

```json
{
  "headline": "Here's What I Can Do For You",
  "subheadline": "All-in-one mixing and mastering that gets you from rough mix to release faster and easier than doing it yourself.",
  "showInNav": true,
  "navLabel": "Services"
}
```

Wired into Decap CMS "settings" collection.

### Service cards — repurposed `services` content collection

Schema change in `src/content/config.ts` and `public/admin/config.yml`:
- `description: string` → `intro: string` + `bullets: string[]` (optional)

Entries in `src/content/services/`:
- Delete `music-production.md` (dropped — not part of new copy).
- `audio-mixing.md` → **Mixing**
  ```yaml
  title: Mixing
  icon: fa-sliders-h
  intro: "I'll transform your rough tracks into impactful, professional releases without losing the unique and distinctive energy that defines your sound."
  bullets:
    - "Your mixes will stand alongside the best in your genre"
    - "Stop apologizing for self-produced production quality and take your music to the next level"
  order: 1
  ```
- New `mastering.md` → **Mastering**
  ```yaml
  title: Mastering
  icon: fa-volume-up
  intro: "I can master your tracks to enhance depth and clarity, to ensure they translate on any system."
  bullets:
    - "Your masters will sound loud without being squashed"
    - "Dynamic and detailed without being crowded"
  order: 2
  ```
- `vocal-or-instrument-tuning.md` → **Vocal or Instrument Tuning**
  ```yaml
  title: Vocal or Instrument Tuning
  icon: fa-wave-square
  intro: "I can edit and tune your tracks to your liking."
  order: 3
  ```
  (no `bullets` — field is optional)

Cards render using the existing card visual language from the Acid Riso system (ink info band, hard offset shadow on hover) — same treatment already used for portfolio cards, not a new component system.

## Process Section — "How We Will Work Together"

New section, `id="process"`, placed immediately after Services, before Listen.

### `src/data/process.json`

```json
{
  "headline": "How We Will Work Together",
  "showInNav": true,
  "navLabel": "Process",
  "steps": [
    {
      "headline": "Step 1. Understand Your Vision",
      "description": "We'll have a voice or video call to help me understand your sonic identity and your goals for the project"
    },
    {
      "headline": "Step 2. Create A First Mix Quickly",
      "description": "I will get you an initial mix quickly, so you can give feedback early. Then we can work together to polish the track to your liking. No surprises, no disappointment, just quick, prompt, unlimited revisions, to ensure you're satisfied."
    },
    {
      "headline": "Step 3. Mastering (optional)",
      "description": "I'll finalize your tracks to give them loudness and clarity without losing depth and bring out the color in your mix. If you prefer to use your own mastering engineer, that's fine. No worries, and no hard sales pitches."
    },
    {
      "headline": "Step 4. I'll Deliver Your Project On-Time",
      "description": "You'll get your final mixes or masters and any versions or stems that you need quickly and on-time."
    }
  ]
}
```

Wired into Decap CMS "settings" collection with `steps` as a `list` widget (headline + description fields).

Rendered as a simple numbered/vertical sequence of 4 steps using existing type/spacing tokens — no new interactive component.

## Nav (`src/layouts/Base.astro`)

- New nav order: Services, Process, Work, About, Contact (plus the existing "Get Started" CTA button, unchanged).
- "Work" replaces the separate Listen/Portfolio links with a single link, combining both under one anchor:
  - Points to `#listen` when the Listen section renders (reusing the existing `hasListenSection` prop), otherwise `#portfolio`.
- Services and Process nav links are conditionally rendered based on their `showInNav` flag from `services-section.json` / `process.json`, following the same conditional pattern `hasListenSection` already establishes for Listen. `index.astro` passes these flags as props to `Base.astro`, same as `hasListenSection` today.

## Out of Scope

- Visual redesign of card/step components beyond applying existing Acid Riso tokens — no new component system.
- CMS-editable `showInNav` flags for About/Contact/Work — these remain fixed/always-shown, consistent with today's behavior.
- Changes to About bio/skills content, Listen, Portfolio, or Contact section content — only their position on the page changes.
- Automating image/icon selection for new service cards — icons chosen manually to match existing Font Awesome icon convention.
