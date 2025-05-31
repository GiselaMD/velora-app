import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  AppState,
  AppStateStatus,
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
import { useNavigation } from "expo-router";

import { processPoseEstimation } from '../../../plugins/frameProcessor';
import PoseOverlay, { PoseData } from './PoseOverlay';

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

export default function CameraView(): JSX.Element {
  const navigation = useNavigation();

  const [appIsActive, setAppIsActive] = useState(AppState.currentState === 'active');
  const { hasPermission, requestPermission } = useCameraPermission();
  const device: CameraDevice | undefined = useCameraDevice('front');
  const camera = useRef(null);

  const poseDataShared: SharedValue<PoseData> = useSharedValue<PoseData>({
    rawLandmarks: [],
    totalLandmarks: 0,
    frameOrientation: undefined,
  });

   // AppState and Permission useEffects (remain the same)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => setAppIsActive(nextAppState === 'active');
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (camera.current) {
        camera.current.close();
      }}

  }, []);

  useEffect(() => {
    if (!hasPermission) requestPermission();
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

  if (!hasPermission) {
    return (
        <SafeAreaView className="flex-1 bg-black justify-center items-center">
          <Text className="text-white text-center my-5 text-base px-5">
            Camera access is required to continue.
          </Text>
          <TouchableOpacity onPress={requestPermission} className="bg-purple-700 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5">
            <Text className="text-white text-center text-base font-medium">Grant Camera Access</Text>
          </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-600 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5">
            <Text className="text-white text-center text-base font-medium">Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
  }

  if (!device) {
    return (
        <SafeAreaView className="flex-1 bg-black justify-center items-center">
          <Text className="text-white text-center my-5 text-base px-5">No camera device found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-600 mx-7 my-2 py-3 px-5 rounded-lg items-center shadow-md w-4/5">
            <Text className="text-white text-center text-base font-medium">Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
  }

  return (
    <View className="flex-1 bg-black">
      {device && (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            ref={camera}
            device={device}
            isActive={appIsActive} // Will be false if isExiting is true
            frameProcessor={ frameProcessor}
            // orientation="portrait"
            audio={false}
          />
            <PoseOverlay
              poseDataShared={poseDataShared}
              devicePosition={device.position}
              currentScreenWidth={screenWidth}
              currentScreenHeight={screenHeight}
            />
        </>
      )}
    </View>
  );
}