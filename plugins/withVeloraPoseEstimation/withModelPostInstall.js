// plugins/withVeloraPoseEstimation/withModelPostInstall.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
const PRODUCT_MODULE_NAME = 'veloraapp'; // Your actual product module name

const withModelPostInstall = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => { // Changed config to cfg to avoid conflict with outer config
      const projectRoot = cfg.modRequest.projectRoot;
      // Final destination for the model, consistent with Xcode project structure
      const targetDir = path.join(projectRoot, 'ios', PRODUCT_MODULE_NAME, 'VeloraPoseEstimation');
      const modelPath = path.join(targetDir, 'pose_landmarker_full.task');
      
      if (!fs.existsSync(targetDir)) {
        try {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(`✓ Created directory for model download: ${targetDir}`);
        } catch (error) {
          console.error(`✗ Failed to create directory ${targetDir}: ${error.message}`);
          return cfg;
        }
      }
      
      if (!fs.existsSync(modelPath)) {
        try {
          console.log(`Downloading MediaPipe model to ${modelPath}...`);
          execSync(`curl -Ls -o "${modelPath}" "${MEDIAPIPE_MODEL_URL}"`); // Added -L for redirects
          console.log(`✓ Downloaded file to ${modelPath}`);
        } catch (error) {
          console.error(`✗ Failed to download model to ${modelPath}: ${error.message}`);
        }
      } else {
        console.log(`✓ MediaPipe model already exists at ${modelPath}`);
      }
      
      return cfg;
    },
  ]);
};

module.exports = withModelPostInstall;