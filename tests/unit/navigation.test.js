/**
 * @jest-environment jsdom
 */

describe("Navigation functionality", () => {
  // Set up the DOM environment
  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="navbar">
        <div class="container">
          <div class="logo">RG</div>
          <ul class="nav-links">
            <li><a href="#about" id="about-link">About</a></li>
            <li><a href="#services" id="services-link">Services</a></li>
            <li><a href="#portfolio" id="portfolio-link">Portfolio</a></li>
            <li><a href="#contact" id="contact-link">Contact</a></li>
          </ul>
        </div>
      </nav>
      <section id="about">About Section</section>
    `;

    // Mock window.scrollTo
    window.scrollTo = jest.fn();

    // Load the script functionality
    require("../../src/js/script.js");

    // Trigger DOMContentLoaded event to initialize functions
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  test("navbar should exist", () => {
    const navbar = document.querySelector(".navbar");
    expect(navbar).not.toBeNull();
  });

  test("navbar should have 4 navigation links", () => {
    const links = document.querySelectorAll(".nav-links a");
    expect(links.length).toBe(4);
  });

  test("clicking a navigation link should prevent default behavior", () => {
    const aboutLink = document.getElementById("about-link");

    // Create an event with a preventDefault method that we can spy on
    const clickEvent = new MouseEvent("click");
    clickEvent.preventDefault = jest.fn();

    // Trigger the event handler
    aboutLink.dispatchEvent(clickEvent);

    // Check if preventDefault was called
    expect(clickEvent.preventDefault).toHaveBeenCalled();

    // Also check that scrollTo was called
    expect(window.scrollTo).toHaveBeenCalled();
  });

  test("scrolling should add scrolled class to navbar when beyond threshold", () => {
    const navbar = document.querySelector(".navbar");

    // Initial state - no scrolled class
    expect(navbar.classList.contains("scrolled")).toBe(false);

    // Simulate scrolling beyond threshold
    Object.defineProperty(window, "scrollY", {
      value: 150,
      configurable: true,
    });

    // Manually trigger the scroll event
    window.dispatchEvent(new Event("scroll"));

    // Navbar should have scrolled class
    expect(navbar.classList.contains("scrolled")).toBe(true);

    // Simulate scrolling back to top
    Object.defineProperty(window, "scrollY", { value: 50, configurable: true });

    // Manually trigger the scroll event again
    window.dispatchEvent(new Event("scroll"));

    // Scrolled class should be removed
    expect(navbar.classList.contains("scrolled")).toBe(false);
  });
});
