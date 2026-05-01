# Changelog

## [May 1, 2026]

### Changed

- `src/admin/config.yml`: Switched CMS backend from `git-gateway` to `github` with Netlify OAuth (`base_url`, `auth_endpoint`). Reformatted YAML fields for consistency.
- `playwright.config.js`: Added quick mode (`PW_QUICK=1`) to run only Chromium with one worker and line reporter for fast local debug loops.
- `playwright.config.js`: Added explicit test and web server timeouts with piped server logs to make startup hangs easier to diagnose.
- `package.json`: Added `test:visual:quick` and `test:visual:debug` scripts for faster local verification and debugging.

### Changed

- Rewrote the site from Eleventy to Astro for a simpler, lighter static build pipeline.
- Migrated content to Astro content collections under `src/content/`.
- Migrated static assets to `public/` and updated Netlify output to `dist`.
- Replaced Netlify CMS setup with Decap CMS files under `public/admin/`.

### Fixed

- Contact form now actually submits to Netlify Forms via `fetch` POST instead of just showing an alert
- Button changes to "Message Sent!" and disables briefly on success, then resets after 4 seconds
- Added error fallback message if the network request fails
- Added Netlify honeypot field (`bot-field`) to reduce spam form submissions
- Restored portfolio card grid and image fitting by aligning Astro markup to existing CSS and filter JS selectors
- Restored Markdown rendering for About bio content in Astro

## [April 28, 2025]

### Fixed

- Navigation links are now always clickable, even when the page is at the top position
- Added proper pointer-events handling to ensure interactive elements work correctly
- Fixed z-index issues with navbar elements
- Added subtle highlighting to navigation links when at top of page for improved usability

## April 27, 2025

- Fixed issue with non-clickable navigation links:
  - Increased z-index values for navbar (1001) and nav links (1002, 1003) to ensure they're above all other elements
  - Added explicit position: relative to establish stacking context for navigation elements
  - Added padding to nav links to increase clickable area
  - Ensured all synthwave overlay elements have pointer-events: none to prevent them from blocking clicks
  - Lowered z-index of decorative elements to prevent interaction conflicts

## April 25, 2025

- Refined breakpoint system with updated variables:
  - Added new `--breakpoint-xxs` (360px) for extra small mobile devices
  - Updated media query comments to accurately describe breakpoint ranges
  - Ensured all media queries use CSS variables for consistent breakpoints
  - Reclassified breakpoint comments with accurate size descriptions
  - Fixed inconsistent media query implementations

- Refactored CSS media queries to use defined breakpoint variables
- Substituted hardcoded breakpoint values with CSS variables for improved maintainability
- Implemented consistent naming convention for responsive breakpoints

## April 24, 2025

- Optimized Spotify player to maximize viewport utilization:
  - Removed fixed height in favor of viewport-relative sizing (60vh base height)
  - Created responsive viewport-based sizing across all breakpoints
  - Added max-height constraint to prevent excessive sizing on large screens
  - Improved player display on all device sizes from desktop to mobile
  - Ensured consistent spacing and proportions across all viewports
- Improved responsive design across all devices:
  - Made Spotify player height dynamically responsive based on screen size:
    - Desktop: 352px height for full playlist visibility
    - Small desktop/large tablet (992px): 300px height
    - Tablet/large phones (768px): 250px height
    - Small phones (480px): 180px height
    - Extra small phones (360px): 152px height
  - Added proper responsive font sizing using clamp() for better text scaling
  - Fixed spacing between navbar and hero content on all screen sizes
  - Set fixed position for hero backgrounds to prevent display issues
  - Added appropriate top padding to the hero section for consistent spacing
  - Fixed issue where hero content was underlapping the menu on desktop
  - Added extra breakpoint for very small devices (360px and below)
  - Improved vertical spacing and layout balance on mobile devices
- Fixed hero content alignment issue by adding text-align: center to ensure all elements are properly centered

## April 23, 2025

- Removed unused styles across CSS files:
  - Deleted the redundant `.logo` class from hero-font.css
  - Consolidated duplicate hero background styles in main.css
  - Simplified CSS animations with compressed keyframe syntax
  - Removed duplicate WebP image styles with cleaner selectors
  - Optimized media queries by merging duplicated rules
- Fixed module format conflicts between Jest and Eleventy configurations
- Renamed jest.config.js to jest.config.cjs for CommonJS compatibility
- Improved date-filter test to properly mock Eleventy configuration
- Rewrote navbar implementation with simple, reliable layout management
- Fixed navbar title animation with height-based transitions instead of transforms
- Consolidated and removed conflicting CSS styles across files
- Implemented "zero space" approach for the title when hidden
- Improved mobile responsiveness and spacing

## April 22, 2025

### Changed

- Removed "RTG" logo from the navigation bar
- Added navbar-title placeholder element for the animated hero text
- Removed redundant base.njk file from \_includes directory to avoid template confusion
- Restructured mobile navbar with navbar-mobile-wrapper for better vertical alignment
- Simplified JavaScript by removing unused hero-name-fixed classes and related code

### Added

