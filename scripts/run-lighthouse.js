#!/usr/bin/env node

/**
 * Simplified Lighthouse performance testing script
 * This script uses @lhci/cli to run Lighthouse tests and generate reports
 */

import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = "https://ryangildea.com"; // Change this to your actual domain
const REPORTS_DIR = path.join(__dirname, "..", "lighthouse-reports");
const TEMP_CONFIG_PATH = path.join(__dirname, "lighthouse-config-temp.json");
const PORT = 8080;

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

/**
 * Check if site is running locally
 */
function isSiteRunningLocally() {
  try {
    const result = execSync(
      `curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}`,
    );
    return result.toString().trim() === "200";
  } catch (error) {
    return false;
  }
}

/**
 * Run lighthouse CLI command
 */
async function runLighthouseCommand(url, outputPath, device = "mobile") {
  return new Promise((resolve, reject) => {
    console.log(`Running Lighthouse test (${device}) on ${url}...`);

    // Create temporary config file for the device
    const config = {
      extends: "lighthouse:default",
      settings: {
        formFactor: device,
        screenEmulation: {
          mobile: device === "mobile",
          width: device === "mobile" ? 375 : 1350,
          height: device === "mobile" ? 667 : 940,
          deviceScaleFactor: device === "mobile" ? 2 : 1,
          disabled: false,
        },
      },
    };

    fs.writeFileSync(TEMP_CONFIG_PATH, JSON.stringify(config, null, 2));

    // Build the command arguments
    const args = [
      "node_modules/.bin/lhci",
      "collect",
      "--url",
      url,
      "--output",
      outputPath,
      "--config",
      TEMP_CONFIG_PATH,
      "--settings.output=html",
      "--settings.throttlingMethod=simulate",
      "--settings.throttling.cpuSlowdownMultiplier=" +
        (device === "mobile" ? "4" : "1"),
      "--settings.onlyCategories=performance,accessibility,best-practices,seo",
      '--chrome-flags="--headless --disable-gpu --no-sandbox"',
    ];

    // Execute the command
    const command = spawn("npx", args, {
      stdio: "inherit",
      shell: true,
    });

    command.on("close", (code) => {
      // Clean up temporary config file
      if (fs.existsSync(TEMP_CONFIG_PATH)) {
        fs.unlinkSync(TEMP_CONFIG_PATH);
      }

      if (code === 0) {
        console.log(`Lighthouse ${device} test completed successfully!`);
        console.log(`Report saved to: ${outputPath}`);
        resolve();
      } else {
        console.error(`Lighthouse ${device} test failed with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Determine URL to test
    let testUrl = SITE_URL;
    const isLocalRunning = isSiteRunningLocally();

    if (isLocalRunning) {
      testUrl = `http://localhost:${PORT}`;
      console.log(`Testing local development server at ${testUrl}`);
    } else {
      console.log(`Testing production site at ${testUrl}`);
    }

    const dateStr = getFormattedDate();

    // Run mobile test
    const mobileReportPath = path.join(
      REPORTS_DIR,
      `lighthouse-mobile-${dateStr}.html`,
    );
    await runLighthouseCommand(testUrl, mobileReportPath, "mobile");

    // Run desktop test
    const desktopReportPath = path.join(
      REPORTS_DIR,
      `lighthouse-desktop-${dateStr}.html`,
    );
    await runLighthouseCommand(testUrl, desktopReportPath, "desktop");

    console.log("\nLighthouse tests completed successfully!");

    // Open the reports directory
    if (process.platform === "darwin") {
      execSync(`open ${REPORTS_DIR}`);
    } else if (process.platform === "win32") {
      execSync(`explorer ${REPORTS_DIR}`);
    } else if (process.platform === "linux") {
      execSync(`xdg-open ${REPORTS_DIR}`);
    }
  } catch (error) {
    console.error("Error running Lighthouse:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
