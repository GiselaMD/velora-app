// plugins/withVeloraPoseEstimation/withXcodeModifications.js
const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const PRODUCT_MODULE_NAME = 'veloraapp';
const XCODE_GROUP_NAME = 'VeloraPoseEstimation';

const SOURCE_FILES = [
  'PoseDetectorHelper.swift',
  'PoseEstimationFrameProcessorPlugin.m',
  'PoseEstimationFrameProcessorPlugin.swift',
];

const RESOURCE_FILES = [
  'pose_landmarker_full.task'
];

const withXcodeModifications = (config) => {
  return withXcodeProject(config, async (cfg) => {
    try {
      const xcodeProject = cfg.modResults;
      const projectRoot = cfg.modRequest.projectRoot;
      const mainAppTarget = xcodeProject.getFirstTarget().uuid;

      // Define paths
      const templateSourceDir = path.join(projectRoot, 'native/ios/templates');
      const targetDir = path.join(projectRoot, 'ios', PRODUCT_MODULE_NAME, XCODE_GROUP_NAME);

      // Create target directory
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`✓ Created directory: ${targetDir}`);
      }

      // Copy all files (source and resources)
      [...SOURCE_FILES, ...RESOURCE_FILES].forEach(fileName => {
        const srcPath = path.join(templateSourceDir, fileName);
        const destPath = path.join(targetDir, fileName);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`✓ Copied ${fileName}`);
        } else {
          console.warn(`⚠️ Source file not found: ${srcPath}`);
        }
      });

      // Remove existing file references and groups to avoid duplicates
      const groups = xcodeProject.hash.project.objects['PBXGroup'];
      Object.keys(groups).forEach(key => {
        if (groups[key].name === XCODE_GROUP_NAME) {
          delete groups[key];
        }
      });

      // Also clean up existing file references
      const fileRefs = xcodeProject.hash.project.objects['PBXFileReference'];
      if (fileRefs) {
        Object.keys(fileRefs).forEach(key => {
          const fileRef = fileRefs[key];
          if (fileRef.path && fileRef.path.includes(XCODE_GROUP_NAME)) {
            delete fileRefs[key];
          }
        });
      }

      // Create new group
      const newGroup = xcodeProject.addPbxGroup(
        [...SOURCE_FILES, ...RESOURCE_FILES],
        XCODE_GROUP_NAME,
        path.join(PRODUCT_MODULE_NAME, XCODE_GROUP_NAME)
      );

      // Add group to main group
      const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
      xcodeProject.addToPbxGroup(newGroup.uuid, mainGroup);

      // Add source files to compile sources
      SOURCE_FILES.forEach(fileName => {
        const filePath = path.join(PRODUCT_MODULE_NAME, XCODE_GROUP_NAME, fileName);
        
        const fileRef = xcodeProject.addFile(filePath, newGroup.uuid, {
          lastKnownFileType: fileName.endsWith('.swift') ? 'sourcecode.swift' : 
                            fileName.endsWith('.m') ? 'sourcecode.c.objc' : 
                            'file'
        });

        if (fileRef) {
          const sourcesBuildPhase = xcodeProject.pbxSourcesBuildPhaseObj(mainAppTarget);
          const alreadyInBuildPhase = sourcesBuildPhase.files.find(
            buildFile => buildFile.fileRef === fileRef.uuid
          );
          
          if (!alreadyInBuildPhase) {
            xcodeProject.addToPbxBuildFileSection(fileRef);
            xcodeProject.addToPbxSourcesBuildPhase(fileRef);
            console.log(`✓ Added ${fileName} to compile sources`);
          }
        }
      });

      // Add resource files to Copy Bundle Resources
      RESOURCE_FILES.forEach(fileName => {
        const filePath = path.join(PRODUCT_MODULE_NAME, XCODE_GROUP_NAME, fileName);
        
        const fileRef = xcodeProject.addFile(filePath, newGroup.uuid, {
          lastKnownFileType: 'file'
        });

        if (fileRef) {
          const resourcesBuildPhase = xcodeProject.pbxResourcesBuildPhaseObj(mainAppTarget);
          const alreadyInBuildPhase = resourcesBuildPhase.files.find(
            buildFile => buildFile.fileRef === fileRef.uuid
          );
          
          if (!alreadyInBuildPhase) {
            xcodeProject.addToPbxBuildFileSection(fileRef);
            xcodeProject.addToPbxResourcesBuildPhase(fileRef);
            console.log(`✓ Added ${fileName} to Copy Bundle Resources`);
          }
        }
      });

      // Configure Swift settings
      const configurations = xcodeProject.pbxXCBuildConfigurationSection();
      Object.values(configurations).forEach(config => {
        if (config.buildSettings) {
          config.buildSettings['SWIFT_VERSION'] = '5.0';
          config.buildSettings['CLANG_ENABLE_MODULES'] = 'YES';
          config.buildSettings['SWIFT_OBJC_BRIDGING_HEADER'] = 
            `${PRODUCT_MODULE_NAME}/${PRODUCT_MODULE_NAME}-Bridging-Header.h`;
        }
      });

      return cfg;
    } catch (error) {
      console.error('❌ Error in withXcodeModifications:', error);
      throw error;
    }
  });
};

module.exports = withXcodeModifications;