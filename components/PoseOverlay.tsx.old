import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps, SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { CameraPosition, Orientation } from 'react-native-vision-camera'; // Import FrameOrientation

// Define the structure of a landmark
interface Landmark {
  x: number;
  y: number;
  z?: number; // Optional, depending on your pose estimation model
  visibility: number; // Typically a confidence score (0.0 to 1.0)
}

// Define the structure for shared pose data
export interface PoseData {
  rawLandmarks: Landmark[][]; // Array of poses, each pose is an array of landmarks
  totalLandmarks: number;
  frameOrientation: Orientation | undefined;
}

const POSE_CONNECTIONS: [number, number][] = [
  // Head
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // Torso
  [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
  // Arms
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], // Left
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], // Right
  // Legs
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // Left
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32], // Right
];

const AnimatedLineComponent = Animated.createAnimatedComponent(Line);

interface ScreenCoordinates {
  x: number;
  y: number;
}

const getScreenCoordinates = (
  landmarkX: number,
  landmarkY: number,
  frameOrientation: Orientation | undefined,
  overlayWidth: number,
  overlayHeight: number
): ScreenCoordinates => {
  'worklet';
  let screenX = 0;
  let screenY = 0;

  switch (frameOrientation) {
    case 'portrait':
      screenX = landmarkX * overlayWidth;
      screenY = landmarkY * overlayHeight;
      break;
    case 'landscape-left': // Device rotated CCW
      screenX = landmarkY * overlayWidth;
      screenY = (1 - landmarkX) * overlayHeight;
      break;
    case 'landscape-right': // Device rotated CW
      screenX = (1 - landmarkY) * overlayWidth;
      screenY = landmarkX * overlayHeight;
      break;
    case 'portrait-upside-down':
      screenX = (1 - landmarkX) * overlayWidth;
      screenY = (1 - landmarkY) * overlayHeight;
      break;
    default: // Assume portrait if undefined
      screenX = landmarkX * overlayWidth;
      screenY = landmarkY * overlayHeight;
  }
  return { x: screenX, y: screenY - 50 }; // header offset -50
};

interface AnimatedConnectionLineProps {
  poseDataShared: SharedValue<PoseData>;
  index1: number;
  index2: number;
  overlayWidth: number;
  overlayHeight: number;
  devicePosition?: CameraPosition; // Optional as it's not used for mirroring now
  strokeColor?: string;
  strokeWidth?: string;
}

// eslint-disable-next-line react/display-name
const AnimatedConnectionLine: React.FC<AnimatedConnectionLineProps> = React.memo(
  ({
    poseDataShared,
    index1,
    index2,
    overlayWidth,
    overlayHeight,
    strokeColor = "#6D28D9", 
    strokeWidth = "2",
  }) => {
    const animatedProps = useAnimatedProps((): Partial<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> => {
      'worklet';
      const currentPoseData = poseDataShared.value;
      const landmarks = currentPoseData?.rawLandmarks?.[0]; // Assuming first pose
      const frameOrientation = currentPoseData?.frameOrientation;

      if (
        !landmarks ||
        !frameOrientation ||
        index1 >= landmarks.length ||
        !landmarks[index1] ||
        index2 >= landmarks.length ||
        !landmarks[index2] ||
        landmarks[index1].visibility < 0.5 ||
        landmarks[index2].visibility < 0.5
      ) {
        return { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 };
      }

      const p1Raw = landmarks[index1];
      const p2Raw = landmarks[index2];

      const p1Screen = getScreenCoordinates(p1Raw.x, p1Raw.y, frameOrientation, overlayWidth, overlayHeight);
      const p2Screen = getScreenCoordinates(p2Raw.x, p2Raw.y, frameOrientation, overlayWidth, overlayHeight);

      return {
        x1: p1Screen.x,
        y1: p1Screen.y,
        x2: p2Screen.x,
        y2: p2Screen.y,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: 1,
        // stroke and strokeWidth are not valid here; set them on the component instead
      };
    });
    return <AnimatedLineComponent animatedProps={animatedProps} />;
  }
);

interface AnimatedLandmarkPointProps {
  poseDataShared: SharedValue<PoseData>;
  landmarkIndex: number;
  overlayWidth: number;
  overlayHeight: number;
  devicePosition?: CameraPosition; // Optional
}

// eslint-disable-next-line react/display-name
const AnimatedLandmarkPoint: React.FC<AnimatedLandmarkPointProps> = React.memo(
  ({
    poseDataShared,
    landmarkIndex,
    overlayWidth,
    overlayHeight,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      'worklet';
      const currentPoseData = poseDataShared.value;
      const landmark = currentPoseData?.rawLandmarks?.[0]?.[landmarkIndex];
      const frameOrientation = currentPoseData?.frameOrientation;

      if (
        !landmark ||
        !frameOrientation ||
        landmarkIndex >= (currentPoseData?.rawLandmarks?.[0]?.length || 0) ||
        landmark.visibility < 0.5
      ) {
        return { opacity: 0, left: 0, top: 0, transform: [{ translateX: -10000 }] };
      }

      const screenCoords = getScreenCoordinates(landmark.x, landmark.y, frameOrientation, overlayWidth, overlayHeight);
      const finalX = screenCoords.x;

      return {
        left: finalX - 4, // Center the dot (width/2)
        top: screenCoords.y - 4, // Center the dot (height/2)
        opacity: 1,
        transform: [{ translateX: 0 }], // Reset transform if previously hidden
      };
    });
    return <Animated.View className="absolute w-2 h-2 rounded-full bg-blue-400 border border-white" style={animatedStyle} />;
  }
);

interface PoseOverlayProps {
  poseDataShared: SharedValue<PoseData>;
  devicePosition?: CameraPosition;
  currentScreenWidth: number;
  currentScreenHeight: number;
}

// eslint-disable-next-line react/display-name
const PoseOverlay: React.FC<PoseOverlayProps> = React.memo(
  ({
    poseDataShared,
    devicePosition,
    currentScreenWidth,
    currentScreenHeight,
  }) => {
    const MAX_LANDMARKS = 33; // Assuming MediaPipe Pose V2
    const landmarkIndices = Array.from({ length: MAX_LANDMARKS }, (_, i) => i);

    return (
      <View className="absolute inset-0" pointerEvents="none">
        <Svg width={currentScreenWidth} height={currentScreenHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
          {POSE_CONNECTIONS.map(([idx1, idx2], i) => (
            <AnimatedConnectionLine
              key={`line-${idx1}-${idx2}-${i}`}
              poseDataShared={poseDataShared}
              index1={idx1}
              index2={idx2}
              overlayWidth={currentScreenWidth}
              overlayHeight={currentScreenHeight}
              devicePosition={devicePosition}
            />
          ))}
        </Svg>
        {landmarkIndices.map((index) => (
          <AnimatedLandmarkPoint
            key={`dot-${index}`}
            poseDataShared={poseDataShared}
            landmarkIndex={index}
            overlayWidth={currentScreenWidth}
            overlayHeight={currentScreenHeight}
            devicePosition={devicePosition}
          />
        ))}
      </View>
    );
  }
);

export default PoseOverlay;