## Feature-Based Architecture 

### Overview

Organized by features/modules, making it easy to find and maintain related code. Each feature contains its own components, hooks, and utilities.

### Folder Structure

```
velora-app/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home/Welcome screen
│   │   ├── history.tsx          # Analysis history
│   │   └── _layout.tsx          # Tab layout
│   ├── (stack)/                 # Stack navigation
│   │   ├── bike-type.tsx        # Bike selection
│   │   ├── fit-assessment.tsx   # Setup instructions
│   │   ├── camera.tsx           # Camera analysis
│   │   ├── results.tsx          # Results display
│   │   └── _layout.tsx          # Stack layout
│   └── _layout.tsx              # Root layout
│
├── src/
│   ├── features/
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   │   ├── WelcomeCarousel.tsx
│   │   │   │   └── OnboardingSlide.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useOnboarding.ts
│   │   │   └── constants/
│   │   │       └── slides.ts
│   │   │
│   │   ├── bike-selection/
│   │   │   ├── components/
│   │   │   │   ├── BikeTypeCard.tsx
│   │   │   │   └── BikeComparisonModal.tsx
│   │   │   ├── types/
│   │   │   │   └── bike.types.ts
│   │   │   └── constants/
│   │   │       └── bikeConfigs.ts
│   │   │
│   │   ├── camera-capture/
│   │   │   ├── components/
│   │   │   │   ├── CameraView.tsx
│   │   │   │   ├── PoseOverlay.tsx
│   │   │   │   └── CaptureControls.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCamera.ts
│   │   │   │   └── useFrameProcessor.ts
│   │   │   └── utils/
│   │   │       └── cameraHelpers.ts
│   │   │
│   │   ├── pose-analysis/
│   │   │   ├── services/
│   │   │   │   ├── AngleCalculator.ts
│   │   │   │   ├── PedalStrokeAnalyzer.ts
│   │   │   │   └── PoseProcessor.ts
│   │   │   ├── hooks/
│   │   │   │   └── usePoseAnalysis.ts
│   │   │   └── types/
│   │   │       └── pose.types.ts
│   │   │
│   │   ├── bike-fitting/
│   │   │   ├── services/
│   │   │   │   ├── BikeFittingEngine.ts
│   │   │   │   ├── PullingPhaseAnalyzer.ts  # BDC analysis
│   │   │   │   ├── PushingPhaseAnalyzer.ts  # TDC analysis
│   │   │   │   └── RecommendationEngine.ts
│   │   │   ├── constants/
│   │   │   │   ├── optimalRanges.ts
│   │   │   │   └── adjustmentRules.ts
│   │   │   └── types/
│   │   │       └── fitting.types.ts
│   │   │
│   │   ├── audio-guidance/
│   │   │   ├── services/
│   │   │   │   ├── AudioSystem.ts
│   │   │   │   └── AudioOrchestrator.ts
│   │   │   ├── hooks/
│   │   │   │   └── useAudioGuidance.ts
│   │   │   └── constants/
│   │   │       └── audioScripts.ts
│   │   │
│   │   └── results/
│   │       ├── components/
│   │       │   ├── AngleVisualization.tsx
│   │       │   ├── AdjustmentCard.tsx
│   │       │   └── ResultsSummary.tsx
│   │       ├── hooks/
│   │       │   └── useResults.ts
│   │       └── utils/
│   │           └── resultFormatters.ts
│   │
│   ├── core/
│   │   ├── components/           # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/               # Shared hooks
│   │   │   ├── useAsyncStorage.ts
│   │   │   └── usePermissions.ts
│   │   ├── utils/               # Shared utilities
│   │   │   ├── angles.ts
│   │   │   └── formatting.ts
│   │   └── constants/           # App-wide constants
│   │       ├── colors.ts
│   │       └── dimensions.ts
│   │
│   ├── native/                  # Native modules
│   │   ├── ios/
│   │   │   └── MediaPipeModule.swift
│   │   └── android/
│   │       └── MediaPipeModule.kt
│   │
│   └── types/                   # Global type definitions
│       └── global.d.ts
│
├── assets/                      # Images, fonts, etc.
├── app.json                     # Expo configuration
└── package.json

```

### Key Benefits

- Clear separation of concerns
- Easy to locate feature-specific code
- Scalable as features grow
- Natural code splitting boundaries