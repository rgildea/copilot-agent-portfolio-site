// Portfolio site JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all main components
  console.log("DOM loaded - initializing components");
  initNavbar();
  initSmoothScrolling();
  initContactForm();
  initPortfolioFilter();
  initStickyHeaderAnimation();
  initGridOverlay();

  console.log("Portfolio site loaded successfully!");
});

// Navigation scroll effect
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const scrollThreshold = 100;

  window.addEventListener("scroll", function () {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });
}

// Portfolio filtering
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      // Filter items
      portfolioItems.forEach((item) => {
        if (filterValue === "all") {
          item.style.display = "block";
        } else if (
          filterValue === "personal" &&
          item.classList.contains("personal-project")
        ) {
          item.style.display = "block";
        } else if (
          filterValue === "client" &&
          item.classList.contains("client-project")
        ) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
}

// Contact form validation and submission
function initContactForm() {
  const contactForm = document.querySelector(".contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    let isValid = true;

    // Validate form fields
    if (name === "") {
      showError("name", "Please enter your name");
      isValid = false;
    }

    if (email === "") {
      showError("email", "Please enter your email");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError("email", "Please enter a valid email");
      isValid = false;
    }

    if (message === "") {
      showError("message", "Please enter your message");
      isValid = false;
    }

    if (isValid) {
      // In a real application, you would send the form data to a server
      alert(
        "Form submitted successfully! (This is a demo - no data was actually sent)"
      );
      contactForm.reset();
    }
  });
}

// Helper functions for form validation
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.textContent = message;
  errorMessage.style.color = "var(--accent-color)";
  errorMessage.style.fontSize = "0.8rem";
  errorMessage.style.marginTop = "5px";

  // Remove any existing error messages
  const existingError = input.parentElement.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  input.parentElement.appendChild(errorMessage);

  // Highlight the input field
  input.style.borderColor = "var(--accent-color)";

  // Remove error styling when input changes
  input.addEventListener(
    "input",
    function () {
      input.style.borderColor = "";
      const error = input.parentElement.querySelector(".error-message");
      if (error) {
        error.remove();
      }
    },
    { once: true }
  );
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sticky header animation with enhanced debugging
function initStickyHeaderAnimation() {
  console.log("🔍 ANIMATION DEBUG - Starting initialization");

  // Get DOM elements
  const heroName = document.getElementById("hero-name");
  const stickyHeader = document.getElementById("sticky-header");
  const stickyName = document.getElementById("sticky-name");
  const heroSection = document.querySelector(".hero");
  const navbar = document.querySelector(".navbar");

  // Check if elements exist
  if (!heroName) {
    console.error(
      "❌ ERROR: heroName element not found! Make sure you have an element with id='hero-name'"
    );
    return;
  }

  if (!stickyHeader) {
    console.error(
      "❌ ERROR: stickyHeader element not found! Make sure you have an element with id='sticky-header'"
    );
    return;
  }

  if (!stickyName) {
    console.error(
      "❌ ERROR: stickyName element not found! Make sure you have an element with id='sticky-name'"
    );
    return;
  }

  if (!heroSection) {
    console.error(
      "❌ ERROR: heroSection element not found! Make sure you have a section with class='hero'"
    );
    return;
  }

  // All essential elements found
  console.log("✅ All animation elements found");

  // Add visual indicators to elements for debugging
  heroName.style.outline = "2px solid magenta";
  stickyName.style.outline = "2px solid magenta";

  // Get navbar height for positioning calculations
  const navbarHeight = navbar ? navbar.offsetHeight : 70;

  // Calculate the total scroll distance over which the animation should occur
  const heroHeight = heroSection.offsetHeight;
  const animationDistance = heroHeight - navbarHeight;

  console.log(
    `📏 Animation will occur over ${animationDistance}px of scrolling`
  );

  // Initial opacity for sticky name
  stickyName.style.opacity = "0";

  // Add a visual debug overlay
  const debugElement = document.createElement("div");
  debugElement.id = "animation-debug";
  debugElement.style.position = "fixed";
  debugElement.style.top = "100px";
  debugElement.style.right = "10px";
  debugElement.style.background = "rgba(0,0,0,0.7)";
  debugElement.style.color = "#ff00ff";
  debugElement.style.padding = "10px";
  debugElement.style.borderRadius = "5px";
  debugElement.style.zIndex = "9999";
  debugElement.style.fontSize = "14px";
  debugElement.style.fontFamily = "monospace";
  document.body.appendChild(debugElement);

  // Set up scroll event listener
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const progress = Math.min(1, scrollY / animationDistance);

    // Update debug info
    debugElement.innerHTML = `
      ScrollY: ${scrollY.toFixed(0)}px<br>
      Progress: ${progress.toFixed(2)}<br>
      Hero opacity: ${(1 - progress).toFixed(2)}<br>
      Animation distance: ${animationDistance}px
    `;

    // Apply transformations as soon as scrolling begins
    if (scrollY > 0) {
      // Show sticky header once we start scrolling
      stickyHeader.classList.add("visible");

      // Scale hero name from 1 down to 0.5 as we scroll
      const finalScale = 0.5;
      const scaleFactor = 1 - (1 - finalScale) * progress;

      // Calculate target position - move from original position to navbar position
      const translateY = -scrollY * 0.5; // Moves at half the speed of the scroll

      // Apply transform to hero name - a combination of scaling and position
      const transformValue = `scale(${scaleFactor}) translateY(${translateY}px)`;
      heroName.style.transform = transformValue;

      // Hero name opacity decreases as we scroll
      heroName.style.opacity = (1 - progress).toFixed(2);

      // Sticky name opacity increases as we scroll
      stickyName.style.opacity = progress.toFixed(2);

      // Occasional debug logging
      if (scrollY % 100 < 2) {
        console.log(
          `🔄 SCROLL: ${scrollY.toFixed(0)}px, Progress: ${progress.toFixed(2)}`
        );
      }
    } else {
      // Reset styles when at the top
      stickyHeader.classList.remove("visible");
      heroName.style.transform = "scale(1) translateY(0)";
      heroName.style.opacity = "1";
      stickyName.style.opacity = "0";
    }
  });

  console.log("✅ Animation setup complete - scroll to see effects");
}

// Initialize grid overlay
function initGridOverlay() {
  const body = document.body;

  // Check if grid overlay already exists
  if (!document.querySelector(".grid-overlay")) {
    const gridOverlay = document.createElement("div");
    gridOverlay.className = "grid-overlay";
    body.appendChild(gridOverlay);
  }
}
