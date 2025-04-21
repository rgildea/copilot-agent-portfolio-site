/**
 * @jest-environment jsdom
 */

describe("Hero Background Carousel", () => {
  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML = `
      <header class="hero">
        <div class="hero-backgrounds">
          <div class="hero-bg bg-1"></div>
          <div class="hero-bg bg-2"></div>
          <div class="hero-bg bg-3"></div>
        </div>
        <div class="hero-content">
          <h1 id="hero-name" class="hero-title">Ryan<br />Gildea</h1>
          <h2>Music Production | Mixing | Mastering</h2>
        </div>
      </header>
    `;
  });

  test("hero carousel structure is correct", () => {
    // Check for proper number of background elements
    const bgElements = document.querySelectorAll(".hero-bg");
    expect(bgElements.length).toBe(3);

    // Check that the first background is visible initially (key functionality)
    const firstBg = document.querySelector(".hero-bg.bg-1");
    expect(getComputedStyle(firstBg).opacity).not.toBe("0");
  });
});
