// Portfolio site JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all main components
  console.log("DOM loaded - initializing components");
  initNavbar();
  initSmoothScrolling();
  initContactForm();
  initPortfolioFilter();
  initStickyHeaderAnimation();
  initScrollIndicator(); // Added missing scroll indicator functionality
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

// Scroll indicator functionality (added from the root script.js)
function initScrollIndicator() {
  const scrollIndicator = document.querySelector(".scroll-indicator");

  if (scrollIndicator) {
    console.log("✅ Scroll indicator found, setting up click handler");
    scrollIndicator.addEventListener("click", function () {
      const aboutSection = document.querySelector("#about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  } else {
    console.log("ℹ️ No scroll indicator found in the document");
  }
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

// Sticky header animation with improved calculations
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

  // IMPROVED: Add visual indicators to elements for better visibility during debugging
  heroName.classList.add("debug-highlight");
  heroName.setAttribute("id", "hero-name");

  stickyName.classList.add("debug-highlight");
  stickyName.setAttribute("id", "sticky-name");

  // Get navbar height for positioning calculations
  const navbarHeight = navbar ? navbar.offsetHeight : 70;

  // IMPROVED: Calculate the animation parameters
  // Instead of using the entire hero height, use a smaller fraction for a more responsive animation
  const heroHeight = heroSection.offsetHeight;
  const animationStartPoint = 10; // Start animation as soon as we scroll 10px
  const animationDistance = Math.min(heroHeight * 0.6, 300); // Use 60% of hero height or 300px, whichever is smaller

  console.log(
    `📏 Animation will occur over ${animationDistance}px of scrolling (starting at ${animationStartPoint}px)`
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

  // IMPROVED: Trigger an initial scroll event to ensure everything is properly set up
  setTimeout(() => {
    window.dispatchEvent(new Event("scroll"));
    console.log("🔄 Initial scroll event dispatched");
  }, 100);

  // Set up scroll event listener with improved calculations
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // IMPROVED: Calculate progress starting after a small threshold
    const effectiveScroll = Math.max(0, scrollY - animationStartPoint);
    const progress = Math.min(1, effectiveScroll / animationDistance);

    // Update debug info
    debugElement.innerHTML = `
      ScrollY: ${scrollY.toFixed(0)}px<br>
      EffectiveScroll: ${effectiveScroll.toFixed(0)}px<br>
      Progress: ${progress.toFixed(2)}<br>
      Hero opacity: ${(1 - progress).toFixed(2)}<br>
      Animation distance: ${animationDistance}px
    `;

    // IMPROVED: Apply transformations with more sensitive thresholds
    if (scrollY >= animationStartPoint) {
      // Show sticky header once we start scrolling
      stickyHeader.classList.add("visible");

      // Scale hero name from 1 down to 0.5 as we scroll
      const finalScale = 0.5;
      const scaleFactor = 1 - (1 - finalScale) * progress;

      // Calculate target position - move from original position to navbar position
      const translateY = -effectiveScroll * 0.5; // Moves at half the speed of the scroll

      // Apply transform to hero name - a combination of scaling and position
      const transformValue = `scale(${scaleFactor}) translateY(${translateY}px)`;
      heroName.style.transform = transformValue;

      // Hero name opacity decreases as we scroll
      heroName.style.opacity = Math.max(0, 1 - progress * 1.2).toFixed(2); // Slightly faster fade out

      // Sticky name opacity increases as we scroll
      stickyName.style.opacity = Math.min(1, progress * 1.5).toFixed(2); // Slightly faster fade in

      // Occasional debug logging
      if (scrollY % 100 < 2 || scrollY < 110) {
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
