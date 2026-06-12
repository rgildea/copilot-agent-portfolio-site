# CLAUDE.md

## Stack

- Astro (static output) — vanilla CSS + vanilla JS, no TypeScript
- Playwright visual tests (run against production build, not dev server)
- Decap CMS at `/admin`, GitHub backend
- Deployed on Netlify

## Commands

```bash
npm run dev          # dev server at localhost:4321
npm run build        # build to dist/
npm run serve        # serve production build at localhost:8080
npm run test:visual  # quick Playwright run (Chromium only)
npm run test:visual:full  # all browsers
```

Tests require a production build — `npm run serve` builds then serves. Always run `npm run build` before running tests manually if the build is stale.

## Content

- Portfolio entries: `src/content/portfolio/*.md`
- Services: `src/content/services/*.md`
- About/Contact data: `src/data/*.json`

## Key Files

- Page: `src/pages/index.astro`
- Layout: `src/layouts/Base.astro`
- Styles: `public/css/main.css`, `public/css/synthwave.css`
- Scripts: `public/js/script.js`
- CMS config: `public/admin/config.yml`

# Coding Standards & Rules for Editing
- NEVER change the core stack without asking the user.
- ALWAYS run the build and a full test run before committing.
- ALWAYS do new work in a new branch, unless the user requests otherwise.
