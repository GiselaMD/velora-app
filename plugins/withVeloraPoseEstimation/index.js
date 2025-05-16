// plugins/withVeloraPoseEstimation/index.js
const { withPlugins, createRunOncePlugin } = require('@expo/config-plugins');
const withXcodeModifications = require('./withXcodeModifications');
const withMediaPipePodfileMod = require('./withMediaPipePodfileMod');
const withModelPostInstall = require('./withModelPostInstall');

const withVeloraPoseEstimation = (config) => {
  // Ensure we have the necessary iOS configuration
  if (!config.ios) {
    config.ios = {};
  }

  return withPlugins(config, [
    // Apply Xcode project modifications
    withXcodeModifications,
    
    // Add MediaPipe dependency to Podfile
    withMediaPipePodfileMod,
    
    // Set up post-install hook for model installation
    withModelPostInstall
  ]);
};

// Create a plugin that only runs once per prebuild
module.exports = createRunOncePlugin(
  withVeloraPoseEstimation,
  'velora-pose-estimation',
  '1.0.0'
);