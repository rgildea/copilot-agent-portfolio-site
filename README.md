# Ryan Gildea Portfolio

A modern lightweight static portfolio built with Astro and deployed on Netlify.

## Stack

- Astro (static output)
- Vanilla CSS + vanilla JavaScript
- Decap CMS (`/admin`) with GitHub backend
- Netlify Forms for contact submissions
- Playwright for visual testing

## Features

- Fast static build with minimal dependencies
- Markdown-driven portfolio content
- CMS editing through Decap with commits to source control
- Portfolio filtering (All, Client, Personal)
- Responsive synthwave-themed UI
- Netlify contact form with honeypot spam protection

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run Local Dev

```bash
npm run dev
```

Astro dev server runs at <http://localhost:4321> by default.

### Build

```bash
npm run build
```

Output is generated in `dist/`.

### Preview Production Build

```bash
npm run preview
```

## CMS

- CMS lives at `/admin`.
- Config file: `public/admin/config.yml`.
- Uses Decap CMS with GitHub backend, so edits create commits directly in the repository.

## Content Model

- Portfolio entries: `src/content/portfolio/*.md`
- Service entries: `src/content/services/*.md`
- About data: `src/data/about.json`
- Contact data: `src/data/contact.json`

## Key Paths

- Main page: `src/pages/index.astro`
- Layout: `src/layouts/Base.astro`
- Global styles: `public/css/main.css`, `public/css/synthwave.css`
- Client scripts: `public/js/script.js`
- Netlify config: `netlify.toml`

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`

## Testing

```bash
npm run test:visual
```

## Changelog

Project changes are tracked in `changelog.md`.
