// CameraInterface.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  AppState,
  AppStateStatus,
  Platform,
  StyleSheet, 
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  CameraDevice,
  Frame,
} from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { router } from "expo-router";

// Assuming these are correctly typed and imported
import { processPoseEstimation } from '../plugins/frameProcessor';
import PoseOverlay, { PoseData } from '../components/PoseOverlay';

// Define the expected structure of a landmark and the pose data
interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility: number;
}
type PoseResultType = Landmark[][];
interface FrameInfoData {
  poseResult: PoseResultType | undefined;
  frameOrientation: Frame['orientation'] | undefined;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraInterface(): JSX.Element {
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === 'active');
  const { hasPermission, requestPermission } = useCameraPermission();
  const device: CameraDevice | undefined = useCameraDevice('front');

  const poseDataShared: SharedValue<PoseData> = useSharedValue<PoseData>({
    rawLandmarks: [],
    totalLandmarks: 0,
    frameOrientation: undefined,
  });

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppIsActive(nextAppState === 'active');
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const updateFrameInfoWithJS = useCallback((data: FrameInfoData) => {
    const { poseResult: rawPoseResult, frameOrientation } = data;
    // ... (your existing logic for updating poseDataShared)
    if (rawPoseResult && Array.isArray(rawPoseResult) && rawPoseResult.length > 0) {
      const landmarksArray = rawPoseResult[0];
      if (landmarksArray && landmarksArray.length > 0) {
        poseDataShared.value = {
          rawLandmarks: rawPoseResult,
          totalLandmarks: landmarksArray.length,
          frameOrientation: frameOrientation,
        };
      } else {
        poseDataShared.value = { rawLandmarks: [], totalLandmarks: 0, frameOrientation: frameOrientation };
      }
    } else {
      poseDataShared.value = { rawLandmarks: [], totalLandmarks: 0, frameOrientation: frameOrientation };
    }
  }, [poseDataShared]);

  const runUpdateFrameInfo = useRunOnJS(updateFrameInfoWithJS, [updateFrameInfoWithJS]);

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    try {
      const result: PoseResultType | undefined = processPoseEstimation(frame) as PoseResultType | undefined;
      runUpdateFrameInfo({ poseResult: result, frameOrientation: frame.orientation });
    } catch (error: any) {
      console.error('Frame processor error:', error.message || error);
    }
  }, [runUpdateFrameInfo]);

  const handleExit = (): void => {
    router.replace("/");
  };

  // Your logs confirmed these conditions are met when camera should be visible
  // console.log("Has Permission:", hasPermission);
  // console.log("Device found:", device ? `ID: ${device.id}` : "No device");
  // console.log("App is Active:", appIsActive);

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center my-5 text-base px-5">
          Camera access is required to continue.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-purple-700 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5"
        >
          <Text className="text-white text-center text-base font-medium">
            Grant Camera Access
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleExit}
          className="bg-gray-600 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5"
        >
          <Text className="text-white text-center text-base font-medium">
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center my-5 text-base px-5">
          No camera device found.
        </Text>
        <TouchableOpacity
          onPress={handleExit}
          className="bg-gray-600 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5"
        >
          <Text className="text-white text-center text-base font-medium">
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {device && appIsActive ? ( // Ensure appIsActive is used here
        <Camera
          style={StyleSheet.absoluteFill} // Apply StyleSheet.absoluteFill directly
          device={device}
          isActive={appIsActive} // Use your appIsActive state
          frameProcessor={frameProcessor} // Include your frameProcessor
          // For frame processors, pixelFormat might be needed depending on the model:
          // pixelFormat="yuv" // or "rgb"
        />
      ) : (
         // Fallback UI if camera isn't active or device not ready
        <View className="absolute inset-0 justify-center items-center">
          <Text className="text-white text-lg">
            {appIsActive ? "Camera initializing or not available..." : "App is not active. Camera paused."}
          </Text>
        </View>
      )}
      <PoseOverlay
        poseDataShared={poseDataShared}
        devicePosition={device.position}
        currentScreenWidth={screenWidth}
        currentScreenHeight={screenHeight}
      />
      <SafeAreaView className={`absolute inset-0 justify-between ${Platform.OS === 'android' ? 'pt-4' : ''}`}>
        <View className="w-full pt-2.5 px-2.5 items-start">
          <TouchableOpacity
            onPress={handleExit}
            className="bg-black/60 p-2.5 rounded-full w-10 h-10 justify-center items-center"
          >
            <Text className="text-white text-lg font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
