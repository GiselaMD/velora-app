import React, { useEffect, useRef } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
// import MediapipePoseEstimationModule from "@/modules/mediapipe-pose-estimation/src/MediapipePoseEstimationModule"; // Import your native pose estimation module

// This loads the native plugin you defined in Swift with `@objc(PoseEstimationFrameProcessorPlugin)`
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseEstimation', {});

export function poseEstimation(frame: Frame) {
  'worklet'
  if (plugin == null) {
    console.log('❌ Plugin not initialized')
    return
  }
  const result = plugin.call(frame)
  console.log('✅ Pose result:', result)
  return result
}

export default function CameraInterface() {
  
  
  // Request camera permission
  const { hasPermission: permission, requestPermission } = useCameraPermission();

  // Get camera device
  const device = useCameraDevice('front');

  useEffect(() => {
    const requestCamPermission = async () => {
     await requestPermission();
    };
    requestCamPermission();
  }, [requestPermission]);

  const lastProcessedTime = useRef(0);

  // Frame processor to process each camera frame
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
   poseEstimation(frame); // ✅ This is your plugin's registered name

    
    // const currentTime = Date.now();
    // if (currentTime - lastProcessedTime.current < 200) {
    //   return; // Skip processing if last frame was too recent
    // }

    // // Log the frame
    // MediapipePoseEstimationModule.detectPose(frame)
    //   .then((landmarks) => {
    //     console.log("Pose Landmarks:", landmarks);
    //     lastProcessedTime.current = currentTime; // Update the last processed time
    //   })
    //   .catch((error) => {
    //     console.error("Pose estimation failed:", error);
    //   });
  }, []);




  if (!permission) {
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
        <Text className="mb-4 text-center">No camera device</Text>
      </View>
    );
  }
  

  return (
    <SafeAreaView className="flex-1">
      {device && (
        <Camera
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          // onInitialized={handleCameraReady} // Camera ready callback
        />
      )}
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
