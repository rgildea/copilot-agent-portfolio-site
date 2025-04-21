import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only process the root images directory
const imageDirs = [
  path.join(__dirname, "..", "images"),
  // Removing src/images to avoid duplication
];

// Function to convert images to WebP
async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${baseName}.webp`);

    try {
      console.log(`Converting ${filePath} to WebP...`);
      // Added rotate() with auto option to preserve orientation metadata
      await sharp(filePath)
        .rotate() // This will auto-rotate based on EXIF orientation
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Created ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`Error converting ${filePath}:`, error.message);
      return false;
    }
  }
  return false;
}

// Function to process directories recursively
async function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Directory does not exist: ${directory}`);
    return;
  }

  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await processDirectory(filePath);
    } else {
      await processImage(filePath);
    }
  }
}

// Main function
async function main() {
  for (const dir of imageDirs) {
    console.log(`Processing directory: ${dir}`);
    await processDirectory(dir);
  }
  console.log("Image optimization complete!");
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
