# Ryan Gildea Audio Portfolio

A professional portfolio website showcasing my audio engineering, mixing, and production work.

## Overview

This responsive portfolio site features:
- Animated hero section with rotating background images
- Detailed services and project sections
- Interactive portfolio gallery
- Contact form with validation
- Social media integration
- Mobile-friendly design

## File Structure

- `index.html`: Main HTML content and structure
- `styles.css`: CSS styling with variables for easy customization
- `script.js`: JavaScript for interactivity and animations
- `images/`: Project images and backgrounds
  - `bg-image-mixing-desk.png`: Fixed background for the entire site
  - `hero-background.jpg`, `hero-background-2.jpg`, `hero-background-3.jpg`: Rotating hero images
  - `occo.png`: OCCO project thumbnail
  - `eons-past.png`: EONS PAST project thumbnail
  - `hornz.png`: HORNZ project thumbnail
  - `post-work-society.png`: POST-WORK SOCIETY project thumbnail
  - `jerzee.png`: JERZEE project thumbnail

## Features

### Styling and Design

- CSS variables for consistent color scheme and easy customization
- Responsive grid layouts that adapt to all screen sizes
- Smooth animations and transitions
- Fixed background with overlay effect

### JavaScript Features

- Smooth scrolling navigation
- Navbar transparency effect that changes on scroll
- Form validation with error handling
- Modular code organization with separate functions

## Customization

### Changing Colors

Modify the CSS variables in the `:root` section of `styles.css`:

```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  /* other variables */
}
```

### Adding New Projects

1. Add a new portfolio item in `index.html`:

```html
<div class="portfolio-item" id="new-project">
  <div class="portfolio-info">
    <h3>PROJECT NAME</h3>
    <p>Role, Type</p>
  </div>
</div>
```

1. Add corresponding CSS in `styles.css`:

```css
#new-project {
  background: linear-gradient(var(--overlay-dark), var(--overlay-dark)),
    url("images/new-project.png") no-repeat center center/cover;
}
```

1. Add the project image to the `images/` folder

## Browser Support

This site is compatible with all modern browsers including:

- Chrome
- Firefox
- Safari
- Edge
