// scripts/setup-native.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

// Config
const PROJECT_ROOT = path.join(__dirname, '..');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, 'native/ios/templates');
const TARGET_DIR = path.join(PROJECT_ROOT, 'ios/VeloraPoseEstimation');
const MODEL_NAME = 'pose_landmarker_full.task';

/**
 * Copies a file from source to destination
 */
function copyFile(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      throw new Error(`Template file not found: ${src}`);
    }
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${path.basename(src)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error copying ${path.basename(src)}:`, error.message);
    return false;
  }
}

/**
 * Downloads a file from URL to destination
 */
function downloadFile(url, dest) {
  try {
    console.log(`Downloading ${path.basename(dest)}...`);
    execSync(`curl -s -o "${dest}" "${url}"`);
    console.log(`✓ Downloaded ${path.basename(dest)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error downloading ${path.basename(dest)}:`, error.message);
    return false;
  }
}

/**
 * Ensures the model file is in the target directory
 */
function setupModelFile() {
  const modelPath = path.join(TARGET_DIR, MODEL_NAME);
  
  // Check if model exists in target directory
  if (!fs.existsSync(modelPath)) {
    console.log(`MediaPipe model not found at ${modelPath}`);
    return downloadFile(MEDIAPIPE_MODEL_URL, modelPath);
  }
  
  console.log(`✓ MediaPipe model already exists at ${modelPath}`);
  return true;
}

/**
 * Verify iOS project structure and create necessary directories
 */
function verifyIosStructure() {
  const iosDir = path.join(PROJECT_ROOT, 'ios');
  
  // Check if iOS directory exists (should be created by prebuild)
  if (!fs.existsSync(iosDir)) {
    console.error('❌ iOS directory not found. Run `npx expo prebuild` first.');
    return false;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(TARGET_DIR)) {
    try {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
      console.log('✓ Created VeloraPoseEstimation directory');
    } catch (error) {
      console.error('❌ Failed to create VeloraPoseEstimation directory:', error.message);
      return false;
    }
  }
  
  return true;
}

/**
 * Verify template files exist
 */
function verifyTemplates() {
  console.log('Verifying templates...');
  
  // Get all files from template directory
  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error(`❌ Template directory not found: ${TEMPLATE_DIR}`);
    return false;
  }
  
  const templateFiles = fs.readdirSync(TEMPLATE_DIR);
  
  if (templateFiles.length === 0) {
    console.error('❌ No template files found in template directory');
    return false;
  }
  
  console.log(`✓ Found ${templateFiles.length} template files`);
  return { success: true, files: templateFiles };
}

/**
 * Copy template files to target directory
 */
function copyTemplateFiles() {
  const templateVerification = verifyTemplates();
  
  if (!templateVerification.success) {
    return false;
  }
  
  console.log('\nCopying native files...');
  let success = true;
  
  templateVerification.files.forEach(file => {
    const srcPath = path.join(TEMPLATE_DIR, file);
    const destPath = path.join(TARGET_DIR, file);
    if (!copyFile(srcPath, destPath)) {
      success = false;
    }
  });
  
  return success;
}

/**
 * Main function to setup native modules
 */
async function setupNative() {
  console.log('🚀 Setting up native modules for VeloraPoseEstimation...\n');
  
  try {
    // Step 1: Verify iOS project structure
    if (!verifyIosStructure()) {
      throw new Error('Failed to verify iOS project structure');
    }
    
    // Step 2: Copy template files
    if (!copyTemplateFiles()) {
      throw new Error('Failed to copy template files');
    }
    
    // Step 3: Setup MediaPipe model
    if (!setupModelFile()) {
      throw new Error('Failed to setup MediaPipe model');
    }
    
    console.log('\n✅ Native setup completed successfully!');
    console.log('🔍 Next steps:');
    console.log('   1. Run your app with `npx expo run:ios`');
    console.log('   2. If you have issues, check that the model file is correctly bundled');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupNative();