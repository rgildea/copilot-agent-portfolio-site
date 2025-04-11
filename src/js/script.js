// Portfolio site JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all main components
  console.log("DOM loaded - initializing components");
  initNavbar();
  initSmoothScrolling();
  initContactForm();
  initPortfolioFilter();
  initScrollIndicator();
  initGridOverlay();

  // Initialize the sticky header animation last
  setTimeout(() => {
    initStickyHeaderAnimation();
  }, 500);

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

// Completely revised sticky header animation with more reliable scroll detection
function initStickyHeaderAnimation() {
  console.log("🎬 ANIMATION - Starting initialization with new approach");

  // Get DOM elements
  const heroName = document.getElementById("hero-name");
  const stickyHeader = document.getElementById("sticky-header");
  const stickyName = document.getElementById("sticky-name");
  const heroSection = document.querySelector(".hero");

  // Check if elements exist
  if (!heroName || !stickyHeader || !stickyName || !heroSection) {
    console.error("❌ ERROR: Missing required elements for animation:", {
      heroName: !!heroName,
      stickyHeader: !!stickyHeader,
      stickyName: !!stickyName,
      heroSection: !!heroSection,
    });
    return;
  }

  // Log success finding all elements
  console.log("✅ All animation elements found");

  // Add visual highlights for debugging
  heroName.style.outline = "2px solid red";
  stickyName.style.outline = "2px solid green";

  // Force the sticky header to be initially hidden
  stickyHeader.style.transform = "translateY(-100%)";
  stickyName.style.opacity = "0";

  // Add a visual debug overlay that stays visible
  const debugElement = document.createElement("div");
  debugElement.id = "animation-debug";
  debugElement.style.position = "fixed";
  debugElement.style.top = "10px";
  debugElement.style.left = "10px";
  debugElement.style.background = "rgba(0,0,0,0.8)";
  debugElement.style.color = "#00ff00";
  debugElement.style.padding = "10px";
  debugElement.style.fontSize = "12px";
  debugElement.style.fontFamily = "monospace";
  debugElement.style.zIndex = "10000";
  debugElement.style.borderRadius = "5px";
  document.body.appendChild(debugElement);

  // Animation configuration
  const config = {
    heroHeight: heroSection.offsetHeight,
    startThreshold: 10, // Start animation after 10px of scroll
    animationDistance: 250, // Complete the animation over 250px of scroll
    finalHeroScale: 0.5, // Target scale for hero name
    event: "scroll", // The event to listen to
  };

  // Print the animation configuration
  console.log("📐 Animation configuration:", config);

  // Track last known scroll position
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateAnimationState(scrollY) {
    // Calculate animation progress (0 to 1)
    const effectiveScroll = Math.max(0, scrollY - config.startThreshold);
    const progress = Math.min(1, effectiveScroll / config.animationDistance);

    // Update debug panel with current state
    debugElement.innerHTML = `
      Scroll: ${scrollY}px<br>
      Progress: ${progress.toFixed(2)}<br>
      HeroOpacity: ${(1 - progress).toFixed(2)}<br>
      Applied: ${new Date().toLocaleTimeString()}
    `;

    // Apply animations based on scroll progress
    if (scrollY > config.startThreshold) {
      // Show sticky header when scrolling down
      stickyHeader.style.transform = "translateY(0)";

      // Animate hero name (scale down and fade out)
      const scale = 1 - (1 - config.finalHeroScale) * progress;
      heroName.style.transform = `scale(${scale}) translateY(${
        -effectiveScroll * 0.3
      }px)`;
      heroName.style.opacity = Math.max(0, 1 - progress * 1.2);

      // Animate sticky name (fade in)
      stickyName.style.opacity = Math.min(1, progress * 1.5);

      // Log occasionally for debugging
      if (scrollY % 50 < 2) {
        console.log(
          `🔄 Scroll: ${scrollY}px, Progress: ${progress.toFixed(2)}`
        );
      }
    } else {
      // Hide sticky header at the top
      stickyHeader.style.transform = "translateY(-100%)";

      // Reset hero name
      heroName.style.transform = "scale(1) translateY(0)";
      heroName.style.opacity = "1";

      // Hide sticky name
      stickyName.style.opacity = "0";
    }
  }

  // Handle scroll events efficiently with requestAnimationFrame
  function handleScroll() {
    console.log("📜 Scroll event detected");
    lastScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateAnimationState(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  // Add scroll event listener to window
  window.addEventListener(config.event, handleScroll, { passive: true });

  // Force initial state update
  updateAnimationState(window.scrollY);

  // Log completion of setup
  console.log("✅ Animation setup complete with new scroll approach");

  // Sometimes the scroll event doesn't fire initially, so trigger it manually
  setTimeout(() => {
    window.scrollBy(0, 1);
    setTimeout(() => {
      window.scrollBy(0, -1);
    }, 50);
  }, 1000);
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
