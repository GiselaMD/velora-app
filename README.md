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

```sh
Copy
Edit
git clone https://github.com/yourname/velora-app
cd velora-app
npx expo install
npx expo run:ios
``` 
⚠️ Make sure pose_landmarker_full.task is bundled inside ios/ and correctly referenced in the Swift module.

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