- Implemented IntersectionObserver API to detect scroll position instead of scroll events
- Created invisible sentinel element at scroll threshold position for reliable detection
- Added fixed "Ryan Gildea" element that appears in navbar when scrolling past threshold
- Added extensive console logging for debugging observation events
- Added persistent navbar background on mobile for better readability

### Fixed

- Replaced unreliable scroll events with more modern IntersectionObserver
- Simplified animation with direct DOM manipulation
- Used absolute positioning for sentinel element to ensure consistent detection
- Fixed navbar title appearance during scroll with opacity transitions
- Fixed template confusion by consolidating to a single base.njk file
- Fixed vertical alignment of navbar elements
- Improved mobile spacing in the navbar layout
- Centered the animated logo on screen properly
- Fixed excessive spacing between the page top and menu buttons on mobile
- Fixed mobile header height issues with better CSS structure
- Improved mobile menu appearance by placing it above the hero image
- Added proper spacing to accommodate hero title above menu text on mobile
- Fixed empty navbar-title taking up space when not visible using display:none
- Cleaned up unused hero-name-fixed classes from CSS and JavaScript

## April 21, 2025

### Changed

- Removed "RTG" logo from the navigation bar
- Added navbar-title placeholder element for the animated hero text
- Removed redundant base.njk file from \_includes directory to avoid template confusion

### Added

- Implemented IntersectionObserver API to detect scroll position instead of scroll events
- Created invisible sentinel element at scroll threshold position for reliable detection
- Added fixed "Ryan Gildea" element that appears in navbar when scrolling past threshold
- Added extensive console logging for debugging observation events

### Fixed

- Replaced unreliable scroll events with more modern IntersectionObserver
- Simplified animation with direct DOM manipulation
- Used absolute positioning for sentinel element to ensure consistent detection
- Fixed navbar title appearance during scroll with opacity transitions
- Fixed template confusion by consolidating to a single base.njk file
- Fixed vertical alignment of navbar elements
- Improved mobile spacing in the navbar layout
- Centered the animated logo on screen properly
- Fixed excessive spacing between the page top and menu buttons on mobile

## April 21, 2025

### Fixed

- Fixed Threads and Bluesky social media icons display issues
- Improved icon centering in social media circular containers

### Improved

- Enhanced social icon alignment with absolute positioning for perfect centering
- Added proper transform positioning for consistent icon display across browsers

## April 20, 2025

- Enhanced hero background carousel with smoother 2-second crossfades
- Fixed navigation tests with proper mocks for scrollIntoView

## April 11, 2025

### Changed

- Toned down the synthwave design while preserving the core aesthetic
- Reduced opacity and visibility of the grid overlay from 0.7 to 0.3
- Slowed down grid animation from 15s to 30s for less distraction
- Reduced the size and opacity of the sun element
- Simplified the horizon line with reduced glow effect
- Decreased text shadow intensity throughout the site
- Updated color palette to use more muted, less neon versions of the synthwave colors
- Reduced the intensity of hover effects and transitions
- Removed blinking and flickering animations
- Simplified neon text effects with fewer shadow layers
- Made background elements more transparent
- Reduced card hover transform effects for more subtle interactions
- Removed parallax effect for hero text while scrolling
- Added subtle opacity to the synthwave wrapper
- Simplified and softened all glow effects
- Removed rotation effects from text elements

### Improved

- Better readability with reduced text shadows
- More professional appearance while keeping the synthwave theme
- Less distracting animations for improved user experience
- More subtle color scheme while maintaining the synthwave palette
- Cleaner overall visual design with fewer overwhelming effects

## April 10, 2025

- Added Lazer84 font for hero name with retro styling
- Created dedicated CSS files for specialized styling
- Implemented synthwave background with perspective grid
- Added sticky header animation during scroll
- Fixed visual tests to match new HTML structure

## April 9, 2025

### Added

- Added personal music projects (LEFT HAND DOES and NATURE CREEPS BENEATH) to the portfolio
- Added visual badge for personal projects to differentiate them from client work
- Added CSS styling for personal project badges
- Added portfolio filtering functionality to toggle between all projects, client work, and personal projects

### Changed

- Removed podcast portfolio tile to focus on music production projects
- Updated corresponding CSS and documentation

### Improved

- Reorganized JavaScript code into modular functions for better maintainability
- Added CSS variables for overlays to ensure consistent styling
- Updated portfolio image references to use PNG format consistently
- Enhanced README with comprehensive documentation and customization guide
- Fixed missing podcast image reference
- Improved code formatting and organization throughout the codebase
- Added descriptive comments for easier future maintenance

## April 8, 2025

### Added

- Created initial portfolio site structure with HTML, CSS, and JavaScript
- Added responsive layout with mobile-friendly design
- Implemented sections: About, Services, Portfolio, and Contact
- Added form validation for the contact form
- Created smooth scrolling navigation
- Implemented navbar transparency effect on scroll
- Added hover effects for interactive elements
- Integrated Font Awesome icons for visual elements
- Added Google Fonts: Montserrat and Open Sans
- Added specific project information for OCCO, EONS PAST, HORNZ, POST-WORK SOCIETY, and JERZEE
- Enhanced About Me section with more detailed professional background
- Added comprehensive Services section with six service offerings
- Included social media links to professional profiles
- Added unique background images for each portfolio project
- Implemented rotating hero background images with smooth transitions
