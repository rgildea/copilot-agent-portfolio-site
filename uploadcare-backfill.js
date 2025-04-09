// Script to upload existing images to Uploadcare
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Your Uploadcare public key from config.yml
const UPLOADCARE_PUBLIC_KEY = '38b97d1bf198a6f54635';

// Directories containing images
const IMAGE_DIRS = [
  path.join(__dirname, 'images'),
  path.join(__dirname, 'images/portfolio')
];

// Function to upload a single file to Uploadcare
async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`Uploading ${fileName}...`);
  
  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
  formData.append('UPLOADCARE_STORE', '1');
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('https://upload.uploadcare.com/base/', formData, {
      headers: formData.getHeaders()
    });
    
    console.log(`✅ Uploaded ${fileName} - File ID: ${response.data.file}`);
    return {
      fileName,
      fileId: response.data.file,
      originalPath: filePath
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}: ${error.message}`);
    return null;
  }
}

// Function to find all image files in a directory
function findImageFiles(directory) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const files = fs.readdirSync(directory);
  
  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .map(file => path.join(directory, file));
}

// Main function to upload all images
async function uploadAllImages() {
  const uploadResults = [];
  
  for (const dir of IMAGE_DIRS) {
    if (fs.existsSync(dir)) {
      const imageFiles = findImageFiles(dir);
      console.log(`Found ${imageFiles.length} images in ${dir}`);
      
      for (const file of imageFiles) {
        const result = await uploadFile(file);
        if (result) {
          uploadResults.push(result);
        }
      }
    } else {
      console.warn(`Directory does not exist: ${dir}`);
    }
  }
  
  // Write results to a JSON file for reference
  fs.writeFileSync('uploadcare-results.json', JSON.stringify(uploadResults, null, 2));
  console.log(`\nUpload complete! Uploaded ${uploadResults.length} images.`);
  console.log(`Results saved to uploadcare-results.json`);
  
  console.log(`\nTo use these images in your CMS, reference them as:`);
  console.log(`https://ucarecdn.com/FILE_ID/-/preview/`);
  console.log(`Replace FILE_ID with the specific file ID from the results.`);
}

// Install dependencies if needed and run
console.log('Checking for required dependencies...');
try {
  require.resolve('axios');
  require.resolve('form-data');
  console.log('Dependencies found, starting upload...\n');
  uploadAllImages();
} catch (e) {
  console.log('Required dependencies not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install axios form-data', { stdio: 'inherit' });
  console.log('Dependencies installed, starting upload...\n');
  uploadAllImages();
}