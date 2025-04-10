# Changelog

All notable changes to the portfolio site will be documented in this file.

## April 10, 2025

### Added
- Added Lazer84 font for the name in hero section to match original site styling
- Created dedicated hero-font.css file for specialized name styling
- Added unit tests for date filter function to prevent future regressions

### Changed
- Updated .gitignore to exclude test results, Playwright reports, and other test artifacts
- Fixed visual tests to match new Eleventy-generated HTML structure
- Improved README.md with comprehensive documentation on project structure, testing, portfolio management, and styling
- Enhanced hero name with 80s retro styling including neon glow effect and slight rotation
- Updated font declaration to use WOFF2 format for better web performance
- Standardized CSS quote style for font-family references
- Applied Lazer84 font to the navigation logo/initials for consistent branding

### Fixed
- Fixed failing navigation tests by updating selectors to match new href format
- Fixed portfolio tests to use correct IDs for portfolio items
- Added tests for new portfolio filtering functionality
- Resolved font display issues with Lazer84 by improving font-face implementation
- Fixed case sensitivity issues in font file references
- Fixed footer showing "NaN" instead of the current year by improving the date filter

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
