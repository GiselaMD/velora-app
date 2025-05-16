// scripts/setup-native.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

function copyFile(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      throw new Error(`Template file not found: ${src}`);
    }
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${path.basename(src)}`);
  } catch (error) {
    console.error(`✗ Error copying ${path.basename(src)}:`, error.message);
    throw error;
  }
}

async function setupNative() {
  try {
    const projectRoot = path.join(__dirname, '..');
    const templateDir = path.join(projectRoot, 'native/ios/templates');
    const targetDir = path.join(projectRoot, 'ios/VeloraPoseEstimation');

    // Verify ios directory exists (should be created by prebuild)
    const iosDir = path.join(projectRoot, 'ios');
    if (!fs.existsSync(iosDir)) {
      throw new Error('iOS directory not found. Run `npx expo prebuild` first.');
    }
    
    // Create target directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('✓ Created VeloraPoseEstimation directory');
    }

    // Verify templates exist
    console.log('Verifying templates...');
    const templateFiles = [
      'PoseDetectorHelper.swift',
      'PoseEstimationPlugin.swift',
      'VeloraPoseEstimation.m'
    ];

    const missingFiles = templateFiles.filter(file => 
      !fs.existsSync(path.join(templateDir, file))
    );

    if (missingFiles.length > 0) {
      throw new Error(
        'Missing template files:\n' +
        missingFiles.map(file => `  - ${file}`).join('\n')
      );
    }
    console.log('✓ All templates found\n');

    // Download MediaPipe model
    console.log('Downloading MediaPipe model...');
    const modelPath = path.join(targetDir, 'pose_landmarker_full.task');
    execSync(`curl -o "${modelPath}" "${MEDIAPIPE_MODEL_URL}"`);
    console.log('✓ Downloaded MediaPipe model\n');

    // Copy template files
    console.log('Copying native files...');
    templateFiles.forEach(file => {
      const srcPath = path.join(templateDir, file);
      const destPath = path.join(targetDir, file);
      copyFile(srcPath, destPath);
    });
    console.log('\n✓ All files copied successfully\n');

    console.log('Native setup complete! ✅');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupNative();