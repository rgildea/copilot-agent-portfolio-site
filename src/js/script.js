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

  console.log("Portfolio site loaded successfully!");
});

// Navigation scroll effect - simplified without hero-name-fixed classes
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const scrollThreshold = 100;

  // Basic scroll handler that adds/removes scrolled class
  window.addEventListener("scroll", function () {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Initial check on page load
  if (window.scrollY > scrollThreshold) {
    navbar.classList.add("scrolled");
  } else {
    // Important: Make sure navbar links are clickable even at the top
    // by adding a temporary class that ensures z-index and clickability
    navbar.classList.add("top-position");
  }
}

// Scroll indicator functionality
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
  }
}

// Improved smooth scrolling implementation
function initSmoothScrolling() {
  // Fix for links in the navbar - they all have format "/#section"
  document.querySelectorAll(".nav-links a").forEach((link) => {
    // First ensure all links are properly interactive
    link.style.position = "relative";
    link.style.zIndex = "1003";
    link.style.cursor = "pointer";
    link.style.pointerEvents = "auto";

    link.addEventListener("click", function (e) {
      console.log("Navigation link clicked:", this.getAttribute("href"));

      // Only handle if we're already on the homepage
      if (window.location.pathname === "/" || window.location.pathname === "") {
        e.preventDefault();

        // Extract the section id from the href (format: "/#section")
        const hrefParts = this.getAttribute("href").split("#");
        if (hrefParts.length < 2) return; // Skip if there's no hash

        const sectionId = hrefParts[1];
        const section = document.getElementById(sectionId);

        if (section) {
          console.log(`Scrolling to section: #${sectionId}`);
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          console.warn(`Section with id "${sectionId}" not found`);
        }
      }
      // Otherwise let the browser navigate normally to the homepage section
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
      alert("Form submitted successfully!");
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
