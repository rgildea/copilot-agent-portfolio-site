// @ts-check
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const isQuickMode = process.env.PW_QUICK === "1";

const allProjects = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
  },
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
  {
    name: "Mobile Safari",
    use: { ...devices["iPhone 12"] },
  },
];

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: !isQuickMode,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI || isQuickMode ? 1 : undefined,
  reporter: isQuickMode ? "line" : "html",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: isQuickMode ? [allProjects[0]] : allProjects,
  webServer: {
    command: "npm run serve",
    port: 8080,
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
