import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { processPoseEstimation } from '../plugins/frameProcessor';
import { router } from "expo-router";
import Svg, { Line } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const KEY_LANDMARKS = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

export default function CameraInterface() {
  const [frameInfo, setFrameInfo] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [cameraActive, setCameraActive] = useState(true);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const addLog = (message) => {
    console.log(message);
  };

  const updateFrameInfo = (info) => {
    setFrameInfo(info);
    if (info && Array.isArray(info) && info.length > 0) {
      const landmarks = info[0];
      if (landmarks && landmarks.length > 0) {
        const keyPoints = {};
        Object.entries(KEY_LANDMARKS).forEach(([name, index]) => {
          if (landmarks[index]) {
            keyPoints[name] = {
              x: landmarks[index].x,
              y: landmarks[index].y,
              visibility: landmarks[index].visibility || 0,
            };
          }
        });
        setPoseData({ detected: true, keyPoints, totalLandmarks: landmarks.length, rawLandmarks: info });
      }
    } else {
      setPoseData({ detected: false, keyPoints: {}, totalLandmarks: 0 });
    }
  };

  const addLogJS = useRunOnJS(addLog, []);
  const updateFrameInfoJS = useRunOnJS(updateFrameInfo, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    try {
      const result = processPoseEstimation(frame);
      updateFrameInfoJS(result);
    } catch (error) {
      addLogJS(`Frame processor error: ${String(error)}`);
    }
  }, []);

  const renderConnection = (landmarks, index1, index2, width, height) => {
    if (!landmarks[index1] || !landmarks[index2]) return null;
    if (landmarks[index1].visibility < 0.5 || landmarks[index2].visibility < 0.5) return null;
    const getCoord = (landmark) => {
      const x = landmark.x * width;
      return {
        x: device?.position === 'front' ? width - x : x,
        y: landmark.y * height,
      };
    };
    const p1 = getCoord(landmarks[index1]);
    const p2 = getCoord(landmarks[index2]);
    return <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#4ADE80" strokeWidth="2" />;
  };

  const renderPoseOverlay = () => {
    if (!poseData || !poseData.detected || !poseData.rawLandmarks) return null;
    const landmarks = poseData.rawLandmarks[0];
    const overlayWidth = screenWidth;
    const overlayHeight = screenHeight;
    return (
      <View style={styles.poseOverlay} pointerEvents="none">
        <Svg width={overlayWidth} height={overlayHeight} style={StyleSheet.absoluteFillObject}>
          {renderConnection(landmarks, 11, 12, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 11, 13, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 13, 15, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 12, 14, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 14, 16, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 11, 23, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 12, 24, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 23, 24, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 23, 25, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 25, 27, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 24, 26, overlayWidth, overlayHeight)}
          {renderConnection(landmarks, 26, 28, overlayWidth, overlayHeight)}
        </Svg>
        {landmarks.map((lm, i) => {
          if (lm.visibility < 0.5) return null;
          const x = lm.x * overlayWidth;
          const y = lm.y * overlayHeight;
          const finalX = device?.position === 'front' ? overlayWidth - x : x;
          return <View key={i} style={[styles.landmarkDot, { left: finalX - 4, top: y - 4 }]} />;
        })}
      </View>
    );
  };

  const handleExit = () => {
    setCameraActive(false);
    setTimeout(() => router.replace("/"), 200);
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExit} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>No camera device found</Text>
        <TouchableOpacity onPress={handleExit} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {cameraActive && (
        <Camera
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      )}
      {renderPoseOverlay()}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    margin: 10,
  },
  permissionButton: {
    backgroundColor: '#6D28D9',
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  header: {
    padding: 10,
    alignItems: 'flex-start',
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  poseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  landmarkDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
    borderWidth: 1,
    borderColor: 'white',
  },
});
