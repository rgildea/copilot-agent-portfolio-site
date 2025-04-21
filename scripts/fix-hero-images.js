import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hero image files to fix
const imageFiles = [
  "hero-background.jpg",
  "hero-background-2.jpg",
  "hero-background-3.jpg",
];

// Only process images from root directory
const imageDirs = [path.join(__dirname, "..", "images")];

// Function to convert a single image to WebP with proper orientation
async function convertToWebP(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return false;
  }

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(dir, `${baseName}.webp`);

  try {
    console.log(`Converting ${filePath} to WebP...`);
    // Use rotate() to automatically apply orientation from EXIF metadata
    await sharp(filePath)
      .rotate() // This will auto-rotate based on EXIF orientation
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`✅ Fixed and created ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  let fixedCount = 0;
  let errorCount = 0;

  for (const dir of imageDirs) {
    for (const file of imageFiles) {
      const filePath = path.join(dir, file);
      const result = await convertToWebP(filePath);
      if (result) {
        fixedCount++;
      } else {
        errorCount++;
      }
    }
  }

  console.log(`\nHero image fix complete!`);
  console.log(`${fixedCount} images fixed successfully`);
  if (errorCount > 0) {
    console.log(`${errorCount} errors encountered`);
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
