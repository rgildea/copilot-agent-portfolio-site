# Ryan Gildea - Audio Engineering Portfolio

A professional portfolio website built with Eleventy and Netlify CMS to showcase my audio engineering, mixing, and production work.

## Features

- Responsive design showcasing portfolio work
- Content management with Netlify CMS
- Fast static site generation with Eleventy
- Contact form with Netlify Forms integration
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
  - `portfolio/`: Portfolio item content
  - `services/`: Service description content
- `images/`: Image assets
- `.eleventy.js`: Eleventy configuration
- `netlify.toml`: Netlify deployment configuration
