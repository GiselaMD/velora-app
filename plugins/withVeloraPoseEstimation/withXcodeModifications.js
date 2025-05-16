// plugins/withVeloraPoseEstimation/withXcodeModifications.js

const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withXcodeModifications = (config) => {
  return withXcodeProject(config, async (props) => {
    const xcodeProject = props.modResults;
    const projectRoot = props.modRequest.projectRoot;

    const sourceDir = path.join(projectRoot, 'native/ios/templates');
    const targetDir = path.join(projectRoot, 'ios/VeloraPoseEstimation');

    // Ensure target dir exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy all files from templates into ios/VeloraPoseEstimation
    const templateFiles = fs.readdirSync(sourceDir);
    templateFiles.forEach(file => {
      const src = path.join(sourceDir, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${file}`);
    });

    // Add copied files to Xcode project
    const groupName = 'VeloraPoseEstimation';
    const groupKey = xcodeProject.pbxCreateGroup(groupName);
    const mainGroupId = xcodeProject.getFirstProject().firstProject.mainGroup;
    xcodeProject.addToPbxGroup(groupKey, mainGroupId);

    templateFiles.forEach(file => {
  const filePath = path.join(groupName, file);
  const ext = path.extname(file);

  try {
    if (ext === '.swift' || ext === '.m' || ext === '.mm') {
      xcodeProject.addSourceFile(
        filePath,
        { target: xcodeProject.getFirstTarget().uuid },
        groupKey
      );
    } else {
      const fileRef = xcodeProject.addFile(filePath, groupKey);
      if (fileRef) {
        const resourcesBuildPhase = xcodeProject.pbxResourcesBuildPhaseObj(
          xcodeProject.getFirstTarget().uuid
        );

        resourcesBuildPhase.files.push({
          value: fileRef.fileRef,
          comment: `${file} in Resources`,
        });
      } else {
        console.warn(`⚠️ Could not add ${file} — fileRef was null`);
      }
    }
  } catch (err) {
    console.warn(`❌ Failed to add ${file}:`, err.message);
  }
});


    // Add build settings
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    Object.keys(configurations).forEach(config => {
      const buildSettings = configurations[config].buildSettings;
      if (buildSettings) {
        buildSettings['SWIFT_VERSION'] = '5.0';
        buildSettings['CLANG_ENABLE_MODULES'] = 'YES';
        buildSettings['ENABLE_BITCODE'] = 'NO';
        buildSettings['FRAMEWORK_SEARCH_PATHS'] =
          '"$(inherited) $(SRCROOT)/Pods/MediaPipeTasksVision $(PODS_XCFRAMEWORKS_BUILD_DIR)/MediaPipeTasksVision"';
      }
    });

    return props;
  });
};

module.exports = withXcodeModifications;

//TODO: find out how to link the .task file to ios/ folder