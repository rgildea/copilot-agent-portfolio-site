# Ryan Gildea - Audio Engineering Portfolio

A professional portfolio website built with Eleventy and Netlify CMS to showcase my audio engineering, mixing, and production work.

## Features

- Responsive design showcasing portfolio work
- Content management with Netlify CMS
- Fast static site generation with Eleventy
- Portfolio filtering by client work and personal projects
- Contact form with Netlify Forms integration
- Image management through Uploadcare
- CSS variables for consistent styling
- Hover effects and smooth animations
- Easily deployable to Netlify

## Development

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Local Development

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. Visit <http://localhost:8080>

### CMS Access

The CMS is available at `/admin` and uses Netlify Identity for authentication.

To run the local CMS proxy server:

```bash
npm run dev:cms
```

### Testing

The project includes both unit and visual tests:

#### Running Unit Tests

```bash
npm test
```

#### Running Visual Tests

```bash
npm run test:visual
```

## Deployment

This site is configured for easy deployment on Netlify:

1. Push to your GitHub repository
2. Connect the repository to Netlify
3. Configure the build settings (already defined in netlify.toml)
4. Enable Netlify Identity for CMS access
5. Invite users to manage content

## Project Structure

- `src/`: Source files for the site
  - `_data/`: JSON data files for site content
  - `_includes/`: Reusable template components
  - `_layouts/`: Page layouts
  - `admin/`: Netlify CMS configuration
  - `js/`: JavaScript files
  - `portfolio/`: Portfolio item content (markdown files)
  - `services/`: Service description content (markdown files)
- `images/`: Image assets
- `tests/`: Test files
  - `unit/`: Jest unit tests
  - `visual/`: Playwright visual tests
- `.eleventy.js`: Eleventy configuration
- `netlify.toml`: Netlify deployment configuration
- `jest.config.js`: Jest configuration
- `playwright.config.js`: Playwright configuration

## Styling

The site uses a consistent color scheme defined with CSS variables:

```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  --text-color: #333;
  --light-text: #f4f4f4;
  --background: #fff;
  --light-bg: #f9f9f9;
  --dark-bg: #2c3e50;
  --overlay-dark: rgba(0, 0, 0, 0.5);
  --overlay-light: rgba(255, 255, 255, 0.92);
}
```

## Portfolio Management

Portfolio items are categorized as either client work or personal projects. Each portfolio item is defined in its own markdown file in the `src/portfolio/` directory with front matter for metadata.

The portfolio filtering feature allows visitors to filter projects by:
- All Projects
- Client Work
- Personal Projects

## Image Management

Images are hosted and optimized through Uploadcare, with references stored in the portfolio markdown files. The site includes a helper script (`uploadcare-backfill.js`) for managing image uploads.

## Changelog

All site modifications are tracked in the `changelog.md` file.

## License

© 2025 Ryan Gildea. All rights reserved.
