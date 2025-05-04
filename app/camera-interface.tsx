import React, { useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';

// Initialize the plugin once
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseEstimation', {});

// Timestamp throttle
let last = Date.now();

export function poseEstimation(frame) {
  'worklet';
  if (!plugin || typeof plugin.call !== 'function') {
    console.warn('❌ Plugin not initialized');
    return;
  }

  // throttle
  const now = Date.now();
  if (now - last < 200) return;
  last = now;

  const result = plugin.call(frame);
  console.log("✅ Pose Estimation result:", result);
  return result;
}

export default function CameraInterface() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    poseEstimation(frame);
  }, []);

  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="mb-4 text-center">Camera access required</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-violet-600 px-6 py-3 rounded-full">
          <Text className="text-white font-bold text-base">Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="mb-4 text-center">No camera device found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        pixelFormat="rgb" // ✅ Ensures BGRA format (required by MediaPipe)
        frameProcessor={frameProcessor}
      />

      <TouchableOpacity
        onPress={() => {}}
        className="absolute bottom-10 left-0 right-0 items-center"
      >
        <Text className="bg-violet-600 px-6 py-3 rounded-full text-white font-bold text-base">
          Start
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
