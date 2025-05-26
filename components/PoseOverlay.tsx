// PoseOverlay.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

const AnimatedLineComponent = Animated.createAnimatedComponent(Line);

const POSE_CONNECTIONS = [ /* ... your existing connections ... */
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

const getScreenCoordinates = (landmarkX, landmarkY, frameOrientation, overlayWidth, overlayHeight) => {
  'worklet';
  let screenX = 0;
  let screenY = 0;

  switch (frameOrientation) {
    case 'portrait':
      screenX = landmarkX * overlayWidth;
      screenY = landmarkY * overlayHeight;
      break;
    case 'landscape-left':
      screenX = landmarkY * overlayWidth;
      screenY = (1 - landmarkX) * overlayHeight;
      break;
    case 'landscape-right':
      screenX = (1 - landmarkY) * overlayWidth;
      screenY = landmarkX * overlayHeight;
      break;
    case 'portrait-upside-down':
      screenX = (1 - landmarkX) * overlayWidth;
      screenY = (1 - landmarkY) * overlayHeight;
      break;
    default:
      screenX = landmarkX * overlayWidth;
      screenY = landmarkY * overlayHeight;
  }
    return { x: screenX, y: screenY - 50 }; //header offset -50
};

const AnimatedConnectionLine = React.memo(({
  poseDataShared, index1, index2, overlayWidth,
  overlayHeight, devicePosition, strokeColor = "#4ADE80", strokeWidth = "2"
}) => {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const currentPoseData = poseDataShared.value;
    const landmarks = currentPoseData?.rawLandmarks?.[0];
    const frameOrientation = currentPoseData?.frameOrientation;

    if (!landmarks || !frameOrientation ||
        index1 >= landmarks.length || !landmarks[index1] ||
        index2 >= landmarks.length || !landmarks[index2] ||
        landmarks[index1].visibility < 0.5 || landmarks[index2].visibility < 0.5) {
      return { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 };
    }

    const p1Raw = landmarks[index1];
    const p2Raw = landmarks[index2];

    let p1Screen = getScreenCoordinates(p1Raw.x, p1Raw.y, frameOrientation, overlayWidth, overlayHeight);
    let p2Screen = getScreenCoordinates(p2Raw.x, p2Raw.y, frameOrientation, overlayWidth, overlayHeight);

    // Mirroring logic based on devicePosition has been removed here.
    // The getScreenCoordinates should provide coordinates that align with the visual preview.

    return {
      x1: p1Screen.x, y1: p1Screen.y, x2: p2Screen.x, y2: p2Screen.y,
      stroke: strokeColor, strokeWidth: strokeWidth, opacity: 1,
    };
  });
  return <AnimatedLineComponent animatedProps={animatedProps} />;
});

const AnimatedLandmarkPoint = React.memo(({
  poseDataShared, landmarkIndex, overlayWidth, overlayHeight, devicePosition
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const currentPoseData = poseDataShared.value;
    const landmark = currentPoseData?.rawLandmarks?.[0]?.[landmarkIndex];
    const frameOrientation = currentPoseData?.frameOrientation;

    if (!landmark || !frameOrientation ||
        landmarkIndex >= (currentPoseData?.rawLandmarks?.[0]?.length || 0) ||
        landmark.visibility < 0.5) {
      return { opacity: 0, left: 0, top: 0, transform: [{translateX: -10000}] };
    }

    let screenCoords = getScreenCoordinates(landmark.x, landmark.y, frameOrientation, overlayWidth, overlayHeight);
    let finalX = screenCoords.x;

    // Mirroring logic based on devicePosition has been removed.
    // finalX is now directly screenCoords.x from the transformation.

    return {
      left: finalX - 4,
      top: screenCoords.y - 4,
      opacity: 1,
      transform: [{translateX: 0}],
    };
  });
  return <Animated.View style={[styles.landmarkDot, animatedStyle]} />;
});

const PoseOverlay = React.memo(({
  poseDataShared, devicePosition, currentScreenWidth, currentScreenHeight,
}) => {
  const MAX_LANDMARKS = 33;
  const landmarkIndices = Array.from({ length: MAX_LANDMARKS }, (_, i) => i);

  return (
    <View style={styles.poseOverlayContainer} pointerEvents="none">
      <Svg width={currentScreenWidth} height={currentScreenHeight} style={StyleSheet.absoluteFillObject}>
        {POSE_CONNECTIONS.map(([idx1, idx2], i) => (
          <AnimatedConnectionLine
            key={`line-${idx1}-${idx2}-${i}`}
            poseDataShared={poseDataShared} index1={idx1} index2={idx2}
            overlayWidth={currentScreenWidth} overlayHeight={currentScreenHeight}
            devicePosition={devicePosition} // Still passed, could be used for other logic if needed
          />
        ))}
      </Svg>
      {landmarkIndices.map((index) => (
        <AnimatedLandmarkPoint
          key={`dot-${index}`}
          poseDataShared={poseDataShared} landmarkIndex={index}
          overlayWidth={currentScreenWidth} overlayHeight={currentScreenHeight}
          devicePosition={devicePosition} // Still passed
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  poseOverlayContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  landmarkDot: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#F87171', borderWidth: 1, borderColor: 'white',
  },
});

export default PoseOverlay;