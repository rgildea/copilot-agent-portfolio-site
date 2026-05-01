#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, "..", "lighthouse-reports");
const SITE_URL = "https://ryangildea.com"; // Change to your domain
const LOCAL_URL = "http://localhost:8080";

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Get current date for report filename
const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// Check if local server is running
function isLocalServerRunning() {
  try {
    const result = execSync(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:8080',
      { stdio: "pipe" },
    );
    return result.toString().trim() === "200";
  } catch (error) {
    return false;
  }
}

// Main function
function runLighthouse() {
  const dateStr = getFormattedDate();
  const url = isLocalServerRunning() ? LOCAL_URL : SITE_URL;

  console.log(`Testing ${url} with Lighthouse...`);

  try {
    // Mobile test
    const mobileOutput = path.join(REPORTS_DIR, `mobile-${dateStr}.html`);
    console.log(`\nRunning mobile test...`);
    execSync(
      `npx lighthouse ${url} --quiet --chrome-flags="--headless" ` +
        `--emulated-form-factor=mobile --output=html ` +
        `--output-path=${mobileOutput} ` +
        `--only-categories=performance,accessibility,best-practices,seo ` +
        `--no-enable-error-reporting`,
      { stdio: "inherit" },
    );

    // Desktop test
    const desktopOutput = path.join(REPORTS_DIR, `desktop-${dateStr}.html`);
    console.log(`\nRunning desktop test...`);
    execSync(
      `npx lighthouse ${url} --quiet --chrome-flags="--headless" ` +
        `--emulated-form-factor=desktop --output=html ` +
        `--output-path=${desktopOutput} ` +
        `--only-categories=performance,accessibility,best-practices,seo ` +
        `--no-enable-error-reporting`,
      { stdio: "inherit" },
    );

    console.log(`\nLighthouse tests completed!`);
    console.log(`Reports saved to: ${REPORTS_DIR}`);

    // Open reports directory
    if (process.platform === "darwin") {
      execSync(`open ${REPORTS_DIR}`);
    } else if (process.platform === "win32") {
      execSync(`explorer ${REPORTS_DIR}`);
    } else {
      execSync(`xdg-open ${REPORTS_DIR}`);
    }
  } catch (error) {
    console.error(`Error running Lighthouse: ${error.message}`);
    process.exit(1);
  }
}

// Execute
runLighthouse();
