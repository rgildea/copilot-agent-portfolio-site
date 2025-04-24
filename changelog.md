# Changelog

All notable changes to the portfolio site.

## April 24, 2025

- Fixed hero content alignment issue by adding text-align: center to ensure all elements are properly centered
- Improved hero section's visual consistency across different screen sizes

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
