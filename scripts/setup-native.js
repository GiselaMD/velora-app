// scripts/setup-native.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Template file not found: ${src}`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${path.basename(src)}`);
}

async function setupNative() {
  try {
    // Create directories
    const nativeDir = path.join(__dirname, '../native');
    const iosDir = path.join(nativeDir, 'ios/VeloraPoseEstimation');
    const templateDir = path.join(nativeDir, 'ios/templates');
    
    if (!fs.existsSync(iosDir)) {
      fs.mkdirSync(iosDir, { recursive: true });
      console.log('Created iOS directory structure');
    }

    // Download MediaPipe model
    console.log('Downloading MediaPipe model...');
    const modelPath = path.join(iosDir, 'pose_landmarker_lite.task');
    execSync(`curl -o "${modelPath}" "${MEDIAPIPE_MODEL_URL}"`);
    console.log('Downloaded MediaPipe model');

    // Copy Swift files from templates
    const files = [
      'VeloraPoseEstimation.swift',
      'VeloraPoseEstimation.m',
      'PoseEstimationPlugin.swift'
    ];

    files.forEach(file => {
      const srcPath = path.join(templateDir, file);
      const destPath = path.join(iosDir, file);
      copyFile(srcPath, destPath);
    });

    console.log('Native setup complete! ✅');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupNative();