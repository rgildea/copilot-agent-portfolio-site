#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcImagesDir = path.join(__dirname, "..", "src", "images");

// Function to recursively delete a directory
function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);

      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        removeDirectoryRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
        console.log(`Deleted: ${curPath}`);
      }
    });

    // Remove the now empty directory
    fs.rmdirSync(dirPath);
    console.log(`Removed directory: ${dirPath}`);
  }
}

// Main function
async function cleanupDuplicateImages() {
  console.log("Starting cleanup of duplicate images...");

  try {
    if (fs.existsSync(srcImagesDir)) {
      console.log(`Removing duplicate images from: ${srcImagesDir}`);
      removeDirectoryRecursive(srcImagesDir);
      console.log("✅ Cleanup complete!");
    } else {
      console.log("No duplicate images directory found. Nothing to clean up.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error.message);
  }
}

// Run the function
cleanupDuplicateImages().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
