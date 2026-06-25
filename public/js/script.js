// Portfolio site JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all main components
  initNavbar();
  initSmoothScrolling();
  initContactForm();
  initPortfolioFilter();
  initPortfolioModal();
  initGridOverlay();
});

// Navigation scroll effect - simplified without hero-name-fixed classes
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const scrollThreshold = 100;

  function updateNavbar() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add("scrolled");
      navbar.classList.remove("top-position");
    } else {
      navbar.classList.remove("scrolled");
      navbar.classList.add("top-position");
    }
  }

  window.addEventListener("scroll", updateNavbar);
  updateNavbar();
}

// Scroll indicator functionality is handled natively via the <a href="#about"> element

// Improved smooth scrolling implementation
function initSmoothScrolling() {
  function scrollToSection(section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Scroll indicator — prevent instant anchor jump, use smooth scroll instead
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", function (e) {
      e.preventDefault();
      const hrefParts = this.getAttribute("href").split("#");
      if (hrefParts.length < 2) return;
      const section = document.getElementById(hrefParts[1]);
      if (section) scrollToSection(section);
    });
  }

  // Fix for links in the navbar - they all have format "/#section"
  document.querySelectorAll(".nav-links a").forEach((link) => {
    // First ensure all links are properly interactive
    link.style.position = "relative";
    link.style.zIndex = "1003";
    link.style.cursor = "pointer";
    link.style.pointerEvents = "auto";

    link.addEventListener("click", function (e) {
      // Only handle if we're already on the homepage
      if (window.location.pathname === "/" || window.location.pathname === "") {
        e.preventDefault();

        // Extract the section id from the href (format: "/#section")
        const hrefParts = this.getAttribute("href").split("#");
        if (hrefParts.length < 2) return; // Skip if there's no hash

        const sectionId = hrefParts[1];
        const section = document.getElementById(sectionId);

        if (section) {
          scrollToSection(section);
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

function initPortfolioModal() {
  const modal = document.getElementById("portfolio-modal");
  const modalDialog = modal
    ? modal.querySelector(".portfolio-modal__dialog")
    : null;
  const triggers = document.querySelectorAll(".portfolio-trigger");
  const closeButtons = modal
    ? modal.querySelectorAll("[data-modal-close]")
    : [];

  if (!modal || !modalDialog || !triggers.length) return;

  const modalTitle = document.getElementById("portfolio-modal-title");
  const modalClient = document.getElementById("portfolio-modal-client");
  const modalRole = document.getElementById("portfolio-modal-role");
  const modalDescription = document.getElementById(
    "portfolio-modal-description",
  );
  const modalImage = document.getElementById("portfolio-modal-image");
  const modalLink = document.getElementById("portfolio-modal-link");

  let activeTrigger = null;

  function openModal(trigger) {
    if (!trigger) return;

    const { title, role, client, description, image, url } = trigger.dataset;

    if (modalTitle) modalTitle.textContent = title || "Untitled Project";
    if (modalClient) modalClient.textContent = client || "Client";
    if (modalRole) modalRole.textContent = role || "";
    if (modalDescription) modalDescription.textContent = description || "";

    if (modalImage) {
      modalImage.src = image || "";
      modalImage.alt = title || "Portfolio project";
    }

    if (modalLink) {
      modalLink.href = url || "#";
      modalLink.setAttribute("aria-disabled", url ? "false" : "true");
      modalLink.tabIndex = url ? 0 : -1;
    }

    activeTrigger = trigger;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    modalDialog.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");

    if (activeTrigger) {
      activeTrigger.focus();
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger));
  });

  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
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
      const formData = new FormData(contactForm);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(() => {
          const submitBtn = contactForm.querySelector(".submit-button");
          submitBtn.textContent = "Message Sent!";
          submitBtn.disabled = true;
          contactForm.reset();
          setTimeout(() => {
            submitBtn.textContent = "Send Message";
            submitBtn.disabled = false;
          }, 4000);
        })
        .catch(() => {
          alert("Something went wrong. Please try again or email directly.");
        });
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
    { once: true },
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

(function () {
  var facade = document.getElementById("spotify-facade");
  if (!facade) return;
  facade.addEventListener("click", function () {
    facade.style.opacity = "0";
    facade.addEventListener("transitionend", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://open.spotify.com/embed/playlist/3kybqFlT51pOHXhIsLoSOz?utm_source=generator&theme=0";
      iframe.title = "Featured playlist by Ryan Gildea";
      iframe.style.cssText = "border-radius:8px;";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
      facade.innerHTML = "";
      facade.appendChild(iframe);
      facade.style.opacity = "1";
    }, { once: true });
  }, { once: true });
})();
