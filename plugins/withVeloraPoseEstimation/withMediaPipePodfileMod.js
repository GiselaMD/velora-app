// plugins/withVeloraPoseEstimation/withMediaPipePodfileMod.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Function to add MediaPipe dependency to Podfile
const withMediaPipePodfileMod = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (!fs.existsSync(podfilePath)) {
        console.error('Podfile not found!');
        return config;
      }
      
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');
      
      // Check if MediaPipe is already added
      if (podfileContent.includes('pod \'MediaPipeTasksVision\'')) {
        console.log('MediaPipe dependency is already in Podfile');
        return config;
      }
      
      // Find the target section
      const targetPattern = /target ['"].*['"] do/;
      const targetMatch = podfileContent.match(targetPattern);
      
      if (!targetMatch) {
        console.error('Could not find target in Podfile');
        return config;
      }
      
      // Get the position where the target section ends
      const targetPosition = podfileContent.indexOf(targetMatch[0]);
      const endPos = podfileContent.indexOf('end', targetPosition);
      
      if (endPos === -1) {
        console.error('Could not find end of target section in Podfile');
        return config;
      }
      
      // Add MediaPipe dependency before the end of the target section
      const mediaPipePod = `\n  # MediaPipe dependency for pose estimation
  pod 'MediaPipeTasksVision', '0.10.12'\n  `;
      
      podfileContent = 
        podfileContent.substring(0, endPos) + 
        mediaPipePod + 
        podfileContent.substring(endPos);
      
      // Write the modified content back to the Podfile
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');
      console.log('Added MediaPipe dependency to Podfile');
      
      return config;
    },
  ]);
};

module.exports = withMediaPipePodfileMod;