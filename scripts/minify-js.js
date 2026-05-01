import fs from "fs";
import path from "path";
import { minify } from "terser";
import { fileURLToPath } from "url";

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const inputDir = path.join(__dirname, "..", "src", "js");
const outputDir = path.join(__dirname, "..", "_site", "js");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Minify options
const minifyOptions = {
  compress: {
    dead_code: true,
    drop_console: true,
    drop_debugger: true,
    keep_classnames: false,
    keep_fargs: true,
    keep_fnames: false,
    keep_infinity: true,
  },
  mangle: {
    eval: true,
    keep_classnames: false,
    keep_fnames: false,
    toplevel: true,
    safari10: true,
  },
  output: {
    comments: false,
  },
  sourceMap: false,
  toplevel: true,
};

/**
 * Minifies JavaScript files from input directory to output directory
 */
async function minifyJavaScriptFiles() {
  try {
    // Check if directory exists
    if (!fs.existsSync(inputDir)) {
      console.log(`Source directory doesn't exist: ${inputDir}`);
      return;
    }

    // Read all JS files from the input directory
    const files = fs
      .readdirSync(inputDir)
      .filter((file) => file.endsWith(".js"));

    if (files.length === 0) {
      console.log("No JavaScript files found in source directory.");
      return;
    }

    // Process each file
    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      try {
        // Read file content
        const jsContent = fs.readFileSync(inputPath, "utf8");

        // Get original size
        const originalSize = Buffer.byteLength(jsContent, "utf8");

        // Minify JS
        const result = await minify(jsContent, minifyOptions);

        if (!result.code) {
          console.error(
            `❌ Error: No code was returned when minifying ${file}`,
          );
          // Copy the original as a fallback
          fs.copyFileSync(inputPath, outputPath);
          console.log(`⚠️ Copied original ${file} as fallback`);
          continue;
        }

        // Write the minified code
        fs.writeFileSync(outputPath, result.code);

        // Calculate saved size
        const minifiedSize = Buffer.byteLength(result.code, "utf8");
        const savedBytes = originalSize - minifiedSize;
        const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(2);

        console.log(`✅ Minified ${file} successfully`);
        console.log(`   Original size: ${formatBytes(originalSize)}`);
        console.log(`   Minified size: ${formatBytes(minifiedSize)}`);
        console.log(
          `   Saved: ${formatBytes(savedBytes)} (${savedPercentage}%)`,
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
  } catch (error) {
    console.error("An error occurred during JS minification:", error);
    throw error;
  }
}

/**
 * Formats bytes to a human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Run the JS minification
console.log("Starting JavaScript minification...");
minifyJavaScriptFiles()
  .then(() => {
    console.log("JavaScript minification complete!");
  })
  .catch((err) => {
    console.error("Failed to minify JavaScript:", err);
    process.exit(1);
  });
