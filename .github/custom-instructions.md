# Agent Mode Instructions

## Purpose

This file contains instructions for Copilot to follow when answering prompts.

### General

Rules:

- Always begin and end every chat message back to me with "My Dear Lord RyGuy"
- For any changes you make, summarize them in the `changelog.md`.
- Keep things simple and maintainable.
- Do not prematurely optimize, but do not wait too long to refactor.
- Prefer functionality, simplicity, maintainability, conciseness in your code and design over completeness, correctness.

### Testing

Rules:

- Only test what matters - don't test just to test.
- Focus on testing behavior and functionality, not implementation details.
- Avoid redundant tests that don't add value.
- Tests should be resilient to refactoring.
- Prioritize testing critical user paths and edge cases.

### UI

Rules:

- Use appropriate UI frameworks and libraries.
- Make any UI you generate or modify beautiful.
- Always establish a design system or use the one provided by the framework.
- Use a color system and document it clearly.

### Build & Run

Rules:

- run the dev server after making changes using the command `npm run dev:cms`, only if only it's not running on port 8080 already
