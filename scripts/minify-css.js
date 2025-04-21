import CleanCSS from "clean-css";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const inputDir = path.join(__dirname, "..", "src", "css");
const outputDir = path.join(__dirname, "..", "_site", "css");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize CleanCSS
const cleanCSS = new CleanCSS({
  level: 2, // Advanced optimizations
  compatibility: "ie11",
  format: "keep-breaks", // For slightly better readability if needed
});

// Minify CSS files
function minifyCssFiles() {
  // Check if directory exists
  if (!fs.existsSync(inputDir)) {
    console.log(`Source directory doesn't exist: ${inputDir}`);
    return;
  }

  // Read all CSS files from the input directory
  const files = fs
    .readdirSync(inputDir)
    .filter((file) => file.endsWith(".css"));

  if (files.length === 0) {
    console.log("No CSS files found in source directory.");
    return;
  }

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      // Read file content
      const cssContent = fs.readFileSync(inputPath, "utf8");

      // Minify CSS
      const result = cleanCSS.minify(cssContent);

      if (result.errors.length > 0) {
        console.error(
          `❌ Errors occurred while minifying ${file}:`,
          result.errors
        );
        // On error, copy the original file to ensure we have a working version
        fs.copyFileSync(inputPath, outputPath);
        continue;
      }

      if (result.warnings.length > 0) {
        console.warn(`⚠️ Warnings for ${file}:`, result.warnings);
      }

      // Write minified CSS to output file
      fs.writeFileSync(outputPath, result.styles);

      // Calculate saved size
      const originalSize = cssContent.length;
      const minifiedSize = result.styles.length;
      const savedPercentage = (
        ((originalSize - minifiedSize) / originalSize) *
        100
      ).toFixed(2);

      console.log(
        `✅ Minified ${file} - saved ${savedPercentage}% (${
          originalSize - minifiedSize
        } bytes)`
      );
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      // Copy the original file as a fallback
      if (fs.existsSync(inputPath)) {
        fs.copyFileSync(inputPath, outputPath);
        console.log(`⚠️ Copied original ${file} as fallback`);
      }
    }
  }
}

// Run the CSS minification
try {
  console.log("Starting CSS minification...");
  minifyCssFiles();
  console.log("CSS minification complete!");
} catch (err) {
  console.error("An error occurred during CSS minification:", err);
  process.exit(1);
}
