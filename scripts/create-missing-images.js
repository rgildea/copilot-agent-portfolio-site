#!/usr/bin/env node

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portfolioImagesDir = path.join(__dirname, "..", "images", "portfolio");

// Ensure the portfolio images directory exists
if (!fs.existsSync(portfolioImagesDir)) {
  fs.mkdirSync(portfolioImagesDir, { recursive: true });
}

// List of expected portfolio image files
const expectedImages = [
  "hornz.png",
  "jerzee.png",
  "occo.png",
  "eons-past.png",
  "post-work-society.png",
  "left-hand-does.png",
  "nature-creeps-beneath.png",
];

// Check if each image exists, create a placeholder if it doesn't
async function createMissingImages() {
  console.log("Checking for missing portfolio images...");

  for (const imageName of expectedImages) {
    const imagePath = path.join(portfolioImagesDir, imageName);
    const webpImagePath = imagePath.replace(".png", ".webp");

    if (!fs.existsSync(imagePath)) {
      console.log(`Creating placeholder for: ${imageName}`);

      // Create a simple colored rectangle with text as a placeholder
      const projectName = imageName.replace(".png", "").replace(/-/g, " ");

      try {
        // Create a colored placeholder image with text
        await sharp({
          create: {
            width: 800,
            height: 600,
            channels: 4,
            background: { r: 41, g: 18, b: 66, alpha: 1 }, // Dark purple background
          },
        })
          .composite([
            {
              input: Buffer.from(
                `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
              <text x="50%" y="50%" font-family="Arial" font-size="40" fill="white" text-anchor="middle">
                ${projectName}
              </text>
              <text x="50%" y="58%" font-family="Arial" font-size="24" fill="#52c1d1" text-anchor="middle">
                Placeholder Image
              </text>
            </svg>`,
              ),
              top: 0,
              left: 0,
            },
          ])
          .png()
          .toFile(imagePath);

        console.log(`Created placeholder PNG: ${imagePath}`);

        // Also create a WebP version
        await sharp(imagePath).webp({ quality: 80 }).toFile(webpImagePath);

        console.log(`Created placeholder WebP: ${webpImagePath}`);
      } catch (error) {
        console.error(
          `Error creating placeholder for ${imageName}:`,
          error.message,
        );
      }
    } else {
      console.log(`${imageName} already exists.`);

      // Create WebP version if it doesn't exist
      if (!fs.existsSync(webpImagePath)) {
        console.log(`Creating WebP version for: ${imageName}`);

        try {
          await sharp(imagePath).webp({ quality: 80 }).toFile(webpImagePath);

          console.log(`Created WebP version: ${webpImagePath}`);
        } catch (error) {
          console.error(
            `Error creating WebP version for ${imageName}:`,
            error.message,
          );
        }
      } else {
        console.log(`WebP version for ${imageName} already exists.`);
      }
    }
  }

  console.log("Image check and creation completed!");
}

// Run the function
createMissingImages().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
