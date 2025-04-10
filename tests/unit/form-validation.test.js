/**
 * @jest-environment jsdom
 */

describe("Contact form validation", () => {
  // Set up the DOM environment with the contact form
  beforeEach(() => {
    document.body.innerHTML = `
      <form class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" />
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" class="submit-button">Send Message</button>
      </form>
    `;

    // Mock alert
    window.alert = jest.fn();

    // Load the script functionality
    require("../../src/js/script.js");

    // Make sure DOMContentLoaded is triggered
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  test("form should exist", () => {
    const form = document.querySelector(".contact-form");
    expect(form).not.toBeNull();
  });

  test("form should show error on empty name field", () => {
    // Set up empty name but valid other fields
    document.getElementById("name").value = "";
    document.getElementById("email").value = "test@example.com";
    document.getElementById("message").value = "Test message";

    // Submit the form with an explicit event that has preventDefault
    const form = document.querySelector(".contact-form");
    const submitEvent = new Event("submit");
    submitEvent.preventDefault = jest.fn();
    form.dispatchEvent(submitEvent);

    // Give time for DOM to update
    jest.runAllTimers();

    // Verify error message was created
    const errorMessage = document.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain("Please enter your name");
  });

  test("form should show error on invalid email", () => {
    // Set up invalid email but valid other fields
    document.getElementById("name").value = "Test User";
    document.getElementById("email").value = "invalid-email";
    document.getElementById("message").value = "Test message";

    // Submit the form with an explicit event that has preventDefault
    const form = document.querySelector(".contact-form");
    const submitEvent = new Event("submit");
    submitEvent.preventDefault = jest.fn();
    form.dispatchEvent(submitEvent);

    // Verify error message was created
    const errorMessage = document.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain("Please enter a valid email");
  });

  test("form should show error on empty message field", () => {
    // Set up empty message but valid other fields
    document.getElementById("name").value = "Test User";
    document.getElementById("email").value = "test@example.com";
    document.getElementById("message").value = "";

    // Submit the form with an explicit event that has preventDefault
    const form = document.querySelector(".contact-form");
    const submitEvent = new Event("submit");
    submitEvent.preventDefault = jest.fn();
    form.dispatchEvent(submitEvent);

    // Verify error message was created
    const errorMessage = document.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain("Please enter your message");
  });

  test("form should submit successfully with all valid fields", () => {
    // Set up all valid fields
    document.getElementById("name").value = "Test User";
    document.getElementById("email").value = "test@example.com";
    document.getElementById("message").value = "Test message";

    // Submit the form with an explicit event that has preventDefault
    const form = document.querySelector(".contact-form");
    const submitEvent = new Event("submit");
    submitEvent.preventDefault = jest.fn();
    form.dispatchEvent(submitEvent);

    // Verify alert was shown
    expect(window.alert).toHaveBeenCalledWith(
      "Form submitted successfully! (This is a demo - no data was actually sent)"
    );
  });
});
