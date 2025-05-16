// plugins/withVeloraPoseEstimation/withModelPostInstall.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

// Function to add a post-install hook to download the MediaPipe model
const withModelPostInstall = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const targetDir = path.join(projectRoot, 'ios/VeloraPoseEstimation');
      const modelPath = path.join(targetDir, 'pose_landmarker_full.task');
      
      // Create the target directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        try {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(`Created directory: ${targetDir}`);
        } catch (error) {
          console.error(`Failed to create directory: ${error.message}`);
        }
      }
      
      // Download the MediaPipe model if needed
      if (!fs.existsSync(modelPath)) {
        try {
          console.log(`Downloading MediaPipe model to ${modelPath}...`);
          execSync(`curl -s -o "${modelPath}" "${MEDIAPIPE_MODEL_URL}"`);
          console.log(`✓ Downloaded file to ${modelPath}`);
        } catch (error) {
          console.error(`Failed to download model: ${error.message}`);
        }
      } else {
        console.log(`✓ MediaPipe model already exists at ${modelPath}`);
      }
      
      return config;
    },
  ]);
};

module.exports = withModelPostInstall;
