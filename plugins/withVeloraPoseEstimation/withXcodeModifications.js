// plugins/withVeloraPoseEstimation/withXcodeModifications.js
const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// Simplest version
const withXcodeModifications = (config) => {
  return withXcodeProject(config, async (props) => {
    const xcodeProject = props.modResults;
    const projectRoot = props.modRequest.projectRoot;
    
    // Just copy files without trying to modify Xcode project
    const sourceDir = path.join(projectRoot, 'native/ios/templates');
    const targetDir = path.join(projectRoot, 'ios/VeloraPoseEstimation');
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy template files
    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir);
      files.forEach(file => {
        const src = path.join(sourceDir, file);
        const dest = path.join(targetDir, file);
        try {
          fs.copyFileSync(src, dest);
          console.log(`✓ Copied ${file}`);
        } catch (error) {
          console.error(`✗ Error copying ${file}:`, error.message);
        }
      });
    }
    
    return props;
  });
};
module.exports = withXcodeModifications;