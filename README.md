# 🚴‍♀️ Velora

> Real-time bike fit analysis powered by AI 🧠 + Native performance ⚡️

Velora is a modern React Native app built with [Expo](https://expo.dev), featuring native integration with [MediaPipe](https://developers.google.com/mediapipe) for high-performance human pose estimation (HPE). Designed for athletes and bike enthusiasts, Velora delivers instant feedback on your bike fit to help you optimize comfort, power, and performance.

---

## ✨ Features

- 📹 **Real-Time Pose Detection** using native MediaPipe integration
- 💡 **AI-Powered Fit Analysis** with clean results screen and smart UI
- 🚴 **Side-view Pose Capture** flow optimized for indoor fitting
- ⚙️ **Custom Native Modules** for blazing-fast performance
- 🧪 **Typed with TypeScript** & styled with Tailwind
- 🧼 **Clean Apple-style UI** with animations and interaction feedback
- 🌐 Built on **Expo Router v2** for scalable navigation

---

## 🧠 Stack

| Layer         | Tech                                |
|--------------|--------------------------------------|
| UI/UX        | Expo Router, React Native, Tailwind  |
| Native       | MediaPipe (iOS SDK), Swift + JSI     |
| Animation    | React Native Reanimated, Framer Motion |
| Dev Tools    | TypeScript, ESLint, Prettier         |
| Build        | EAS (Expo Application Services)      |

---

## 📁 Folder Structure
```
velora-app/
├── app/
├── components/
├── assets/
├── constants/
├── hooks/
├── modules/
├── scripts/
├── styles/
├── types/
├── ios/
├── android/
├── config files
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js
│   └── prettier.config.js
└── type definitions
    ├── expo-env.d.ts
    └── nativewind-env.d.ts
```

Here's what each main directory typically contains:
   app/: Contains the main application screens and routing logic using the new Expo Router

   components/: Reusable UI components

   assets/: Static files like images, fonts, etc.

   constants/: Application-wide constants and configurations

   hooks/: Custom React hooks

   modules/: Larger feature modules or external integrations

   scripts/: Utility scripts for development

   styles/: Style-related files

   types/: TypeScript type definitions

   ios/ & android/: Native platform-specific code

---

## 🔌 Native Pose Estimation Module

- Located at: `modules/mediapipe-pose-estimation`
- Written in Swift using [MediaPipeTasksVision](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- Exposed to JS using [`expo-modules`](https://docs.expo.dev/modules/overview/)

Example Swift API:

```swift
Function("detectPose") { (imageBase64: String) -> [[[String: Any]]] in
  ...
}
```

Example usage:

```js
import PoseLandmarker from 'expo-modules-core';

const result = await PoseLandmarker.detectPose(imageBase64);
```

---

## 🛠️ Getting Started

## Velora Bike Fitting App - Native Modules Setup

This README explains how the native modules are set up for the Velora bike fitting app, which uses Expo SDK 53, React Native Vision Camera, and MediaPipe for human pose estimation.

## Architecture Overview

The app uses the following components:
- **Expo SDK 53** with custom native modules
- **React Native Vision Camera** for camera access
- **MediaPipe** for pose estimation
- Custom native Swift code for processing the camera frames

## Directory Structure

```
project-root/
├── native/
│   └── ios/
│       └── templates/
│           ├── PoseDetectorHelper.swift
│           ├── PoseEstimationPlugin.swift
│           └── VeloraPoseEstimation.m
├── plugins/
│   └── withVeloraPoseEstimation/
│       ├── index.js
│       ├── package.json
│       ├── withXcodeModifications.js
│       ├── withMediaPipePodfileMod.js
│       └── withModelPostInstall.js
├── scripts/
│   └── setup-native.js
├── app.json
└── package.json
```

## How It Works

The setup consists of several parts working together:

1. **Template Files**: Source Swift and Objective-C files in `native/ios/templates/`
2. **Expo Config Plugins**: Custom plugins that modify the iOS native project
   - `withXcodeModifications.js`: Adds the Swift files to the Xcode project
   - `withMediaPipePodfileMod.js`: Adds MediaPipe dependency to Podfile
   - `withModelPostInstall.js`: Downloads the MediaPipe model if needed
3. **Setup Script**: A Node.js script that runs after prebuild to copy files and download models
4. **Build Hooks**: Configured in app.json to run scripts at the right time

## Workflow

When you develop the app, follow this workflow:

1. **Initial Setup**:
   ```bash
   npm install
   ```

2. **Building the App**:
   ```bash
   # Clean build (removes ios folder)
   npm run clean
   
   # Run prebuild to generate ios project
   npx expo prebuild --platform ios
   
   # The setup-native.js script will run automatically after prebuild
   # Or you can run it manually:
   node scripts/setup-native.js
   
   # Build and run the iOS app
   npx expo run:ios
   ```

## How the Plugin Works

The plugin system consists of three main components:

1. **withXcodeModifications.js**:
   - Copies template files from `native/ios/templates` to `ios/VeloraPoseEstimation`
   - Adds the files to the Xcode project
   - Creates a build phase script to copy the model file to the app bundle
   - Sets necessary build settings for Swift and MediaPipe

2. **withMediaPipePodfileMod.js**:
   - Adds the MediaPipe dependency to the Podfile
   - Sets correct version and configuration

3. **withModelPostInstall.js**:
   - Downloads the MediaPipe model if it doesn't exist
   - Ensures it's in the correct location

## Manual Actions (if needed)

If the automated setup doesn't work completely, you may need to:

1. **Add the model to the app bundle manually**:
   - Open Xcode
   - Add a "Copy Files" build phase
   - Set the destination to "Resources"
   - Add the `pose_landmarker_full.task` file

2. **Add MediaPipe dependency manually**:
   - Open the Podfile and add:
     ```ruby
     pod 'MediaPipeTasksVision', '0.10.12'
     ```
   - Run `pod install` in the ios directory

## Troubleshooting

1. **Model file not found errors**:
   - Check if the file exists in `ios/VeloraPoseEstimation/pose_landmarker_full.task`
   - Verify that the build phase script exists and is copying the file correctly

2. **MediaPipe framework not found**:
   - Check that the Podfile includes the MediaPipe dependency
   - Run `pod install` in the ios directory

3. **Swift compilation errors**:
   - Make sure the Swift version is set to 5.0 in build settings
   - Verify that the Swift files are correctly added to the project

## Key Files

The key files for the native module are:

1. **VeloraPoseEstimation.m**:
   - Objective-C module that bridges Swift to React Native
   - Registers the frame processor plugin

2. **PoseEstimationPlugin.swift**:
   - Implements the Vision Camera frame processor
   - Processes frames and returns pose data to JavaScript

3. **PoseDetectorHelper.swift**:
   - Handles the MediaPipe pose detection
   - Manages the pose landmark model

## Tips for Further Development

1. When modifying Swift code:
   - Edit files in `native/ios/templates`
   - Run the setup script to copy them to the iOS project
   - Rebuild the app

2. For better performance:
   - Adjust processing interval in `PoseEstimationPlugin.swift`
   - Tune detection confidence thresholds

3. To add additional MediaPipe models:
   - Add them to the template directory
   - Update the setup script and build phases

## Developer Commands

- `npm run clean`: Remove the iOS and Android directories
- `npx expo prebuild`: Regenerate the native project
- `node scripts/setup-native.js`: Set up native modules manually
- `npx expo run:ios`: Build and run the iOS app
- `npm run fullbuild`: Clean, prebuild, and run in one command


---

### 📸 Pose Capture Tips
 - Ensure the bike is level and fully visible on screen

 - Use a side view angle for best results

 - Camera should remain steady for accurate detection

 ---

 ### 🧪 Testing
 ```sh
 # Run unit tests (Jest)
npm test

# Lint your code
npm run lint
```

### 👩‍💻 Author
Made with ❤️ by @GiselaMD

