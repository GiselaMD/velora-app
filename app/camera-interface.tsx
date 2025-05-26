// CameraInterface.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions, AppState,
} from "react-native";
import {
  Camera, useCameraDevice, useCameraPermission,
  useFrameProcessor
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { useSharedValue } from 'react-native-reanimated';
import { router } from "expo-router";

import { processPoseEstimation } from '../plugins/frameProcessor';
import PoseOverlay from '../components/PoseOverlay';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraInterface() {
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === 'active');
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  const poseDataShared = useSharedValue({
    rawLandmarks: [],
    totalLandmarks: 0,
    frameOrientation: undefined, // Initialize frameOrientation
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppIsActive(nextAppState === 'active');
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const updateFrameInfoWithJS = useCallback((data) => {
    const { poseResult: rawPoseResult, frameOrientation } = data; // Destructure data

    if (rawPoseResult && Array.isArray(rawPoseResult) && rawPoseResult.length > 0) {
      const landmarksArray = rawPoseResult[0];
      if (landmarksArray && landmarksArray.length > 0) {
        poseDataShared.value = {
          rawLandmarks: rawPoseResult,
          totalLandmarks: landmarksArray.length,
          frameOrientation: frameOrientation, // Store frameOrientation
        };
      } else {
        poseDataShared.value = {
          rawLandmarks: [],
          totalLandmarks: 0,
          frameOrientation: frameOrientation,
        };
      }
    } else {
      poseDataShared.value = {
        rawLandmarks: [],
        totalLandmarks: 0,
        frameOrientation: frameOrientation,
      };
    }
  }, [poseDataShared]);

  const runUpdateFrameInfo = useRunOnJS(updateFrameInfoWithJS, [updateFrameInfoWithJS]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    try {
      const result = processPoseEstimation(frame);
      // Pass both pose result and frame orientation to the JS thread
      runUpdateFrameInfo({ poseResult: result, frameOrientation: frame.orientation });
    } catch (error) {
      console.error('Frame processor error:', error.message || error);
    }
  }, [runUpdateFrameInfo]);

  const handleExit = () => {
    router.replace("/");
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required to continue.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExit} style={[styles.permissionButton, styles.exitButton]}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>No camera device found.</Text>
        <TouchableOpacity onPress={handleExit} style={[styles.permissionButton, styles.exitButton]}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {device && appIsActive && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      )}
      <PoseOverlay
        poseDataShared={poseDataShared}
        devicePosition={device.position}
        currentScreenWidth={screenWidth}
        currentScreenHeight={screenHeight}
      />
      <SafeAreaView style={styles.overlayControls}>
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
  container: { flex: 1, backgroundColor: 'black' },
  permissionText: { color: 'white', textAlign: 'center', marginVertical: 20, fontSize: 16, paddingHorizontal: 20 },
  permissionButton: {
    backgroundColor: '#6D28D9', marginHorizontal: 30, marginVertical: 10,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
    shadowRadius: 3.84, elevation: 5,
  },
  exitButton: { backgroundColor: '#555' },
  permissionButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  overlayControls: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: { width: '100%', paddingTop: 10, paddingHorizontal: 10, alignItems: 'flex-start' },
  closeButton: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)', padding: 10, borderRadius: 20,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
  closeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});