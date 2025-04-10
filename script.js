// Portfolio site JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all main components
  initNavbar();
  initSmoothScrolling();
  initContactForm();
  initPortfolioFilter();

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
