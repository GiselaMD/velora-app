// PoseOverlay.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

const AnimatedLineComponent = Animated.createAnimatedComponent(Line);

// Adjust these indices based on YOUR specific pose model's output.
const POSE_CONNECTIONS = [
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

const AnimatedConnectionLine = React.memo(({
  poseDataShared, index1, index2, overlayWidth,
  overlayHeight, devicePosition, strokeColor = "#4ADE80", strokeWidth = "2"
}) => {
  const animatedProps = useAnimatedProps(() => {
    const landmarks = poseDataShared.value?.rawLandmarks?.[0];
    if (!landmarks || index1 >= landmarks.length || !landmarks[index1] ||
        index2 >= landmarks.length || !landmarks[index2] ||
        landmarks[index1].visibility < 0.5 || landmarks[index2].visibility < 0.5) {
      return { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 };
    }
    const getCoord = (landmark) => {
      const x = landmark.x * overlayWidth;
      return {
        xPos: devicePosition === 'front' ? overlayWidth - x : x,
        yPos: landmark.y * overlayHeight,
      };
    };
    const p1 = getCoord(landmarks[index1]);
    const p2 = getCoord(landmarks[index2]);
    return {
      x1: p1.xPos, y1: p1.yPos, x2: p2.xPos, y2: p2.yPos,
      stroke: strokeColor, strokeWidth: strokeWidth, opacity: 1,
    };
  });
  return <AnimatedLineComponent animatedProps={animatedProps} />;
});

const AnimatedLandmarkPoint = React.memo(({
  poseDataShared, landmarkIndex, overlayWidth, overlayHeight, devicePosition
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const landmark = poseDataShared.value?.rawLandmarks?.[0]?.[landmarkIndex];
    if (!landmark || landmarkIndex >= (poseDataShared.value?.rawLandmarks?.[0]?.length || 0) || landmark.visibility < 0.5) {
      return { opacity: 0, transform: [{ translateX: -10000 }] };
    }
    const x = landmark.x * overlayWidth;
    const y = landmark.y * overlayHeight;
    const finalX = devicePosition === 'front' ? overlayWidth - x : x;
    return {
      left: finalX - 4, top: y - 4, opacity: 1,
      transform: [{ translateX: 0 }],
    };
  });
  return <Animated.View style={[styles.landmarkDot, animatedStyle]} />;
});

const PoseOverlay = React.memo(({
  poseDataShared, devicePosition, currentScreenWidth, currentScreenHeight,
}) => {
  // This should be the maximum number of landmarks your specific model provides.
  const MAX_LANDMARKS = 33; // For the mock frameProcessor, we used 33. Verify for your model!
  const landmarkIndices = Array.from({ length: MAX_LANDMARKS }, (_, i) => i);

  return (
    <View style={styles.poseOverlayContainer} pointerEvents="none">
      <Svg width={currentScreenWidth} height={currentScreenHeight} style={StyleSheet.absoluteFillObject}>
        {POSE_CONNECTIONS.map(([idx1, idx2], i) => (
          <AnimatedConnectionLine
            key={`line-${idx1}-${idx2}-${i}`}
            poseDataShared={poseDataShared} index1={idx1} index2={idx2}
            overlayWidth={currentScreenWidth} overlayHeight={currentScreenHeight}
            devicePosition={devicePosition}
          />
        ))}
      </Svg>
      {landmarkIndices.map((index) => (
        <AnimatedLandmarkPoint
          key={`dot-${index}`}
          poseDataShared={poseDataShared} landmarkIndex={index}
          overlayWidth={currentScreenWidth} overlayHeight={currentScreenHeight}
          devicePosition={devicePosition}
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